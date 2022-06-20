import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import cn from 'classnames';
import styles from './Header.module.sass';
import Icon from '../Icon';
import Image from '../Image';
import Notification from './Notification';
import User from './User';
import { useWallet } from '@solana/wallet-adapter-react';
import { connect, useDispatch } from 'react-redux';
import { walletDlgShow } from '../../store/actions/wallet.actions';

const nav = [
  {
    url: '/categories',
    title: 'Categories',
  },
  {
    url: '/search01',
    title: 'Explore',
  },
  {
    url: '#',
    title: 'Stats',
  },
  {
    url: '#',
    title: 'Resources',
  },
  // {
  //   url: "/profile",
  //   title: "Profile",
  // },
];

const Header = props => {
  const [visibleNav, setVisibleNav] = useState(false);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState({});
  const { connected, disconnect } = useWallet();

  useEffect(() => {
    setUser(props.user);
  }, [props]);

  const handleSubmit = e => {};

  const dispatch = useDispatch();
  const openWalletModal = () => {
    walletDlgShow()(dispatch);
  };

  return (
    <header className={styles.header}>
      <div className={cn('container', styles.container)}>
        <Link className={styles.logo} to="/">
          <Image
            className={styles.pic}
            src="/images/logo.png"
            srcDark="/images/logo.png"
            alt="Odiggo"
          />
        </Link>
        <div className={cn(styles.wrapper, { [styles.active]: visibleNav })}>
          <form
            className={styles.search}
            action=""
            onSubmit={() => handleSubmit()}
          >
            <input
              className={styles.input}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              name="search"
              placeholder="Search..."
              required
            />
            <button className={styles.result}>
              <Icon name="search" size="20" />
            </button>
          </form>
          {connected && (
            <Link
              className={cn('button-small', styles.button)}
              to="/upload-details"
            >
              Create
            </Link>
          )}
        </div>
        <nav className={styles.nav}>
          {nav.map((x, index) => (
            <Link
              className={styles.link}
              // activeClassName={styles.active}
              to={x.url}
              key={index}
            >
              {x.title}
            </Link>
          ))}
        </nav>
        {!connected ? (
          <div className={styles.wallet} onClick={openWalletModal}>
            <Image
              src="/images/content/wallet_n.png"
              srcDark="/images/content/wallet_n.png"
              alt="Wallet"
            />
            <Image
              className={styles.imgtop}
              src="/images/content/wallet.png"
              srcDark="/images/content/wallet.png"
              alt="Wallet"
            />
          </div>
        ) : (
          <User
            className={styles.user}
            user={user}
            logout={() => disconnect() /*props.authLogout()*/}
          />
        )}
        {connected && (
          <Link
            className={cn('button-small', styles.button)}
            to="/upload-details"
          >
            Create
          </Link>
        )}

        <button
          className={cn(styles.burger, { [styles.active]: visibleNav })}
          onClick={() => setVisibleNav(!visibleNav)}
        ></button>
      </div>
    </header>
  );
};

// export default WalletConnectModal;
const mapToStateProps = ({ walletDlg }) => ({
  visibility: walletDlg.visibility,
});

const mapToDispatchProps = dispatch => ({
  walletDlgShow: () => dispatch(walletDlgShow()),
});
export default connect(mapToStateProps, mapToDispatchProps)(Header);
