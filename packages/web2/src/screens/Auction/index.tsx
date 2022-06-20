import { useEffect, useState, ReactElement, useMemo } from "react";
import cn from "classnames";
import styles from "./Auction.module.sass";
import Users from "./Users";
import Control from "./Control";
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';

import { API_ENDPOINT } from '../../constants';
import { useParams } from 'react-router-dom';

import {
  useAuction,
} from '../../hooks';

const ItemCard = ({item, auction, owner}:any): ReactElement => {
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
          {
            auction &&
            <Control 
            className={styles.control} 
            pdf={item.mainData} 
            lock_status={+item.status} 
            lock_type={+item.type} 
            pubKey={item.metaDataAccount} 
            auctionView={auction} 
            isOwner={owner == item.owner}/>
          }
        </div>
      </div>
    </div>
  );
}

const AuctionPage = () => {
  const { publicKey } = useWallet();
  const [ token, setToken ] = useState<any>(null);
  const owner = publicKey?.toBase58();

  const { id } = useParams<{ id: string }>();
  const auction = useAuction(id);

  console.log('%%%%auction detail%%%%');
  console.log(auction);

  useEffect(() => {
    console.log('before position 2');
  }, []);

  useEffect(() => {
    console.log('fetching local db');
    let mounted = true;
    async function fetchTokens() {
      if (!publicKey) return;
      const { data } = await axios.get(API_ENDPOINT + "/auction/detail/" + id);
      if (mounted) { 
        setToken(data.data.detail);
      }
    }

    fetchTokens();
    return () => { mounted = false; }
  }, []);

  return (
    <>
      {token &&
          <ItemCard key={0} item={token} auction={auction} owner={owner}/>
          // <p>AAAAAAAAAAAA</p>
      }
    </>
  );
};

export default AuctionPage;