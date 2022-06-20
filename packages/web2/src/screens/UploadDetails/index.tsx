import React, { useState, useEffect } from 'react';
import cn from 'classnames';
import styles from './UploadDetails.module.sass';
import Dropdown from '../../components/Dropdown';
import Icon from '../../components/Icon';
import TextInput from '../../components/TextInput';
import Switch from '../../components/Switch';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import Preview from './Preview';
import FolowSteps from './FolowSteps';
import SuccessfullyMinted from './SuccessfullyMinted';

// import ipfs from "../../components/ipfs";
import { connect } from 'react-redux';
import { authSet } from '../../store/actions/auth.actions';

import {
  IMetadataExtension,
  MetadataCategory,
  Creator,
  shortenAddress,
  MetadataFile,
} from '@oyster/common';

import { useWallet } from '@solana/wallet-adapter-react';

import { getLast } from '../../utils/utils';
import { UserValue } from '../../components/UserSearch';

const royaltiesOptions = ['10', '20', '30'];

interface Royalty {
  creatorKey: string;
  amount: number;
}

const Upload = props => {
  const { publicKey, connected } = useWallet();
  const [files, setFiles] = useState<File[]>([]);

  const [attributes, setAttributes] = useState<IMetadataExtension>({
    name: '',
    symbol: '',
    description: '',
    external_url: '',
    image: '',
    animation_url: undefined,
    attributes: undefined,
    seller_fee_basis_points: 0,
    creators: [],
    properties: {
      files: [],
      category: MetadataCategory.Image,
    },
  });

  const [coverFile, setCoverFile] = useState<File | undefined>(undefined);
  const [mainFile, setMainFile] = useState<File | undefined>(undefined);
  const [mainFileURL, setMainFileURL] = useState<string>('');
  const [customURL, setCustomURL] = useState<string>('');

  const [visibleModal, setVisibleModal] = useState(false);
  const [visiblePreview, setVisiblePreview] = useState(false);
  const [visibleCreateBtn, setVisibleCreateBtn] = useState(false);

  // const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [fileUrl, updateFileUrl] = useState(``);

  const [fixedCreators, setFixedCreators] = useState<Array<UserValue>>([]);
  const [creators, setCreators] = useState<Array<UserValue>>([]);
  const [royalties, setRoyalties] = useState<Array<Royalty>>([]);
  const [royalty, setRoyalty] = useState(royaltiesOptions[0]);

  const [itemName, updateName] = useState(``);
  const [itemDesc, updateDesc] = useState(``);

  const [itemSymbol, updateSymbol] = useState(``);
  const [itemSupply, updateSupply] = useState(0);

  const [successfullyMinted, setSuccessfullyMinted] = useState(false);
  const onSucceedPurchase = () => {
    setSuccessfullyMinted(true);
    setCoverFile(undefined);
    setMainFile(undefined);
    updateName('');
    updateDesc('');
    updateSymbol('');
    updateSupply(0);
    setPreviewImage('');
    setVisibleCreateBtn(false);

    setAttributes({
      name: '',
      symbol: '',
      description: '',
      external_url: '',
      image: '',
      animation_url: undefined,
      attributes: undefined,
      seller_fee_basis_points: 0,
      creators: [],
      properties: {
        files: [],
        category: MetadataCategory.Image,
      },
    });
  };

  async function imageChange(e) {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new window.FileReader();
      reader.readAsArrayBuffer(e.target.files[0]);
      reader.onloadend = () => {
        // setSelectedImage(Buffer(reader.result));
        setPreviewImage(URL.createObjectURL(e.target.files[0]));
        setCoverFile(e.target.files[0]);
      };
    }
  }

  function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = +Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  }

  async function imageChange2(e) {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new window.FileReader();
      reader.readAsArrayBuffer(e.target.files[0]);
      reader.onloadend = () => {
        setMainFile(e.target.files[0]);
        setMainFileURL(
          'FileName: ' +
            e.target.files[0].name +
            ', Size: ' +
            bytesToSize(e.target.files[0].size),
        );
        setVisibleCreateBtn(true);
      };
    }
  }

  const changeItemName = e => {
    setAttributes({
      ...attributes,
      name: e.target.value,
    });

    updateName(e.target.value);
  };

  const changeItemDesc = e => {
    setAttributes({
      ...attributes,
      description: e.target.value,
    });

    updateDesc(e.target.value);
  };

  const changeItemSymbol = e => {
    setAttributes({
      ...attributes,
      symbol: e.target.value,
    });

    updateSymbol(e.target.value);
  };

  const changeMaxSupply = e => {
    setAttributes({
      ...attributes,
      properties: {
        ...attributes.properties,
        maxSupply: e.target.value,
      },
    });

    updateSupply(e.target.value);
  };

  const removeAll = () => {
    setAttributes({
      ...attributes,
      name: '',
    });
  };

  const createItem = async e => {
    e.preventDefault();

    if (publicKey) {
      const key = publicKey.toBase58();
      setFixedCreators([]);
      fixedCreators.push({
        key,
        label: shortenAddress(key),
        value: key,
      });

      setRoyalties(
        fixedCreators.map(creator => ({
          creatorKey: creator.key,
          amount: Math.trunc(100 / fixedCreators.length),
        })),
      );
    } else {
      return;
    }

    if (
      itemName.length < 1 ||
      itemDesc.length < 1 ||
      itemSymbol.length < 1 ||
      +itemSupply < 1
    ) {
      alert('Please input the details and continue');
      return;
    }

    const creatorStructs: Creator[] = [...fixedCreators, ...creators].map(
      c =>
        new Creator({
          address: c.value,
          verified: c.value === publicKey?.toBase58(),
          share: 100,
          // share:
          //   royalties.find(r => r.creatorKey === c.value)?.amount ||
          //   Math.round(100 / royalties.length),
        }),
    );

    const share = creatorStructs.reduce((acc, el) => (acc += el.share), 0);

    if (share > 100 && creatorStructs.length) {
      creatorStructs[0].share -= share - 100;
    }

    setAttributes({
      ...attributes,
      seller_fee_basis_points: +royalty * 100,
      creators: creatorStructs,
      properties: {
        ...attributes.properties,
        files: [coverFile, mainFile, customURL]
          .filter(f => f)
          .map(f => {
            const uri = typeof f === 'string' ? f : f?.name || '';
            const type =
              typeof f === 'string' || !f
                ? 'unknown'
                : f.type || getLast(f.name.split('.')) || 'unknown';

            return {
              uri,
              type,
            } as MetadataFile;
          }),
      },
      image: coverFile?.name || customURL || '',
      animation_url:
        // props.attributes.properties?.category !==
        //   MetadataCategory.Image && customURL
        customURL ? customURL : mainFile && mainFile.name,
    });
    // const url = await fetch(customURL).then(res => res.blob());
    // const files = [coverFile, mainFile, customURL ? new File([url], customURL) : '']
    const files = [coverFile, mainFile, ''].filter(f => f) as File[];

    setFiles(files);
    setVisibleModal(true);

    // uploadCreate(address, itemName,itemDesc,itemSize,itemProperty,royalties,price,locking)(dispatch);
    // uploadCreate(hashValue, address, itemName,itemDesc,itemSize,itemProperty,royalties,price,locking)(dispatch);
  };

  return (
    <>
      <div className={cn('section', styles.section)}>
        <div className={cn('container', styles.container)}>
          <div className={styles.wrapper}>
            <div className={styles.head}>
              <div className={cn('h2', styles.title)}>Create a Book NFT</div>
            </div>
            <form className={styles.form} action="">
              <div className={styles.list}>
                <div className={styles.item}>
                  <div className={styles.category}>Upload a cover image</div>
                  <div className={styles.note}>
                    Drag or choose your file to upload
                  </div>
                  <div className={styles.file}>
                    <input
                      onChange={imageChange}
                      className={styles.load}
                      type="file"
                      accept="image/*"
                    />
                    <div className={styles.icon}>
                      <Icon name="upload-file" size="24" />
                    </div>
                    <div className={styles.format}>PNG Max 1Gb.</div>
                    {fileUrl && <img src={fileUrl} width="600px" />}
                  </div>
                </div>

                <div className={styles.item}>
                  <div className={styles.category}>Upload a pdf file</div>
                  <div className={styles.note}>
                    Drag or choose your file to upload
                  </div>
                  <div className={styles.file}>
                    <input
                      onChange={imageChange2}
                      className={styles.load}
                      type="file"
                      accept=".pdf"
                    />
                    <div className={styles.icon}>
                      <Icon name="upload-file" size="24" />
                    </div>
                    <div className={styles.format}>PDF Max 1Gb.</div>
                    {mainFileURL && (
                      <div className={styles.note}>{mainFileURL}</div>
                    )}
                  </div>
                </div>

                <div className={styles.item}>
                  <div className={styles.category}>Item Details</div>
                  <div className={styles.fieldset}>
                    <TextInput
                      className={styles.field}
                      label="Item name"
                      name="Item"
                      type="text"
                      placeholder='e. g. Redeemable NFT Card with logo"'
                      value={itemName}
                      onChange={changeItemName}
                      required
                    />
                    <TextInput
                      className={styles.field}
                      label="Description"
                      name="Description"
                      type="text"
                      value={itemDesc}
                      placeholder="e. g. “After purchasing you will able to recived the logo...”"
                      onChange={changeItemDesc}
                      required
                    />
                    <TextInput
                      className={styles.field}
                      label="Symbol"
                      name="Symbol"
                      type="text"
                      value={itemSymbol}
                      placeholder="e. g. MyBookNFT"
                      onChange={changeItemSymbol}
                      required
                    />
                    <div className={styles.row}>
                      <div className={styles.col}>
                        <div className={styles.field}>
                          <div className={styles.label}>Royalties(%)</div>
                          <Dropdown
                            className={styles.dropdown}
                            value={royalty}
                            setValue={setRoyalty}
                            options={royaltiesOptions}
                          />
                        </div>
                      </div>
                      <div className={styles.col}>
                        <TextInput
                          className={styles.field}
                          label="MaxSupply"
                          name="MaxSupply"
                          type="text"
                          value={itemSupply}
                          placeholder="e. g. Quantity"
                          onChange={changeMaxSupply}
                          required
                        />
                      </div>
                      {/* <div className={styles.col}>
                          <TextInput
                            className={styles.field}
                            label="Properties"
                            name="Properties"
                            type="text"
                            placeholder="e. g. Properties"
                            onChange={(e) => setItemProperty(e.target.value)}
                            required
                          />
                        </div> */}
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.foot}>
                <button
                  className={cn('button-stroke tablet-show', styles.button)}
                  onClick={() => setVisiblePreview(true)}
                  type="button"
                >
                  Preview
                </button>
                <button
                  // className={cn("button", styles.button)}
                  className={cn(
                    `button ${visibleCreateBtn ? '' : 'disabled'}`,
                    styles.button,
                  )}
                  onClick={createItem}
                  // type="button" hide after form customization
                  type="button"
                >
                  <span>Create</span>
                  <Icon name="arrow-next" size="10" />
                </button>
                {/*}
                  <div className={styles.saving}>
                    <span>Auto saving</span>
                    <Loader className={styles.loader} />
                  </div>
                */}
              </div>
            </form>
          </div>
          <Preview
            className={cn(styles.preview, { [styles.active]: visiblePreview })}
            onClose={() => setVisiblePreview(false)}
            imageData={previewImage}
            itemName={itemName}
            removeAll={removeAll}
            itemDesc={itemDesc}
          />
        </div>
      </div>
      <Modal
        outerClassName={''}
        containerClassName={''}
        visible={visibleModal}
        onClose={() => {
          setSuccessfullyMinted(false);
          setVisibleModal(false);
        }}
      >
        {!successfullyMinted ? (
          <FolowSteps
            className={styles.steps}
            uploadState={true}
            attributes={attributes}
            files={files}
            onSucceed={onSucceedPurchase}
          />
        ) : (
          <SuccessfullyMinted className={styles.steps} />
        )}
      </Modal>
    </>
  );
};

const mapToStateProps = ({ auth }) => ({
  user: auth.user,
});

const mapToDispatchProps = dispatch => ({
  authSet: payload => dispatch(authSet(payload)),
});

export default connect(mapToStateProps, mapToDispatchProps)(Upload);
