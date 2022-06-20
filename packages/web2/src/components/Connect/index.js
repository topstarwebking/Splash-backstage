import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import User from "../Header/User";
import { connect } from "react-redux";
import { authLogout } from "../../store/actions/auth.actions";
import cn from "classnames";
import styles from "./Connect.module.sass";
import Icon from "../Icon";
import Modal from "../../components/Modal";

const Connect = ({ props, className }) => {
  const [visibleModalBid, setVisibleModalBid] = useState(false);
  const [user, setUser] = useState({});

  useEffect(() => {
    setUser(user);
  },[props])

  return (
    <div className={cn(className, styles.connect)}>
      <div className={styles.icon}>
        <Icon name="wallet" size="24" />
      </div>
      <div className={styles.info}>
        You need to connect your wallet first to sign messages and send
        transaction to Solana network
      </div>
      <div className={styles.btns}>
      {!Object.keys(user).length ?
          <Link
            className={cn("button-stroke button-small", styles.button)}
            to="/connect-wallet"
          >
            Connect Wallet
          </Link>
          : <User className={styles.user} user={user} logout={() => props.authLogout()}/>
        }
        <button className={cn("button-stroke", styles.button)} onClick={() => setVisibleModalBid(true)}>Cancel</button>
      </div>
      <Modal 
        visible={visibleModalBid}
      />
     
    </div>
  );
};

const mapToStateProps = ({auth}) => ({
  user: auth.user
})

const mapToDispatchProps = dispatch => ({
  authLogout: () => dispatch(authLogout())
})

export default  connect(mapToStateProps, mapToDispatchProps)(Connect);
