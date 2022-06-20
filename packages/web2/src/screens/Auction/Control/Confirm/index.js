import React, {useState} from "react";
import cn from "classnames";
import styles from "./Confirm.module.sass";
import Modal from "../../../../components/Modal";

const items = [
  {
    title: "Service fee",
    value: 0,
    symbol: 'SOL'
  },
  {
    title: "Total bid amount",
    value: 1.46,
    symbol: 'SOL'
  },
];

const Confirm = ({ className }) => {
  const [acceptValue, setAcceptValue] = useState(0);
  const [visibleModalAccept, setVisibleModalAccept] = useState(false);
  // const [visibleModal, setModalAccept] = useState(true);

  return (
    <div className={cn(className, styles.accept)}>
      <div className={styles.line}>
        <div className={styles.icon}></div>
        <div className={styles.text}>
          You are about to accept a bid for <strong>C O I N Z</strong> from{" "}
          <strong>UI8</strong>
        </div>
      </div>
      <input className={styles.inputAccept}
            placeholder="1.46 SOL for 1 edition"
            value = {acceptValue}
            onChange={(e) => setAcceptValue(e.target.value)}/>
      <div className={styles.table}>
        {items.map((x, index) => (
          <div className={styles.row} key={index}>
            <div className={styles.col}>{x.title}</div>
            <div className={styles.col}>{index == 1 ? parseFloat(x.value) + parseFloat(acceptValue) : x.value}</div>
            <div className={styles.col}>{x.symbol}</div>
          </div>
        ))}
      </div>
      <div>
        <button className={cn("button", styles.button)} >Accept bid</button>
        <button className={cn("button-stroke", styles.button)} onClick={() => setVisibleModalAccept(true)}>Cancel</button>
      </div>
      <Modal 
        visible={visibleModalAccept}
      />      
    </div>
  );
};

export default Confirm;
