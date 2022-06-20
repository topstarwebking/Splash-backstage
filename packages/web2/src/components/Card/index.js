import React, { useState, useEffect } from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import styles from "./Card.module.sass";
import Icon from "../Icon";
import moment from "moment"

import {
  useMeta,
} from '@oyster/common';

const Card = ({ className, item }) => {
  const { pullAuctionPage } = useMeta();

  const [currentTime, setCurrentTime] = useState(moment().utc());
  const targetTime = item.expiring_at ? moment(item.expiring_at) : moment().utc(); 
  const timeBetween = moment.duration(targetTime.diff(currentTime));

  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn(styles.card, className)}>
      <div className={styles.preview}>
        <img srcSet={`${item.coverData} 2x`} src={item.coverData} alt="Card" />
        <div className={styles.control}>
          <div
            className={cn(
              { "status-green": item.category === "green" },
              styles.category
            )}
          >
            {item.categoryText}
          </div>
          <button
            className={cn(styles.favorite, { [styles.active]: visible })}
            onClick={() => setVisible(!visible)}
          >
            <Icon name="heart" size="20" />
          </button>
          {
            item.status == 0 &
            <button className={cn("button-small", styles.button)}>
              <Link className={styles.link} to={`/auction/${item.auction}`}><span>Place a bid</span></Link>
              <Icon name="scatter-up" size="16" />
            </button>
          }
        </div>
      </div>

      <Link className={styles.link} key={item.auction} to={`/auction/${item.auction}`} onClick={() => pullAuctionPage(item.auction)}>
        <div className={styles.body}>
          <div className={styles.line}>
            <div className={styles.title}>Name: {item.name}</div>
            <div className={styles.price}>{item.cur_price} SOL</div>
          </div>

          <div className={styles.title}>Desc: {item.description}</div>

          <div className={styles.line}>
            <div className={styles.users}>
              {item.users.map((x, index) => (
                <div className={styles.avatar} key={index}>
                  <img src={x.avatar} alt="Avatar" />
                </div>
              ))}
            </div>
            <div className={styles.counter}>{item.stock} in stock</div>
          </div>
        </div>
        <div className={styles.foot}>
          <div className={styles.status}>
            <Icon name="candlesticks-up" size="20" />
            { item.status == 2 ?
              <span>Ended</span>
              : item.type == 0 ?
              <span>Never expires until be sold</span>
              :
              <span>Ending In {timeBetween.days()}d {timeBetween.hours()}h {timeBetween.minutes()}min {timeBetween.seconds()}s </span>
            }
          </div>
        </div>
        {
          item.bid_cnt > 0 && 
          <div className={styles.foot}>
            <div className={styles.status}>
              <Icon name="candlesticks-up" size="20" />
              Highest bid <span>{item.cur_price} SOL</span>
            </div>
            <div
              className={styles.bid}
              dangerouslySetInnerHTML={{ __html: item.bid }}
            />
          </div>
        }
      </Link>
    </div>
  );
};

export default Card;
