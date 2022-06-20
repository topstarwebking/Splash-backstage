import React, { useEffect, useState, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import {
  Steps,
  Row,
  Button,
  Upload,
  Col,
  Input,
  Statistic,
  Slider,
  Spin,
  InputNumber,
  Form,
  Typography,
  Space,
  Card,
  notification,
} from 'antd';

import {
  LoadingOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';

import { useHistory } from 'react-router';

import { ModalLayout } from '../../components/Modals';

import { mintNFT } from '../../actions';
import { useWallet } from '@solana/wallet-adapter-react';

import {
  MAX_METADATA_LEN,
  useConnection,
  IMetadataExtension,
  MetadataCategory,
  useConnectionConfig,
  Creator,
  shortenAddress,
  MetaplexModal,
  MetaplexOverlay,
  MetadataFile,
  StringPublicKey,
  WRAPPED_SOL_MINT,
  getAssetCostToStore,
  LAMPORT_MULTIPLIER,
} from '@oyster/common';
import { cleanName, getLast } from '../../utils/utils';
import { UserSearch, UserValue } from '../../components/UserSearch';

import { ArtContent } from '../../components/ArtContent';

import { ArtCard } from '../../components/ArtCard';
const { Dragger } = Upload;
const { Text } = Typography;

export const OneArtCreate = () => {
  const history = useHistory();
  const connection = useConnection();
  const { endpoint } = useConnectionConfig();
  const { publicKey, connected } = useWallet();
  const wallet = useWallet();
  const [form] = Form.useForm();
  // const [api, contextHolder] = notification.useNotification();

  const [attributes, setAttributes] = useState<IMetadataExtension>({
    name: '',
    symbol: '',
    author: '',
    description: '',
    external_url: '',
    image: '',
    work_title: '',
    yearOfCreation: new Date().getFullYear(),
    animation_url: undefined,
    attributes: undefined,
    seller_fee_basis_points: 1000,
    creators: [],
    properties: {
      files: [],
      category: MetadataCategory.Image,
    },
  });

  const [files, setFiles] = useState<File[]>([]);
  const [coverFile, setCoverFile] = useState<File | undefined>(files?.[0]);
  const [mainFile, setMainFile] = useState<File | undefined>(files?.[1]);

  const [customURL, setCustomURL] = useState<string>('');

  const [coverArtError, setCoverArtError] = useState<string>();
  const [customURLErr, setCustomURLErr] = useState<string>('');

  const [creator, setCreator] = useState('');
  const [previewImage, setPreviewImage] = useState('');

  const [royalty, setRoyalty] = useState(10);
  const [disableMint, setDisableMint] = useState(true);

  const [nftCreateProgress, setNFTcreateProgress] = useState<number>(0);
  const [nft, setNft] = useState<
    { metadataAccount: StringPublicKey } | undefined
  >(undefined);

  const [isMinting, setMinting] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [successfullyMinted, setSuccessfullyMinted] = useState(false);

  const [creatorPercent, setCreatorPercent] = useState(10);
  const [artistAddress, setArtistAddress] = useState('');
  const [artistPercent, setArtistPercent] = useState(85);
  const [scoutAddress, setScoutAddress] = useState('');
  const [scoutPercent, setScoutPercent] = useState(5);

  useEffect(() => {
    if (publicKey) {
      setCreator(publicKey.toBase58());
    } else {
      history.push('/');
    }
  }, [connected]);

  const initAttributes = () => {
    setAttributes({
      name: '',
      symbol: '',
      author: '',
      description: '',
      external_url: '',
      image: '',
      work_title: '',
      yearOfCreation: new Date().getFullYear(),
      animation_url: undefined,
      attributes: undefined,
      seller_fee_basis_points: 1000,
      creators: [],
      properties: {
        files: [],
        category: MetadataCategory.Image,
      },
    });
    setPreviewImage('');
    setCoverFile(undefined);
    setMainFile(undefined);
    setArtistAddress('');
    setScoutAddress('');
  };

  const previewImageChange = info => {
    if (info.file) {
      const reader = new window.FileReader();
      reader.readAsArrayBuffer(info.file.originFileObj);
      reader.onloadend = () => {
        setPreviewImage(URL.createObjectURL(info.file.originFileObj));
        setCoverFile(info.file.originFileObj);
        setCoverArtError(undefined);
      };
    }
  };

  const mainFileChange = info => {
    if (info.file) {
      const reader = new window.FileReader();
      reader.readAsArrayBuffer(info.file.originFileObj);
      reader.onloadend = () => {
        setMainFile(info.file.originFileObj);
        setCustomURL('');
        setCustomURLErr('');
        setDisableMint(false);
      };
    }
  };

  const prepareMint = async () => {
    if (attributes.work_title == '') {
      notification.warning({
        message: 'Please input work title.',
        description: `You should input work title because this is required field.`,
        className: 'notification-container',
        placement: 'bottomLeft',
      });
      return;
    }
    if (artistAddress == '') {
      notification.warning({
        message: 'Please input artist address.',
        description: `You should input artist Address because this is required field.`,
        className: 'notification-container',
        placement: 'bottomLeft',
      });
      return;
    }

    const creatorStructs: Creator[] = [];
    if (publicKey) {
      creatorStructs.push(
        new Creator({
          address: publicKey.toBase58(),
          verified: true,
          share: creatorPercent,
        }),
      );
      if (artistAddress != '') {
        try {
          const artistWallet = new PublicKey(artistAddress);
          console.log(PublicKey.isOnCurve(artistWallet.toBytes()));
        } catch (e) {
          notification.warning({
            message: 'Please input valid artist address.',
            description: `You should input valid artist Address. it must be matched to PublicKey format`,
            className: 'notification-container',
            placement: 'bottomLeft',
          });
          return;
        }
        if (artistAddress == creator || artistAddress == scoutAddress) {
          notification.warning({
            message: 'No duplicate creator address.',
            description: `It's not able to mint with duplicated creator address`,
            className: 'notification-container',
            placement: 'bottomLeft',
          });
          return;
        }
        creatorStructs.push(
          new Creator({
            address: artistAddress,
            verified: false,
            share: artistPercent,
          }),
        );
      }
      if (scoutAddress != '') {
        try {
          const scoutWallet = new PublicKey(scoutAddress);
          console.log(PublicKey.isOnCurve(scoutWallet.toBytes()));
        } catch (e) {
          notification.warning({
            message: 'Please input valid scout address.',
            description: `You should input valid scout Address. it must be matched to PublicKey format`,
            className: 'notification-container',
            placement: 'bottomLeft',
          });
          return;
        }
        if (scoutAddress == creator || scoutAddress == artistAddress) {
          notification.warning({
            message: 'No duplicate creator address.',
            description: `It's not able to mint with duplicated creator address`,
            className: 'notification-container',
            placement: 'bottomLeft',
          });
          return;
        }
        creatorStructs.push(
          new Creator({
            address: scoutAddress,
            verified: false,
            share: scoutPercent,
          }),
        );
      }
    }

    var share = 0;
    for (var i = 0; i < creatorStructs.length; i++) {
      share += creatorStructs[i].share;
    }

    console.log('------------------share: ', share);
    if (share != 100) {
      notification.warning({
        message: 'Please input royalty split correctly.',
        description: `The royalty should be 100 exactly...`,
        className: 'notification-container',
        placement: 'bottomLeft',
      });
      return;
    }

    const values = await form.validateFields();
    // .then(values => {
    const nftAttributes = values.attributes;
    // value is number if possible
    for (const nftAttribute of nftAttributes || []) {
      const newValue = nftAttribute.value;
      if (!isNaN(newValue)) {
        nftAttribute.value = newValue;
      }
    }
    console.log('Adding NFT attributes:', nftAttributes);
    // setAttributes({
    //   ...attributes,
    //   attributes: nftAttributes,
    // });
    // });

    setAttributes({
      ...attributes,
      creators: creatorStructs,
      attributes: nftAttributes,
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
      animation_url: customURL ? customURL : mainFile && mainFile.name,
    });

    const files = [coverFile, mainFile, ''].filter(f => f) as File[];
    // validateForm();

    setFiles(files);
    setSuccessfullyMinted(false);
    setMinting(true);
  };

  // const validateForm = () => {
  //   // form validation
  //   form.validateFields().then(values => {
  //     const nftAttributes = values.attributes;
  //     // value is number if possible
  //     for (const nftAttribute of nftAttributes || []) {
  //       const newValue = Number(nftAttribute.value);
  //       if (!isNaN(newValue)) {
  //         nftAttribute.value = newValue;
  //       }
  //     }
  //     console.log('Adding NFT attributes:', nftAttributes);
  //     setAttributes({
  //       ...attributes,
  //       attributes: nftAttributes,
  //     });
  //   });
  // };

  const mint = async () => {
    const metadata = {
      name: attributes.name,
      symbol: attributes.symbol,
      author: attributes.author,
      creators: attributes.creators,
      description: attributes.description,
      sellerFeeBasisPoints: attributes.seller_fee_basis_points,
      image: attributes.image,
      animation_url: attributes.animation_url,
      attributes: attributes.attributes,
      external_url: attributes.external_url,
      work_title: attributes.work_title,
      yearofcreation: attributes.yearOfCreation,
      properties: {
        files: attributes.properties.files,
        category: attributes.properties?.category,
      },
    };

    console.log({ metadata });

    setProcessing(true);

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

      setSuccessfullyMinted(true);
      initAttributes();
    } catch (e: any) {
      console.log(e.message);
      setProcessing(false);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <Row className="content-action" justify="center" style={{ gap: '20px' }}>
        <Col>
          <ArtCard
            image={previewImage}
            animationURL={attributes.animation_url}
            category={attributes.properties?.category}
            name={attributes.name}
            symbol={attributes.symbol}
            small={true}
            artView={!(files.length > 1)}
            className="art-create-card"
          />
        </Col>
        <Col className="section" style={{ minWidth: 400 }}>
          <Col style={{ marginBottom: 5, marginTop: 10 }}>
            <h3 className="field-title">Upload a preview image</h3>
            <Row className="content-action">
              <Dragger
                accept=".png,.jpg,.gif,.mp4,.svg"
                style={{
                  padding: 20,
                  maxHeight: 180,
                  background: 'rgba(255, 255, 255, 0.08)',
                }}
                multiple={false}
                onRemove={() => {
                  setMainFile(undefined);
                  setCoverFile(undefined);
                }}
                customRequest={info => {
                  // dont upload files here, handled outside of the control
                  info?.onSuccess?.({}, null as any);
                }}
                fileList={coverFile ? [coverFile as any] : []}
                onChange={previewImageChange}
              >
                {coverArtError ? (
                  <Text type="danger">{coverArtError}</Text>
                ) : (
                  <p className="ant-upload-text" style={{ color: '#6d6d6d' }}>
                    Drag and drop, or click to browse
                  </p>
                )}
              </Dragger>
            </Row>
          </Col>
          <Col style={{ marginBottom: 35, marginTop: 40 }}>
            <h3 className="field-title">Add target file</h3>
            <Row className="content-action">
              <Dragger
                accept="*"
                style={{ padding: 20, background: 'rgba(255, 255, 255, 0.08)' }}
                multiple={false}
                customRequest={info => {
                  // dont upload files here, handled outside of the control
                  info?.onSuccess?.({}, null as any);
                }}
                fileList={mainFile ? [mainFile as any] : []}
                onChange={mainFileChange}
                onRemove={() => {
                  setMainFile(undefined);
                }}
              >
                <p className="ant-upload-text" style={{ color: '#6d6d6d' }}>
                  Drag and drop, or click to browse
                </p>
              </Dragger>
            </Row>
          </Col>
          <label className="action-field">
            <span className="field-title">Author</span>
            <Input
              className="input"
              placeholder="Name of the Artist"
              maxLength={50}
              value={attributes.author}
              onChange={info => {
                setAttributes({
                  ...attributes,
                  author: info.target.value,
                });
              }}
            />
          </label>
          <label className="action-field">
            <span className="field-title">Name</span>
            <Input
              className="input"
              placeholder="Name of NFT e.g. The Evil"
              maxLength={50}
              allowClear
              value={attributes.name}
              onChange={info =>
                setAttributes({
                  ...attributes,
                  name: info.target.value,
                })
              }
            />
          </label>
          <label className="action-field">
            <span className="field-title">Symbol</span>
            <Input
              className="input"
              placeholder="Symbol of NFT e.g. NIT, LMI..."
              maxLength={50}
              allowClear
              value={attributes.symbol}
              onChange={info =>
                setAttributes({
                  ...attributes,
                  symbol: info.target.value,
                })
              }
            />
          </label>
          <label className="action-field">
            <span className="field-title">Work Title</span>
            <Input
              className="input"
              placeholder="Naming of the picture / photo / model"
              maxLength={50}
              allowClear
              value={attributes.work_title}
              onChange={info =>
                setAttributes({
                  ...attributes,
                  work_title: info.target.value,
                })
              }
            />
          </label>
          <label className="action-field">
            <span className="field-title">Year of Creation</span>
            <InputNumber
              min={0}
              max={new Date().getFullYear()}
              value={attributes.yearOfCreation}
              placeholder="Year of Creation"
              onChange={val => {
                setAttributes({
                  ...attributes,
                  yearOfCreation: val,
                });
              }}
              className="royalties-input"
            />
          </label>
          <label className="action-field">
            <span className="field-title">Notes</span>
            <Input.TextArea
              className="input textarea"
              placeholder="Detailed description about nft"
              maxLength={300}
              value={attributes.description}
              onChange={info =>
                setAttributes({
                  ...attributes,
                  description: info.target.value,
                })
              }
              allowClear
            />
          </label>
          {/* <label className="action-field">
            <span className="field-title">Attributes</span>
          </label> */}
          <h3 className="field-title">Attributes</h3>
          <Form name="dynamic_attributes" form={form} autoComplete="off">
            <Form.List name="attributes">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name }) => (
                    <Row>
                      <Space key={key} align="baseline">
                        <Form.Item
                          name={[name, 'trait_type']}
                          fieldKey={['trait_type', 'trait_type']}
                          hasFeedback
                        >
                          <Input placeholder="property" />
                        </Form.Item>
                        <Form.Item
                          name={[name, 'value']}
                          fieldKey={['value', 'value']}
                          rules={[{ required: true, message: 'Missing value' }]}
                          hasFeedback
                        >
                          <Input placeholder="value" />
                        </Form.Item>
                        {/* <Form.Item
                        name={[name, 'display_type']}
                        fieldKey={['display_type', 'display_type']}
                        hasFeedback
                      >
                        <Input placeholder="display_type (Optional)" />
                      </Form.Item> */}
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      </Space>
                    </Row>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add attribute
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form>
          <label className="action-field">
            <span className="field-title">Royalty Percentage</span>
            <InputNumber
              min={0}
              max={100}
              value={royalty}
              pattern="/d"
              placeholder="Between 0 and 100"
              onChange={(val: number) => {
                setRoyalty(Math.floor(val));
                setAttributes({
                  ...attributes,
                  seller_fee_basis_points: Math.floor(val) * 100,
                });
              }}
              className="royalties-input"
            />
          </label>
          <label className="action-field" style={{ width: '100%' }}>
            <span className="field-title">Creators Split</span>
            <span>Agency:</span>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
              <Input
                className="input"
                placeholder="e.g. 4KftgY1aSqdY98Jygd5vN6qiWBWiuCbiKePujBX8Syjz"
                maxLength={50}
                value={creator}
                onChange={info => {
                  info.preventDefault();
                }}
              />
              <InputNumber
                min={0}
                max={100}
                pattern="/d"
                value={creatorPercent}
                placeholder="Between 0 and 100"
                onChange={(val: number) => {
                  setCreatorPercent(Math.floor(val));
                }}
              />
            </div>
            <span>Artist:</span>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
              <Input
                className="input"
                placeholder="e.g. 4KftgY1aSqdY98Jygd5vN6qiWBWiuCbiKePujBX8Syjz"
                maxLength={50}
                value={artistAddress}
                onChange={info => {
                  setArtistAddress(info.target.value);
                }}
              />
              <InputNumber
                min={0}
                max={100}
                pattern="/d"
                value={artistPercent}
                placeholder="Between 0 and 100"
                onChange={(val: number) => {
                  setArtistPercent(Math.floor(val));
                }}
              />
            </div>
            <span>Scout:</span>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
              <Input
                className="input"
                placeholder="e.g. 4KftgY1aSqdY98Jygd5vN6qiWBWiuCbiKePujBX8Syjz"
                maxLength={50}
                value={scoutAddress}
                onChange={info => {
                  setScoutAddress(info.target.value);
                }}
              />
              <InputNumber
                min={0}
                max={100}
                pattern="/d"
                value={scoutPercent}
                placeholder="Between 0 and 100"
                onChange={(val: number) => {
                  setScoutPercent(Math.floor(val));
                }}
              />
            </div>
          </label>
          <h3>Edition: One of One</h3>
          <Button
            type="primary"
            size="middle"
            disabled={disableMint}
            onClick={prepareMint}
            style={{ marginTop: 24 }}
            className="action-btn"
          >
            Mint
          </Button>
        </Col>
      </Row>
      {/* <ModalLayout
        onClose={() => {
          setMinting(false);
        }}
        isModalVisible={isMinting}
      >
        <p>Hello</p>
      </ModalLayout> */}
      <MetaplexModal
        title={successfullyMinted ? 'Yay!!!' : 'Mint NFT'}
        visible={isMinting}
        onCancel={() => setMinting(false)}
      >
        {successfullyMinted && <p>You successfully minted a nft</p>}
        {!successfullyMinted && (
          <>
            <ArtContent
              // pubkey={pubkey}
              uri={previewImage}
              animationURL={attributes.animation_url}
              category={attributes.properties?.category}
              // preview={preview}
              // height={height}
              // width={width}
              // artView={artView}
            />
            <Col
              style={{
                padding: '20px',
                // justifyContent: 'center',
              }}
            >
              <Row className="content-action">
                <Col>
                  <h3>Author: </h3>
                </Col>
                <Col style={{ marginLeft: '10px' }}>
                  <h3 style={{ color: '#aaa' }}>{attributes.author}</h3>
                </Col>
              </Row>
              <Row className="content-action">
                <Col>
                  <h3>Name: </h3>
                </Col>
                <Col style={{ marginLeft: '10px' }}>
                  <h3 style={{ color: '#aaa' }}>{attributes.name}</h3>
                </Col>
              </Row>
              <Row className="content-action">
                <Col>
                  <h3>Work Title: </h3>
                </Col>
                <Col style={{ marginLeft: '10px' }}>
                  <h3 style={{ color: '#aaa' }}>{attributes.work_title}</h3>
                </Col>
              </Row>
              <Row className="content-action">
                <Col>
                  <h3>Year Of Creation: </h3>
                </Col>
                <Col style={{ marginLeft: '10px' }}>
                  <h3 style={{ color: '#aaa' }}>{attributes.yearOfCreation}</h3>
                </Col>
              </Row>
              <Row className="content-action">
                <Col>
                  <h3>Description: </h3>
                </Col>
                <Col style={{ marginLeft: '10px' }}>
                  <h3 style={{ color: '#aaa' }}>{attributes.description}</h3>
                </Col>
              </Row>
            </Col>
            <Button
              type="primary"
              // disabled={processing}
              loading={processing}
              onClick={mint}
              style={{ marginTop: '12px' }}
            >
              Mint
            </Button>
          </>
        )}
      </MetaplexModal>
    </>
  );
};
