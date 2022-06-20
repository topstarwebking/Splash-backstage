import { useEffect, useState, ReactElement } from "react";
import cn from "classnames";
import styles from "./Item.module.sass";
import Users from "./Users";
import Control from "./Control";
import Options from "./Options";
import { ArtworkViewState } from './types';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';

import { useMeta } from "@oyster/common";
import { useUserAccounts } from '@oyster/common';
import { useItems } from './hooks/useItems';
import { API_ENDPOINT } from '../../constants';

const ItemCard = ({item, walletKey}:any): ReactElement => {
  const users = [
    {
      name: item.owner,
      position: "Owner",
      avatar: "/images/content/avatar-2.jpg",
      reward: "/images/content/reward-1.svg",
    },
    {
      name: item.creator,
      position: "Creator",
      avatar: "/images/content/avatar-1.jpg",
    },
  ];

  return (
    <div className={cn("section", styles.section)}>
      <div className={cn("container", styles.container)}>
        <div className={styles.bg}>
          <div className={styles.preview}>
            <img
              srcSet={item.coverData}
              src={item.coverData}
              alt="Item"
            />
          </div>
          {/* <Options items={[]} className={styles.options} isOwner={item.owner === walletKey} /> */}
        </div>
        <div className={styles.details}>
          <h1 className={cn("h3", styles.title)}>{item.name}</h1>
          <div className={styles.cost}>
            <div className={cn("status-stroke-green", styles.price)}>
              {item.price} SOL
            </div>
            <div className={styles.counter}>{item.stock} in stock</div>
          </div>
          {/* <div className={styles.info}></div>
          <div className={styles.nav}>
            {navLinks.map((x, index) => (
              <button
                className={cn(
                  { [styles.active]: index === 0 },
                  styles.link
                )}
                key={index}
              >
                {x}
              </button>
            ))}
          </div> */}
          <Users className={styles.users} items={users} />
          <Control pdf={item.mainData} className={styles.control} isOwner={item.owner === walletKey} lockedStatus={+item.locked} isLocked={+item.locked === 0 ? false : true} pubKey={item.metaDataAccount}/>
        </div>
      </div>
    </div>
  );
}

const Item = () => {
  const { publicKey, connected } = useWallet();
  const [ tokens, setTokens ] = useState<Array<any>>([]);
  const owner = publicKey?.toBase58();

  //////////////////////////////////////////////
  const {
    isLoading,
    pullItemsPage,
    isFetching,
  } = useMeta();

  const { userAccounts } = useUserAccounts();
  const [activeKey, setActiveKey] = useState(ArtworkViewState.Owned);
  const userItems = useItems({ activeKey });

  useEffect(() => {
    if (!isFetching) {
      console.log('started fetching items page');
      pullItemsPage(userAccounts);
    }
  }, [isFetching]);

  useEffect(() => {
    if (connected) {
      setActiveKey(ArtworkViewState.Owned);
    } else {
      setActiveKey(ArtworkViewState.Metaplex);
    }
  }, [connected, setActiveKey]);

  const isDataLoading = isLoading || isFetching;

  useEffect(() => {
    let mounted = true;
    
    async function fetchTokens() {
      if (!publicKey) return;
      
      const { data } = await axios.get(API_ENDPOINT + "/token/get/" + owner)
      const tokens = data.data.tokens.map((token: any) => {
        return {
          ...token,
          category: "green",
          categoryText: "My item",
          highestBid: 0,
          users: [],
          bid: ''
        };
      })

      if (mounted) setTokens(tokens);
    }

    fetchTokens();
    return () => { mounted = false; }
  }, []);

  return (
    <>
      {tokens.length > 0 &&
        tokens.map((item,index) => {
          return <ItemCard key={index} item={item} walletKey={owner}/>;
        })}
    </>
  );
};

export default Item;