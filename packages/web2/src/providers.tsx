import {
  AccountsProvider,
  ConnectionProvider,
  StoreProvider,
  WalletProvider,
  MetaProvider,
} from '@oyster/common';

import AppRoutes from "./AppRoutes";

import React, { FC } from 'react';
// import { ConfettiProvider } from './components/Confetti';
// import { AppLayout } from './components/Layout';
import { LoaderProvider } from './components/GlobalLoader';
import { CoingeckoProvider } from './contexts/coingecko';
import { SPLTokenListProvider } from './contexts/tokenList';

import { HashRouter, Route, Switch } from 'react-router-dom';

export const Providers: FC = ({ children }) => {
  return (
    <HashRouter basename={'/'}>
      <ConnectionProvider>
        <WalletProvider>
          <AccountsProvider>
            <SPLTokenListProvider>
              <CoingeckoProvider>
                <StoreProvider
                  ownerAddress={'DRmLANN1qXBELs69gW5upY4qH4iWc23MTcRPjDuzZYuH'}
                  storeAddress={process.env.NEXT_PUBLIC_STORE_ADDRESS}
                >
                  <MetaProvider>
                    {/* <LoaderProvider> */}
                      <AppRoutes />
                    {/* </LoaderProvider> */}
                  </MetaProvider>
                </StoreProvider>
              </CoingeckoProvider>
            </SPLTokenListProvider>
          </AccountsProvider>
        </WalletProvider>
      </ConnectionProvider>
    </HashRouter>
  );
};
