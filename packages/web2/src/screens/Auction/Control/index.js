import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Control.module.sass";
import Checkout from "./Checkout";
import PDFViewer from "./PDFViewer";
import SuccessfullyPurchased from "./SuccessfullyPurchased";
import Modal from "../../../components/Modal";
import ModalPDF from "../../../components/ModalPDF";
import Bid from "../../../components/Bid";
import { useActionButtonContent } from './hooks/useActionButtonContent';

const Control = ({ className, lock_status, lock_type, pdf, pubKey, auctionView, isOwner }) => {
  const [visibleModalPurchase, setVisibleModalPurchase] = useState(false);
  const [visibleModalPDFView, setVisibleModalPDFView] = useState(false);
  const [visibleModalBid, setVisibleModalBid] = useState(false);
  const [purchased, setPurchased] = useState(false);

  const actionButtonContent = useActionButtonContent(auctionView);

  const closePDFViewer = () => {
    setVisibleModalPDFView(false);
  }

  const onSucceedPurchase = () => {
    setPurchased(true);
  }

  const determineActionButton = () => {
    if (actionButtonContent === 'Place Bid') {
    } else if(actionButtonContent === 'Claim Purchase') {
    } else if(actionButtonContent === 'Claim item') {
    } else if(actionButtonContent === 'End sale & claim item') {
    } else if(actionButtonContent === 'Buy now') {
    }

    // setVisibleModalPurchase(true);
  }

  //////////////////////////////////////////////
  return (
    <>
      <div className={cn(styles.control, className)}>
        <div className={styles.head}>
          <div className={styles.avatar}>
            <img src="/images/content/avatar-4.jpg" alt="Avatar" />
          </div>
          <div className={styles.details}>
            <div className={styles.info}>
              Highest bid by <span>Kohaku Tora</span>
            </div>
            <div className={styles.cost}>
              <div className={styles.price}>1.46 SOL</div>
              <div className={styles.price}>$2,764.89</div>
            </div>
          </div>
        </div>

        {
          <>
            <div className={styles.btns}>
              <button className={cn("button-stroke", styles.button)}>
                View all
              </button>
              <button
                className={cn("button", styles.button)}
                onClick={() => determineActionButton()}
              >
                {actionButtonContent}
              </button>
            </div>
            {
              isOwner &&
              <div className={styles.foot}>
                <button
                  className={cn("button", styles.button)}
                  onClick={() => setVisibleModalPDFView(true)}
                >
                  View Document
                </button>
              </div>
            }
          </>
        }
        <div className={styles.note}>
          You can sell this token on Cryptor Marketplace
        </div>
      </div>

      <Modal
        visible={visibleModalPurchase}
        onClose={() => setPurchased(false) & setVisibleModalPurchase(false)}
      >
        {
          !purchased ?
          <Checkout 
            pubKey={pubKey} 
            onClose={() => setPurchased(false) & setVisibleModalPurchase(false)} 
            auctionView={auctionView} 
            onSucceed={onSucceedPurchase}/>
          :
          <SuccessfullyPurchased />
        }
      </Modal>

      <ModalPDF
        visible={visibleModalPDFView}
        onClose={() => setVisibleModalPDFView(false)}
      >
        <PDFViewer pdf={pdf} close={closePDFViewer} />
      </ModalPDF>

      <Modal
        visible={visibleModalBid}
        onClose={() => setVisibleModalBid(false)}
      >
        <Bid />
      </Modal>
    </>
  );
};

export default Control;
