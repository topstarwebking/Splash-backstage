import { useMemo, useState } from 'react';

import cn from "classnames";
import styles from "./Checkout.module.sass";
import Icon from "../../../../components/Icon";
import LoaderCircle from "../../../../components/LoaderCircle";
import { useInstantSaleState } from '../hooks/useInstantSaleState';
import { endSale } from '../utils/endSale';
import axios from 'axios';

import {
  useConnection,
  useUserAccounts,
  BidStateType,
  Bid,
  BidderPot,
  shortenAddress,
} from '@oyster/common';
import { useMeta } from '../../../../contexts';

import {
  WinningConfigType,
} from '@oyster/common/dist/lib/models/metaplex/index';

import {
  sendRedeemBid,
} from '../../../../actions/sendRedeemBid';

import { sendPlaceBid } from '../../../../actions/sendPlaceBid';

import {
  useBidsForAuction,
  useUserBalance,
  useCreators,
} from '../../../../hooks';

import { useWallet } from '@solana/wallet-adapter-react';
import BN from 'bn.js';
import { API_ENDPOINT } from '../../../../constants';

const items = [
  {
    title: "0.007",
    value: "SOL",
  },
  {
    title: "Your balance",
    value: "8.498 SOL",
  },
  {
    title: "Service fee",
    value: "0 SOL",
  },
  {
    title: "You will pay",
    value: "0.007 SOL",
  },
];

