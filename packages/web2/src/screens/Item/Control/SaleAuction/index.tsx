import { useEffect, useState } from "react";
import cn from "classnames";
import styles from "./SaleAuction.module.sass";
import Modal from "../../../../components/Modal";
import Dropdown from "../../../../components/Dropdown";
import Loader from "../../../../components/Loader";
import { useUserArts } from '../../../../hooks';
import { API_ENDPOINT } from '../../../../constants';
import axios from 'axios';

import {
  useConnection,
  WinnerLimit,
  WinnerLimitType,
  toLamports,
  useMint,
  PriceFloor,
  PriceFloorType,
  IPartialCreateAuctionArgs,
  StringPublicKey,
  WRAPPED_SOL_MINT,
} from '@oyster/common';

import { QUOTE_MINT } from '../../../../constants';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { MintInfo } from '@solana/spl-token';
import {
  WinningConfigType,
  AmountRange,
} from '@oyster/common/dist/lib/models/metaplex/index';

import {
  createAuctionManager,
  SafetyDepositDraft,
} from '../../../../actions/createAuctionManager';

import BN from 'bn.js';
import { constants } from '@oyster/common';
import { useMeta } from '../../../../contexts';
import useWindowDimensions from '../../../../utils/layout';
import { SystemProgram } from '@solana/web3.js';
import { useTokenList } from '../../../../contexts/tokenList';
import { TokenInfo } from '@solana/spl-token-registry'

import moment from 'moment';

const { ZERO } = constants;
const items = [
  {
    title: "Auction Starts",
    value: 'Immediately',
    symbol: ''
  },
  {
    title: "Service fee",
    value: 1.5,
    symbol: '%'
  },
  {
    title: "Total bid amount",
    value: 0,
    symbol:"SOL"
  },
];

enum AuctionCategory {
  InstantSale,
  Limited,
  Single,
  Open,
  Tiered,
}

enum InstantSaleType {
  Limited,
  Single,
  Open,
}

interface TierDummyEntry {
  safetyDepositBoxIndex: number;
  amount: number;
  winningConfigType: WinningConfigType;
}

interface Tier {
  items: (TierDummyEntry | {})[];
  winningSpots: number[];
}
interface TieredAuctionState {
  items: SafetyDepositDraft[];
  tiers: Tier[];
  participationNFT?: SafetyDepositDraft;
}

interface AuctionState {
  // Min price required for the item to sell
  reservationPrice: number;

  // listed NFTs
  items: SafetyDepositDraft[];
  participationNFT?: SafetyDepositDraft;
  participationFixedPrice?: number;
  // number of editions for this auction (only applicable to limited edition)
  editions?: number;

  // date time when auction should start UTC+0
  startDate?: Date;

  // suggested date time when auction should end UTC+0
  endDate?: Date;

  //////////////////
  category: AuctionCategory;

  price?: number;
  priceFloor?: number;
  priceTick?: number;

  startSaleTS?: number;
  startListTS?: number;
  endTS?: number;

  auctionDuration?: number;
  auctionDurationType?: 'days' | 'hours' | 'minutes';
  gapTime?: number;
  gapTimeType?: 'days' | 'hours' | 'minutes';
  tickSizeEndingPhase?: number;

  spots?: number;
  tiers?: Array<Tier>;

  winnersCount: number;

  instantSalePrice?: number;
  instantSaleType?: InstantSaleType;

  quoteMintAddress: string;
  quoteMintInfo: MintInfo;
  quoteMintInfoExtended: TokenInfo;
}

