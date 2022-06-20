import React, { useEffect } from "react";
import { withRouter, useLocation } from "react-router-dom";
import { clearAllBodyScrollLocks } from "body-scroll-lock";
import styles from "./Page.module.sass";
import Header from "../Header";
import Footer from "../Footer";
import WalletConnectModal from "../WalletConnectModal";

const Page = ({ children }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    clearAllBodyScrollLocks();
  }, [pathname]);

  return (
    <div className={styles.page}>
      <Header visibility={false}/>
      <WalletConnectModal/>

      <div className={styles.inner}>{children}</div>
      <Footer />
    </div>
  );
};

export default withRouter(Page);
