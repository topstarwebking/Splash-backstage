import React, { useState, useEffect } from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import styles from "./Card2.module.sass";

import {
  useMeta,
} from '@oyster/common';

const Card2 = ({ className, item, number, isTrend }) => {
  const [isFavor, setIsFavor] = useState(false);
  const { pullAuctionPage } = useMeta();

  return (
    <div className={cn(styles.card, className)}>
      {
        isFavor ?
        <img className={styles.heart} src="/images/content/heart_s.png" alt="Heart" onClick={(e)=>e.preventDefault() & setIsFavor(false)}/>
        :
        <img className={styles.heart} src="/images/content/heart.png" alt="Heart" onClick={(e)=> e.preventDefault() & setIsFavor(true)}/>
      }

      {
        number &&
        <span className={styles.number}>{number}</span>
      }

      {
        isTrend &&
        <img className={styles.trend} src="/images/content/trend.png" alt="Trend" />
      }
    <Link className={styles.link} key={item.auction} to={`/auction/${item.auction}`} onClick={() => pullAuctionPage(item.auction)}>

      <div className={styles.preview}>
        <img src={item.coverData} alt="Book" />

        <div className={styles.body}>
          <div className={styles.content1}>
            <div className={styles.title}>{item.description}</div>
            <div className={styles.label}>{item.name}</div>
          </div>

          <div className={styles.content2}>
            <div className={styles.counter}>{item.cur_price} SOL</div>
          </div>
        </div>
      </div>
    </Link>

    </div>
  );
};

export default Card2;