import React, { useEffect, useState } from "react";
import cn from "classnames";
import styles from "./Search01.module.sass";
import Card from "../../components/Card";
import Card2 from "../../components/Card2";
import axios from 'axios';
import { API_ENDPOINT } from '../../constants';
import { useMeta } from '../../contexts';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuctionsList } from './useAuctionsList';

const dateOptions = ["Newest", "Oldest"];
const likesOptions = ["Most liked", "Least liked"];
const colorOptions = ["All colors", "Black", "Green", "Pink", "Purple"];
const creatorOptions = ["Verified only", "All", "Most liked"];

export enum LiveAuctionViewState {
  All = '0',
  Participated = '1',
  Ended = '2',
  Resale = '3',
}

const Search = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [date, setDate] = useState(dateOptions[0]);
  const [likes, setLikes] = useState(likesOptions[0]);
  const [color, setColor] = useState(colorOptions[0]);
  const [creator, setCreator] = useState(creatorOptions[0]);

  const [search, setSearch] = useState("");
  const [values, setValues] = useState([5]);
  const [tokens, setTokens] = useState<Array<any>>([]);

  const AutionStates = [
    LiveAuctionViewState.All, 
    LiveAuctionViewState.Participated, 
    LiveAuctionViewState.Ended,
    LiveAuctionViewState.Resale];

  const [activeKey, setActiveKey] = useState(LiveAuctionViewState.All);
  const { isLoading } = useMeta();
  const { connected } = useWallet();
  const { auctions, hasResaleAuctions } = useAuctionsList(activeKey);
  
  console.log('%%%%%%%%%auctions%%%%%%%%');
  console.log(auctions);
  
  useEffect(() => {
    let mounted = true;
    
    async function fetchTokens() {
      const { data } = await axios.get(API_ENDPOINT + "/token/all")
      const tokens = data.data.tokens.map((token: any) => {
        return {
          ...token,
          category: "green",
          categoryText: token.status == 2 ? "Ended" : "Purchasing",
          highestBid: 0,
          users: [],
          bid: ''
        };
      }).filter(a => activeIndex == 0 || a.status == activeIndex)
      if (mounted) setTokens(tokens);
    }

    fetchTokens();
    return () => { mounted = false; }
  }, [activeIndex]);

  const handleSubmit = () => {
    alert();
  };

  const STEP = 0.1;
  const MIN = 0.01;
  const MAX = 10;

  return (
    <div className={cn("section-pt80", styles.section)}>
      <div className={cn("container", styles.container)}>
        <div className={styles.top}>
          <div className={styles.box}>
            <div className={styles.stage}>Explore</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}><span>View all &gt;</span></div>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.wrapper}>
            <div className={styles.list}>
              {tokens.length > 0 && tokens.map((x, index) => (
                <Card2 className={styles.card} item={x} key={index} isTrend={false} number={false}/>
              ))}
            </div>
            <div className={styles.btns}>
              <button className={cn("button-stroke", styles.button)}>
                <span>Load more</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
