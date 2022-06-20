import React, { useMemo } from "react";

import Hero from "./Hero";
import Popular from "./Popular";
import Trending from "./Trending";
import TopWriters from "./TopWriters";
import HotBid from "../../components/HotBid";
import Collections from "./Collections";
import Discover from "./Discover";
import Description from "./Description";

import { saveAdmin } from '../../actions/saveAdmin';

import {
  useConnection,
  useStore,
  useWalletModal,
  WhitelistedCreator,
} from '@oyster/common';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMeta } from '../../contexts';

const Home = () => {
  const wallet = useWallet();
  const connection = useConnection();
  const { store, whitelistedCreatorsByCreator, isLoading } = useMeta();

  const addMeToWhitelisted = async () => {
    if (!wallet || !wallet.publicKey) return;

    console.log('#######wallet.publicKey.toBase58()##########');
    console.log(wallet.publicKey.toBase58());
    await saveAdmin(connection, wallet, true, [
      new WhitelistedCreator({
        address: wallet.publicKey.toBase58(),
        activated: true,
      }),
    ]);
  }

  // useMemo(() => {
  //   addMeToWhitelisted();
  // },[wallet]);

  // console.log('%%%%%%store%%%%%%');
  // console.log(store);
  return (
    <>
      <Hero />
      <Popular />
      <Trending />
      <TopWriters/>
      <Collections />
    </>
  );
};

export default Home;