const delays = ['Minutes', 'Hours', 'Days'];
const SaleAuction = ({ className, close, pubKey }) => {
  const [visibleModalConfirm, setVisibleModalConfirm] = useState(false);
  const [saleValue, setBidSale] = useState('0.001');
  const [tickSize, setTickSize] = useState('0.001');
  const [percentage, setPercentage] = useState(0);
  const [auctionDelay, setAuctionDelay] = useState(delays[0]);
  const [gapTimeDelay, setGapTimeDelay] = useState(delays[0]);

  const [auctionDelayValue, setAuctionDelayValue] = useState(0);
  const [gapTimeDelayValue, setGapTimeDelayValue] = useState(0);

  //
  const connection = useConnection();
  const mint    = useMint(QUOTE_MINT);
  const wallet  = useWallet();
  const { whitelistedCreatorsByCreator, storeIndexer } = useMeta();
  const [signState, setSignState] = useState(0);
  const userArts = useUserArts();

  console.log('%%%%userArts%%%%%%');
  console.log(userArts);

  const selectedItem = userArts.filter(item =>
    item.metadata.pubkey === pubKey);

  const [auctionObj, setAuctionObj] =
    useState<
      | {
          vault: StringPublicKey;
          auction: StringPublicKey;
          auctionManager: StringPublicKey;
        }
      | undefined
    >(undefined);

  const [attributes, setAttributes] = useState<AuctionState>({
    reservationPrice: 0,
    items: selectedItem,
    category: AuctionCategory.Open,
    auctionDurationType: 'minutes',
    gapTimeType: 'minutes',
    winnersCount: 1,
    startSaleTS: undefined,
    startListTS: undefined,
    quoteMintAddress: '',
    //@ts-ignore
    quoteMintInfo: undefined,
    //@ts-ignore
    quoteMintInfoExtended: undefined,
  });

  const CreateAuction = async () => {
    let winnerLimit: WinnerLimit;
    //const mint = attributes.quoteMintInfo
    if (
      attributes.category === AuctionCategory.InstantSale &&
      attributes.instantSaleType === InstantSaleType.Open
    ) {
      const { items, instantSalePrice } = attributes;

      if (items.length > 0 && items[0].participationConfig) {
        items[0].participationConfig.fixedPrice = new BN(
          toLamports(instantSalePrice, mint) || 0,
        );
      }

      winnerLimit = new WinnerLimit({
        type: WinnerLimitType.Unlimited,
        usize: ZERO,
      });
    } else if (attributes.category === AuctionCategory.InstantSale) {
      const { items, editions } = attributes;

      if (items.length > 0) {
        const item = items[0];
        if (!editions) {
          item.winningConfigType =
            item.metadata.info.updateAuthority ===
            (wallet?.publicKey || SystemProgram.programId).toBase58()
              ? WinningConfigType.FullRightsTransfer
              : WinningConfigType.TokenOnlyTransfer;
        }

        item.amountRanges = [
          new AmountRange({
            amount: new BN(1),
            length: new BN(editions || 1),
          }),
        ];
      }

      winnerLimit = new WinnerLimit({
        type: WinnerLimitType.Capped,
        usize: new BN(editions || 1),
      });
    } else if (attributes.category === AuctionCategory.Open) {
      if (
        attributes.items.length > 0 &&
        attributes.items[0].participationConfig
      ) {
        attributes.items[0].participationConfig.fixedPrice = new BN(
          toLamports(attributes.participationFixedPrice, mint) || 0,
        );
      }
      winnerLimit = new WinnerLimit({
        type: WinnerLimitType.Unlimited,
        usize: ZERO,
      });
    } else if (
      attributes.category === AuctionCategory.Limited ||
      attributes.category === AuctionCategory.Single
    ) {
      if (attributes.items.length > 0) {
        const item = attributes.items[0];
        if (
          attributes.category == AuctionCategory.Single &&
          item.masterEdition
        ) {
          item.winningConfigType =
            item.metadata.info.updateAuthority ===
            (wallet?.publicKey || SystemProgram.programId).toBase58()
              ? WinningConfigType.FullRightsTransfer
              : WinningConfigType.TokenOnlyTransfer;
        }
        item.amountRanges = [
          new AmountRange({
            amount: new BN(1),
            length:
              attributes.category === AuctionCategory.Single
                ? new BN(1)
                : new BN(attributes.editions || 1),
          }),
        ];
      }
      winnerLimit = new WinnerLimit({
        type: WinnerLimitType.Capped,
        usize:
          attributes.category === AuctionCategory.Single
            ? new BN(1)
            : new BN(attributes.editions || 1),
      });

      if (
        attributes.participationNFT &&
        attributes.participationNFT.participationConfig
      ) {
        attributes.participationNFT.participationConfig.fixedPrice = new BN(
          toLamports(attributes.participationFixedPrice, mint) || 0,
        );
      }
    } else {
      winnerLimit = new WinnerLimit({
        type: WinnerLimitType.Capped,
        usize: new BN(attributes.winnersCount),
      });
      if (
        attributes.participationNFT &&
        attributes.participationNFT.participationConfig
      ) {
        attributes.participationNFT.participationConfig.fixedPrice = new BN(
          toLamports(attributes.participationFixedPrice, mint) || 0,
        );
      }
    }

    const isInstantSale =
      attributes.instantSalePrice &&
      attributes.priceFloor === attributes.instantSalePrice;

    const LAMPORTS_PER_TOKEN = attributes.quoteMintAddress == WRAPPED_SOL_MINT.toBase58()? LAMPORTS_PER_SOL
      : Math.pow(10, attributes.quoteMintInfo.decimals || 0)

    const auctionSettings: IPartialCreateAuctionArgs = {
      winners: winnerLimit,
      endAuctionAt: isInstantSale
        ? null
        : new BN(
            (attributes.auctionDuration || 0) *
              (attributes.auctionDurationType == 'days'
                ? 60 * 60 * 24 // 1 day in seconds
                : attributes.auctionDurationType == 'hours'
                ? 60 * 60 // 1 hour in seconds
                : 60), // 1 minute in seconds
          ), // endAuctionAt is actually auction duration, poorly named, in seconds
      auctionGap: isInstantSale
        ? null
        : new BN(
            (attributes.gapTime || 0) *
              (attributes.gapTimeType == 'days'
                ? 60 * 60 * 24 // 1 day in seconds
                : attributes.gapTimeType == 'hours'
                ? 60 * 60 // 1 hour in seconds
                : 60), // 1 minute in seconds
          ),
      priceFloor: new PriceFloor({
        type: attributes.priceFloor
          ? PriceFloorType.Minimum
          : PriceFloorType.None,
        minPrice: new BN((attributes.priceFloor || 0) * LAMPORTS_PER_TOKEN),
      }),
      tokenMint: attributes.quoteMintAddress,
      gapTickSizePercentage: attributes.tickSizeEndingPhase || null,
      tickSize: attributes.priceTick
        ? new BN(attributes.priceTick * LAMPORTS_PER_TOKEN)
        : null,
      instantSalePrice: attributes.instantSalePrice
        ? new BN((attributes.instantSalePrice || 0) * LAMPORTS_PER_TOKEN)
        : null,
      name: null,
    };

    const isOpenEdition =
      attributes.category === AuctionCategory.Open ||
      attributes.instantSaleType === InstantSaleType.Open;
    const safetyDepositDrafts = isOpenEdition
      ? []
      : attributes.items
    const participationSafetyDepositDraft = isOpenEdition
      ? attributes.items[0]
      : attributes.participationNFT;


    console.log('%%%%%%attributes%%%%%%%')
    console.log(attributes)

    // const callData = {
    //   connection: connection,
    //   wallet: wallet,
    //   whitelistedCreatorsByCreator: whitelistedCreatorsByCreator,
    //   auctionSettings: auctionSettings,
    //   safetyDepositDrafts: safetyDepositDrafts,
    //   participationSafetyDepositDraft: participationSafetyDepositDraft,
    //   quoteMintAddress: attributes.quoteMintAddress,
    //   storeIndexer: storeIndexer
    // }

    // const _auctionObj = await createAuctionManager(
    //   connection,
    //   wallet,
    //   whitelistedCreatorsByCreator,
    //   auctionSettings,
    //   safetyDepositDrafts,
    //   participationSafetyDepositDraft,
    //   attributes.quoteMintAddress,
    //   storeIndexer,
    // );
    // setAuctionObj(_auctionObj);

    // const json = JSON.stringify(attributes);

    // const info = {
    //   'vault': _auctionObj?.vault, 
    //   'auction': _auctionObj?.auction,
    //   'auctionManager': _auctionObj?.auctionManager,
    //   'lock_status': 20, // auction sale
    //   'id': pubKey,
    //   'cur_price': attributes.priceFloor,
    //   'expiring_at': null,
    //   'json': json
    // }

    // await axios.post(API_ENDPOINT + "/token/list_for_sale", info);
  };

  const [mintKey, setMintKey] = useState<PublicKey>(WRAPPED_SOL_MINT)

  attributes.quoteMintAddress = mintKey? mintKey.toBase58(): QUOTE_MINT.toBase58()
  attributes.quoteMintInfo = useMint(attributes.quoteMintAddress)!
  attributes.quoteMintInfoExtended = useTokenList().tokenMap.get(attributes.quoteMintAddress)!
  
  const onClickProceedListSale = async () => {
    attributes.category = AuctionCategory.Single;
    attributes.priceFloor = +saleValue;
    attributes.priceTick =  +tickSize;
    attributes.instantSalePrice = +saleValue;
    attributes.startListTS = moment().unix();
    attributes.startSaleTS = moment().unix();
    attributes.tickSizeEndingPhase = percentage;
    attributes.auctionDuration = auctionDelayValue;
    attributes.gapTime = gapTimeDelayValue;
    attributes.auctionDurationType = auctionDelay === "Minutes" ? "minutes" : auctionDelay === "Hours" ? "hours" : "days";
    attributes.gapTimeType = gapTimeDelay === "Minutes" ? "minutes" : gapTimeDelay === "Hours" ? "hours" : "days";

    if (!attributes.items || attributes.items.length < 1) {
      alert('Please wait until data gets loaded');
      return;
    }

    // const json = JSON.stringify(attributes);

    // const info = {
    //   'vault': '_auctionObj?.vault', 
    //   'auction': '_auctionObj?.auction',
    //   'auctionManager': '_auctionObj?.auctionManager',
    //   'lock_status': 20, // auction sale
    //   'id': pubKey,
    //   'cur_price': attributes.priceFloor,
    //   'expiring_at': null,
    //   'json': json
    // }
    // await axios.post(API_ENDPOINT + "/token/list_for_sale", info);


    setSignState(1);
    await CreateAuction();
    setSignState(2);
    alert('Successfully listed for sale!');
  };
  
  return (
    <div className={cn(className, styles.sale)}>
      <div className={cn("h4", styles.title)}>Put on instant sale</div>

      <div className={styles.table}>
        <div className={styles.row}>
          <div className={styles.col}>Price</div>
          <div className={styles.col}>
            <input className={styles.inputSale}
            placeholder="This is the starting bid price for your auction."
            value = {saleValue}
            onChange={(e) => setBidSale(e.target.value)}/>
          </div>
          <div className={styles.col}>SOL</div>
        </div>
      </div>

      <div className={styles.table}>
        <div className={styles.row}>
          <div className={styles.col}>Tick Size</div>
          <div className={styles.col}>
            <input className={styles.inputSale}
            placeholder="All bids must fall within this price increment."
            value = {saleValue}
            onChange={(e) => setTickSize(e.target.value)}/>
          </div>
          <div className={styles.col}>SOL</div>
        </div>
      </div>

      <div className={styles.table}>
        {items.map((x, index) => (
          <div className={styles.row} key={index}>
            <div className={styles.col}>{x.title}</div>
            <div className={styles.col}>{index == 1 ? parseFloat(''+x.value) + parseFloat(''+saleValue) : x.value}</div>
            <div className={styles.col}>{x.symbol}</div>
          </div>
        ))}
      </div>

      <div className={styles.table}>
        <div className={styles.row}>
          <div className={styles.col}>Duration</div>
          <div className={styles.col}>
            <input className={styles.inputSale}
            placeholder="Auction Duration"
            value = {auctionDelayValue}
            onChange={(e) => setAuctionDelayValue(+e.target.value)}/>
          </div>
          <div className={styles.col}>{auctionDelay}</div>
        </div>
      </div>

      <div className={styles.line}>
        <div className={styles.field}>
          <Dropdown
            className={styles.dropdown}
            value={auctionDelay}
            setValue={setAuctionDelay}
            options={delays}
          />
          <div className={styles.label}>This is how long the auction will last for.</div>
        </div>
      </div>

      <div className={styles.table}>
        <div className={styles.row}>
          <div className={styles.col}>Gap Time</div>
          <div className={styles.col}>
            <input className={styles.inputSale}
            placeholder="Gap Time"
            value = {gapTimeDelayValue}
            onChange={(e) => setGapTimeDelayValue(+e.target.value)}/>
          </div>
          <div className={styles.col}>{gapTimeDelay}</div>
        </div>
      </div>

      <div className={styles.line}>
        <div className={styles.field}>
          <Dropdown
            className={styles.dropdown}
            value={gapTimeDelay}
            setValue={setGapTimeDelay}
            options={delays}
          />
          <div className={styles.label}>The final phase of the auction will begin when there is this much time left on the countdown</div>
        </div>
      </div>

      <div className={styles.table}>
        <div className={styles.row}>
          <div className={styles.col}>Move up %</div>
          <div className={styles.col}>
            <input className={styles.inputSale}
            placeholder="Percentage"
            value = {percentage}
            onChange={(e) => setPercentage(+e.target.value)}/>
          </div>
          <div className={styles.col}>%</div>
        </div>
      </div>

      <div className={styles.btns}>
        {
          signState == 0 &&
          <>
            <button className={cn("button", styles.button)} onClick={() => onClickProceedListSale()}>Continue</button>
            <button className={cn("button-stroke", styles.button)} onClick={() => close()}>Cancel</button>
          </>
        }
        {
          signState == 1 &&
          <button className={cn("button loading", styles.button)}>
            <Loader className={styles.loader} color="white" />
          </button>
        }
        {
          signState == 2 &&
            <button className={cn("button-stroke", styles.button)} onClick={() => close()}>Cancel</button>
        }

      </div>
      { /* <Modal 
        visible={visibleModalSale}
      /> */}
       <Modal
        outerClassName={''}
        containerClassName={''}
        visible={visibleModalConfirm}
        onClose={() => setVisibleModalConfirm(false)}
      >Successfully be listed for sale!</Modal> 
    </div>
  );
};

export default SaleAuction;