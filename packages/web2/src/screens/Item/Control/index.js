import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Control.module.sass";
import Checkout from "./Checkout";
import Connect from "../../../components/Connect";
import Bid from "../../../components/Bid";
import Accept from "./Accept";
import SaleInstant from "./SaleInstant";
import SaleAuction from "./SaleAuction";
import PDFViewer from "./PDFViewer";
import Confirm from "./Confirm";
import SuccessfullyPurchased from "./SuccessfullyPurchased";
import Modal from "../../../components/Modal";
import ModalPDF from "../../../components/ModalPDF";

const Control = ({ className, isOwner, lockedStatus, isLocked, pdf, pubKey }) => {
  const [visibleModalPurchase, setVisibleModalPurchase] = useState(false);
  const [visibleModalBid, setVisibleModalBid] = useState(false);
  const [visibleModalAccept, setVisibleModalAccept] = useState(false);
  const [visibleModalSaleInstant, setVisibleModalSaleInstant] = useState(false);
  const [visibleModalSaleAuction, setVisibleModalSaleAuction] = useState(false);
  const [visibleModalConfirm, setVisibleModalConfirm] = useState(false);

  const [visibleModalPDFView, setVisibleModalPDFView] = useState(false);

  const closePDFViewer = () => {
    setVisibleModalPDFView(false);
  }

  const closePutSaleInstant = () => {
    setVisibleModalSaleInstant(false);
  }

  const closePutSaleAuction = () => {
    setVisibleModalSaleAuction(false);
  }

  //////////////////////////////////////////////
  return (
    <>
      <div className={cn(styles.control, className)}>
        {
          isLocked &&
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
        }
        {
          !isOwner && lockedStatus == 0 && (
            <div className={styles.btns}>
              <button
                className={cn("button", styles.button)}
                onClick={() => setVisibleModalPurchase(true)}
              >
                Purchase now
              </button>
              <button
                className={cn("button-stroke", styles.button)}
                onClick={() => setVisibleModalBid(true)}
              >
                Make an Offer
              </button>
            </div>
          )
        }
        {
          isOwner &&
          <>
            {
              isLocked &&
              <div className={styles.btns}>
                <button className={cn("button-stroke", styles.button)}>
                  View all
                </button>
                {
                  lockedStatus != 100 &&
                    <button
                    className={cn("button", styles.button)}
                    onClick={() => setVisibleModalAccept(true)}
                  >
                    Accept
                  </button>
                }
              </div>
            }
            <div className={styles.text}>
              Service fee <span className={styles.percent}>1.5%</span>{" "}
              <span>2.563 SOL</span> <span>$4,540.62</span>
            </div>
            {
              !isLocked &&
              <>
                <div className={styles.foot}>
                  <div className={styles.btns}>
                    <button
                      className={cn("button", styles.button)}
                      onClick={() => setVisibleModalSaleInstant(true)}
                    >
                      Instant Sale
                    </button>
                    <button
                      className={cn("button", styles.button)}
                      onClick={() => setVisibleModalSaleAuction(true)}
                    >
                      Auction sale
                    </button>
                  </div>
                </div>
              </>
            }
            <div className={styles.foot}>
              <button
                className={cn("button", styles.button)}
                onClick={() => setVisibleModalPDFView(true)}
              >
                View Document
              </button>
            </div>
          </>
        }
        <div className={styles.note}>
          You can sell this token on Cryptor Marketplace
        </div>
      </div>
      <Modal
        visible={visibleModalPurchase}
        onClose={() => setVisibleModalPurchase(false)}
      >
        <Checkout />
        <SuccessfullyPurchased />
      </Modal>
      <Modal
        visible={visibleModalBid}
        onClose={() => setVisibleModalBid(false)}
      >
        <Connect />
        <Bid />
      </Modal>
      <Modal
        visible={visibleModalAccept}
        onClose={() => setVisibleModalAccept(false)}
      >
        <Accept />
      </Modal>

      <Modal
        visible={visibleModalSaleInstant}
        onClose={() => setVisibleModalSaleInstant(false)}
      >
        <SaleInstant close={closePutSaleInstant} pubKey={pubKey} />
      </Modal>

      <Modal
        visible={visibleModalSaleAuction}
        onClose={() => setVisibleModalSaleAuction(false)}
      >
        <SaleAuction close={closePutSaleAuction} pubKey={pubKey}/>
      </Modal>

      <Modal
        visible={visibleModalConfirm}
        onClose={() => setVisibleModalConfirm(false)}
      >
        <Confirm />
      </Modal>

      <ModalPDF
        visible={visibleModalPDFView}
        onClose={() => setVisibleModalPDFView(false)}
      >
        <PDFViewer pdf={pdf} close={closePDFViewer} />
      </ModalPDF>
    </>
  );
};

export default Control;
