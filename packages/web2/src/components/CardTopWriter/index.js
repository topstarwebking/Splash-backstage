import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./CardTopWriter.module.sass";

const CardTopWriter = ({ className, item, number, isTrend }) => {
  return (
    <div className={cn(styles.card, className)}>
      {
        number &&
        <span className={styles.number}>{number}</span>
      }

      <div className={styles.preview}>
        <img src={item.preview} alt="Book" />

        <div className={styles.body}>
          <div className={styles.bodyavatar}>
            <img src={item.preview} alt="Book" />
          </div>
          <div className={styles.bodycontent}>
            <div className={styles.title}>{item.title}</div>
            <div className={styles.label}>{item.label}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardTopWriter;