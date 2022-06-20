import React, {useCallback, createContext, useContext, FC } from "react";

import styles from "./WalletConnectModal.module.sass";
import Modal2 from "../Modal2";
// import { useWalletModal } from '@oyster/common';

import {
  useWallet,
} from '@solana/wallet-adapter-react';

import { walletDlgHide } from "../../store/actions/wallet.actions";
import { connect, useDispatch} from "react-redux";

const WalletConnectModal = (props) => {
  const { wallets, wallet: selected, select } = useWallet();

  const dispatch = useDispatch();
  const close = useCallback(() => {
    walletDlgHide()(dispatch);
  }, []);

  return (
    <Modal2
      visible={props.visibility}
      onClose={close}
      containerClassName={styles.wallet_adapter_modal_container}
    >
      <h1 className={styles.wallet_adapter_modal_title}>Connect Wallet</h1>
      <ul className={styles.wallet_adapter_modal_list}>
        {wallets.map((wallet, idx) => {
          return (
            <li key={idx}>
              <button
                className={styles.wallet_adapter_button}
                onClick={() => {
                  select(wallet.name);
                  close();
                }}
              >
                Connect to {wallet.name}
                <i className={styles.wallet_adapter_button_end_icon}>
                  <img src={wallet?.icon} style={{ width: '1.2rem' }} />
                </i>
              </button>
            </li>
          );
        })}
      </ul>
    </Modal2>
  );
};

// export default WalletConnectModal;
const mapToStateProps = ({walletDlg}) => ({
  visibility: walletDlg.visibility
});

const mapToDispatchProps = (dispatch) => ({
  walletDlgHide: () => dispatch(walletDlgHide())
})
export default connect(mapToStateProps, mapToDispatchProps)(WalletConnectModal);