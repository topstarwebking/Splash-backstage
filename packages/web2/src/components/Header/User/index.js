import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import OutsideClickHandler from "react-outside-click-handler";
import styles from "./User.module.sass";
import Icon from "../../Icon";
import { useWallet } from '@solana/wallet-adapter-react';
import Theme from "../../Theme";

const items = [
  {
    title: "My profile",
    icon: "user",
    url: "/profile",
  },
  {
    title: "My items",
    icon: "image",
    url: "/item",
  },
  // {
  //   title: "Dark theme",
  //   icon: "bulb",
  // }
];

const User = ({ className, user, logout }) => {
  const { publicKey } = useWallet();
  const owner = publicKey?.toBase58();
  const [visible, setVisible] = useState(false);
  const [address, setAddress] = useState('');

  useEffect(() => {
    setAddress(owner);
  });

  return (
    <OutsideClickHandler onOutsideClick={() => setVisible(false)}>
      <div className={cn(styles.user, className)}>
        <div className={styles.head} onClick={() => setVisible(!visible)}>
          <div className={styles.avatar}>
            <img src="/images/content/avatar-user.jpg" alt="Avatar" />
          </div>
        </div>
        {visible && (
          <div className={styles.body}>
            <div className={styles.name}>Enrico Cole</div>
            <div className={styles.code}>
              <div className={styles.number}>{address.substr(0,14) + "..." + address.substr(address.length - 4)}</div>
              <button className={styles.copy}>
                <Icon name="copy" size="16" />
              </button>
            </div>
            <div className={styles.wrap}>
              <div className={styles.line}>
                <div className={styles.preview}>
                  <img
                    src="/images/content/solana-sol-logo.png"
                    alt="SOL"
                  />
                </div>
                <div className={styles.details}>
                  <div className={styles.info}>Balance</div>
                  <div className={styles.price}>4.689 SOL</div>
                </div>
              </div>
            </div>
            <div className={styles.menu}>
              {items.map((x, index) =>
                x.url ? (
                  x.url.startsWith("http") ? (
                    <a
                      className={styles.item}
                      href={x.url}
                      rel="noopener noreferrer"
                      key={index}
                    >
                      <div className={styles.icon}>
                        <Icon name={x.icon} size="20" />
                      </div>
                      <div className={styles.text}>{x.title}</div>
                    </a>
                  ) : (
                    <Link
                      className={styles.item}
                      to={x.url}
                      onClick={() => setVisible(!visible)}
                      key={index}
                    >
                      <div className={styles.icon}>
                        <Icon name={x.icon} size="20" />
                      </div>
                      <div className={styles.text}>{x.title}</div>
                    </Link>
                  )
                ) : (
                  <></>
                  // <div className={styles.item} key={index}>
                  //   <div className={styles.icon}>
                  //     <Icon name={x.icon} size="20" />
                  //   </div>
                  //   <div className={styles.text}>{x.title}</div>
                  //   <Theme className={styles.theme} />
                  // </div>
                )
              )}
              <a
                className={styles.item}
                href="#"
              >
                <div className={styles.icon}>
                  <Icon name="exit" size="20" />
                </div>
                <div className={styles.text} onClick={() => logout()}>Disconnect</div>
              </a>
            </div>
          </div>
        )}
      </div>
    </OutsideClickHandler>
  );
};

export default User;