const Checkout = ({ className, onSucceed, pubKey, auctionView, onClose }) => {
  const [showFundsIssueModal, setShowFundsIssueModal] = useState(false)
  const [loading, setLoading] = useState<boolean>(false);
  const [showEndingBidModal, setShowEndingBidModal] = useState<boolean>(false);
  const [isOpenPurchase, setIsOpenPurchase] = useState<boolean>(false);
  const [showRedemptionIssue, setShowRedemptionIssue] = useState<boolean>(false);
  const [isOpenClaim, setIsOpenClaim] = useState<boolean>(false);

  const mintKey = auctionView.auction.info.tokenMint;
  const balance = useUserBalance(mintKey);
  const myPayingAccount = balance.accounts[0];
  const creators = useCreators(auctionView);

  const instantSalePrice = useMemo(() =>
    auctionView.auctionDataExtended?.info.instantSalePrice
    , [auctionView.auctionDataExtended]);

  const { canEndInstantSale, isAlreadyBought, canClaimPurchasedItem } =
    useInstantSaleState(auctionView);

  const connection = useConnection();
  const { accountByMint } = useUserAccounts();
  const bids = useBidsForAuction(auctionView.auction.pubkey);
  const { prizeTrackingTickets, bidRedemptions, update } = useMeta();
  const wallet = useWallet();

  const isAuctionManagerAuthorityNotWalletOwner =
    auctionView.auctionManager.authority !== wallet?.publicKey?.toBase58();
  const [lastBid, setLastBid] = useState<{ amount: BN } | undefined>(undefined);

  const newOwner = wallet?.publicKey?.toBase58();

  const endInstantSale = async () => {
    setLoading(true);

    try {
      await endSale({
        auctionView,
        connection,
        accountByMint,
        bids,
        bidRedemptions,
        prizeTrackingTickets,
        wallet,
      });
    } catch (e) {
      console.error('endAuction', e);
      setLoading(false);
      return;
    }

    // Update Token
    const info = {
      'id': pubKey,
      'newOwner': newOwner,
      'locked': 100
    }
    await axios.post(API_ENDPOINT + "/token/update", info);
    
    // Update Auction
    const data = {
      'id': auctionView.auction.pubkey,
      'status': 2
    }
    await axios.post(API_ENDPOINT + "/auction/update", data);

    setShowEndingBidModal(true);
    alert('Your sale has been ended please view your NFTs in ');

    setLoading(false);

    onSucceed();
  };
  
  const instantSale = async () => {
    setLoading(true);
    const winningConfigType = auctionView.participationItem?.winningConfigType ||
       auctionView.items[0][0].winningConfigType;

    const isAuctionItemMaster = [
      WinningConfigType.FullRightsTransfer,
      WinningConfigType.TokenOnlyTransfer,
    ].includes(winningConfigType);
    const allowBidToPublic =
      myPayingAccount &&
      !auctionView.myBidderPot &&
      isAuctionManagerAuthorityNotWalletOwner;
    const allowBidToAuctionOwner =
      myPayingAccount &&
      !isAuctionManagerAuthorityNotWalletOwner &&
      isAuctionItemMaster;

    // Placing a "bid" of the full amount results in a purchase to redeem.
    if (instantSalePrice && (allowBidToPublic || allowBidToAuctionOwner)) {
      try {
        console.log('sendPlaceBid');
        const bid = await sendPlaceBid(
          connection,
          wallet,
          myPayingAccount.pubkey,
          auctionView,
          accountByMint,
          instantSalePrice,
          // make sure all accounts are created
          'finalized',
        );
        setLastBid(bid);
      } catch (e) {
        console.error('sendPlaceBid', e);
        setLoading(false);
        alert(e);

        return;
      }
    }

    const newAuctionState = await update(
      auctionView.auction.pubkey,
      wallet.publicKey,
    );
    auctionView.auction = newAuctionState[0];
    auctionView.myBidderPot = newAuctionState[1];
    auctionView.myBidderMetadata = newAuctionState[2];
    if (
      wallet.publicKey &&
      auctionView.auction.info.bidState.type == BidStateType.EnglishAuction
    ) {
      const winnerIndex = auctionView.auction.info.bidState.getWinnerIndex(
        wallet.publicKey.toBase58(),
      );
      if (winnerIndex === null)
        auctionView.auction.info.bidState.bids.unshift(
          new Bid({
            key: wallet.publicKey.toBase58(),
            amount: instantSalePrice || new BN(0),
          }),
        );
      // It isnt here yet
      if (!auctionView.myBidderPot)
        auctionView.myBidderPot = {
          pubkey: 'none',
          //@ts-ignore
          account: {},
          info: new BidderPot({
            bidderPot: 'dummy',
            bidderAct: wallet.publicKey.toBase58(),
            auctionAct: auctionView.auction.pubkey,
            emptied: false,
          }),
        };
    }

    // Claim the purchase
    try {
      await sendRedeemBid(
        connection,
        wallet,
        myPayingAccount.pubkey,
        auctionView,
        accountByMint,
        prizeTrackingTickets,
        bidRedemptions,
        bids,
      );

      await update();
      if (canClaimPurchasedItem) {
        setIsOpenClaim(true);
        alert(`You have claimed your item from ${creators.map(item => ' ' + (item.name || shortenAddress(item.address || '')))}!`);
      }
      else {
        setIsOpenPurchase(true);
        alert('Reload the page and click claim to receive your NFT. Then check your wallet to confirm it has arrived. It may take a few minutes to process.');
      }
    } catch (e) {
      console.error(e);
      setShowRedemptionIssue(true);
      alert('There was an issue redeeming or refunding your bid. Please try again.');
    }

    setLoading(false);
    onSucceed();
  };

  const instantSaleAction = () => {
    const isNotEnoughLamports = balance.balanceLamports < (instantSalePrice?.toNumber()  || 0)
    if (isNotEnoughLamports) {
      setShowFundsIssueModal(true);
      return;
    }

    if (canEndInstantSale) {
      return endInstantSale();
    }

    return instantSale();
  };

  return (
    <div className={cn(className, styles.checkout)}>
      <div className={cn("h4", styles.title)}>Checkout</div>
      <div className={styles.info}>
        You are about to purchase <strong>C O I N Z</strong> from{" "}
        <strong>UI8</strong>
      </div>
      <div className={styles.table}>
        {items.map((x, index) => (
          <div className={styles.row} key={index}>
            <div className={styles.col}>{x.title}</div>
            <div className={styles.col}>{x.value}</div>
          </div>
        ))}
      </div>
      {/* <div className={styles.attention}>
        <div className={styles.preview}>
          <Icon name="info-circle" size="32" />
        </div>
        <div className={styles.details}>
          <div className={styles.subtitle}>This creator is not verified</div>
          <div className={styles.text}>Purchase this item at your own risk</div>
        </div>
      </div> */}
      {
        loading &&
        <div className={styles.line}>
        <div className={styles.icon}>
          <LoaderCircle className={styles.loader} />
        </div>
        <div className={styles.details}>
          <div className={styles.subtitle}>Purchasing</div>
          <div className={styles.text}>
            Sending transaction with your wallet
          </div>
        </div>
      </div>
      }
      {/* <div className={styles.attention}>
        <div className={styles.preview}>
          <Icon name="info-circle" size="32" />
        </div>
        <div className={styles.details}>
          <div className={styles.subtitle}>This creator is not verified</div>
          <div className={styles.text}>Purchase this item at your own risk</div>
        </div>
        <div className={styles.avatar}>
          <img src="/images/content/avatar-3.jpg" alt="Avatar" />
        </div>
      </div> */}
      <div className={styles.btns}>
        <button className={cn("button", styles.button)} onClick={() => instantSaleAction()}>
          I understand, continue
        </button>
        <button className={cn("button-stroke", styles.button)} onClick={() => onClose()}>Cancel</button>
      </div>
    </div>
  );
};

export default Checkout;
