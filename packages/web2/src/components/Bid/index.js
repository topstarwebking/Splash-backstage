import React, {useState} from "react";
import cn from "classnames";
import styles from "./Bid.module.sass";
import Modal from "../../components/Modal";

const items = [
  {
    title: "Your balance",
    value: 8.498,
    symbol: 'SOL'
  },
  {
    title: "Service fee",
    value: 1,
    symbol: 'SOL'
  },
  {
    title: "Total bid amount",
    value: 0,
    symbol: 'SOL'
  },
];


const Bid = ({ className }) => {
  const [visibleModalBid, setVisibleModalBid] = useState(false);
  const [visibleModalConfirm, setVisibleModalConfirm] = useState(false);
  const [bidValue, setBidValue] = useState(0);
  // const [visiblemodal, setmodal] = useState(false);

  return (
    <div className={cn(className, styles.checkout)}>
      <div className={cn("h4", styles.title)}>Place a bid</div>
      <div className={styles.info}>
        You are about to purchase <strong>C O I N Z</strong> from{" "}
        <strong>UI8</strong>
      </div>
      <div className={styles.stage}>Your bid</div>     
      <div className={styles.table}>
        <div className={styles.row}>
          <input className={styles.inputBid}
            placeholder="Enter your bid count number"
            value = {bidValue}
            onChange={(e) => setBidValue(e.target.value)}/>
          <div className={styles.col}></div>
        </div>
        {items.map((x, index) => (
          <div className={styles.row} key={index}>
            <div className={styles.col}>{x.title}</div>
            <div className={styles.col}>{index == 0 ? parseFloat(x.value) - parseFloat(bidValue) : x.value}</div>
          </div>
        ))}
      </div>
      <div className={styles.btns}>
        <button className={cn("button", styles.button)} onClick={() => setVisibleModalConfirm(true)}>Place a bid</button>
        <button className={cn("button-stroke", styles.button)} onClick={() => setVisibleModalBid(true)}>Cancel</button>
      </div>
      <Modal 
        visible={visibleModalBid}
      />  
      <Modal
        visible={visibleModalConfirm}
        onClose={() => setVisibleModalConfirm(false)}
      >Successfully done!</Modal>
    </div>
  );
};

export default Bid;
