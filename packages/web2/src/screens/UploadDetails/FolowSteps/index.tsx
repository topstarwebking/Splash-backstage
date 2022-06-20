import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./FolowSteps.module.sass";
import Icon from "../../../components/Icon";
import Loader from "../../../components/Loader";
import LoaderCircle from "../../../components/LoaderCircle";
import axios from 'axios';
import { useMeta } from "@oyster/common";

import { API_ENDPOINT } from '../../../constants';

import {
  MAX_METADATA_LEN,
  useConnection,
  MetadataCategory,
  useConnectionConfig,
  StringPublicKey,
  getAssetCostToStore,
  LAMPORT_MULTIPLIER,
  IMetadataExtension
} from '@oyster/common';

import { useWallet } from '@solana/wallet-adapter-react';
import { mintNFT } from '../../../actions';
import { MintLayout } from '@solana/spl-token';

const useArtworkFiles = (files: File[], attributes: IMetadataExtension) => {
  const [data, setData] = useState<{ image: string; animation_url: string }>({
    image: '',
    animation_url: '',
  });

  useEffect(() => {
    if (attributes.image) {
      const file = files.find(f => f.name === attributes.image);
      if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
          setData((data: any) => {
            return {
              ...(data || {}),
              image: (event.target?.result as string) || '',
            };
          });
        };
        if (file) reader.readAsDataURL(file);
      }
    }

    if (attributes.animation_url) {
      const file = files.find(f => f.name === attributes.animation_url);
      if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
          setData((data: any) => {
            return {
              ...(data || {}),
              animation_url: (event.target?.result as string) || '',
            };
          });
        };
        if (file) reader.readAsDataURL(file);
      }
    }
  }, [files, attributes]);

  return data;
};

const FolowSteps = ({ className, uploadState, attributes, files, onSucceed}) => {
  // const [uploadState, setUploadState] = useState(false);
  const [signState, setSignState] = useState(0);
  const [errorState, setErrorState] = useState(false);

  const connection = useConnection();
  const { endpoint } = useConnectionConfig();
  const wallet = useWallet();

  const [nftCreateProgress, setNFTcreateProgress] = useState<number>(0);
  const [nft, setNft] =
    useState<{ metadataAccount: StringPublicKey } | undefined>(undefined);

  const { image, animation_url } = useArtworkFiles(
    files,
    attributes,
  );

  const [cost, setCost] = useState(0);
  
  const {
    update
  } = useMeta();

  const metadata = attributes;
  useEffect(() => {
    const rentCall = Promise.all([
      connection.getMinimumBalanceForRentExemption(MintLayout.span),
      connection.getMinimumBalanceForRentExemption(MAX_METADATA_LEN),
    ]);
    if (files.length)
      getAssetCostToStore([
        ...files,
        new File([JSON.stringify(metadata)], 'metadata.json'),
      ]).then(async lamports => {
        const sol = lamports / LAMPORT_MULTIPLIER;

        // TODO: cache this and batch in one call
        const [mintRent, metadataRent] = await rentCall;
        const additionalSol = (metadataRent + mintRent) / LAMPORT_MULTIPLIER;

        // TODO: add fees based on number of transactions and signers
        setCost(sol + additionalSol);
      });
  }, [files, metadata, setCost]);

  // store files
  const mint = async () => {
    const metadata = {
      name: attributes.name,
      symbol: attributes.symbol,
      creators: attributes.creators,
      description: attributes.description,
      sellerFeeBasisPoints: attributes.seller_fee_basis_points,
      image: image,
      animation_url: animation_url,
      // attributes: attributes.attributes,
      attributes: [],
      // external_url: attributes.external_url,
      external_url: '',
      properties: {
        files: attributes.properties.files,
        // category: attributes.properties?.category,
        category: MetadataCategory.PDF,
      },
    };
    
    // setMinting(true);
    setSignState(1);

    try {
      const _nft = await mintNFT(
        connection,
        wallet,
        endpoint.name,
        files,
        metadata,
        setNFTcreateProgress,
        attributes.properties?.maxSupply,
      );


      if (_nft) setNft(_nft);
    
      const info = {
        'tokenID': _nft?.tokenID, 
        'metaData': _nft?.metaData,
        'coverData': _nft?.coverData,
        'mainData': _nft?.mainData,
        'metaDataAccount': _nft?.metadataAccount,
        'price': '0',
        'creator': metadata.creators[0].address,
        'owner':metadata.creators[0].address,
        'locked':0,
        'collectId':0,
        'name': attributes.name,
        'symbol': attributes.symbol,
        'description': attributes.description,
        'royalty': attributes.seller_fee_basis_points,
        'stock': attributes.properties?.maxSupply
      }

      await axios.post(API_ENDPOINT + "/token/mint", info);
      
      setSignState(3);
      update(undefined, undefined);
      onSucceed();
    } catch (e) {
      setSignState(2);
      alert(e);
    } finally {
      // setMinting(false);
      setSignState(0);
    }
  };

  return (
    <div className={cn(className, styles.steps)}>
      <div className={cn("h4", styles.title)}>Follow steps</div>
      <div className={styles.list}>
        <div className={cn(styles.item, styles.done)} >
          <div className={styles.head}>
            <div className={styles.icon}>
              <Icon name="upload-file" size="24" />
            </div>
            <div className={styles.details}>
              <div className={styles.info}>Prepare Metadata Ready</div>
              <div className={styles.text}>Metadata</div>
            </div>
          </div>
          <button className={cn("button done", styles.button)}>
            {
              !uploadState ?
                <Loader className={styles.loader} color="white" />
              : <>Estimated Price: {cost} SOL</>
            }
            
          </button>
        </div>
        {
          !signState &&
          <div className={styles.item}>
            <div className={styles.head}>
              <div className={styles.icon}>
                <Icon name="pencil" size="24" />
              </div>
              <div className={styles.details}>
                <div className={styles.info}>Upload files & Mint token</div>
                <div className={styles.text}>
                  Call contract method using your wallet
                </div>
              </div>
            </div>
            <button onClick={mint} className={cn(`button ${uploadState ? '' : "disabled"}`, styles.button)}>
              Start now
            </button>
          </div>
        }
        {
          signState == 1 &&
          <div className={styles.item}>
            <div className={styles.head}>
              <div className={styles.icon}>
                <LoaderCircle className={styles.loader} />
              </div>
              <div className={styles.details}>
                <div className={styles.info}>Sign sell order</div>
                <div className={styles.text}>
                  Sign sell order using your wallet
                </div>
              </div>
            </div>
            <button className={cn("button loading", styles.button)}>
              <Loader className={styles.loader} color="white" />
            </button>
          </div>
        }
        {
          signState == 2 &&
          <div className={cn(styles.item, styles.error)}>
            <div className={styles.head}>
              <div className={styles.icon}>
                <Icon name="pencil" size="24" />
              </div>
              <div className={styles.details}>
                <div className={styles.info}>Sign sell order</div>
                <div className={styles.text}>
                  Sign sell order using your wallet
                </div>
              </div>
            </div>
            <button className={cn("button error", styles.button)}>Failed</button>
          </div>
        }
        {
          signState == 3 &&
          <div className={styles.item}>
            <div className={styles.head}>
              <div className={styles.icon}>
                <Icon name="bag" size="24" />
              </div>
              <div className={styles.details}>
                <div className={styles.info}>Sign lock order</div>
                <div className={styles.text}>
                  Sign lock order using your wallet
                </div>
              </div>
            </div>
            <button className={cn("button", styles.button)}>Start now</button>
          </div>
        }
      </div>
      {
        errorState &&
          <div className={styles.note}>
            Something went wrong, please{" "}
            <a href="/#" target="_blank" rel="noopener noreferrer">
              try again
            </a>
          </div>
      }
    </div>
  );
};

export default FolowSteps;
