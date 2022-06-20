import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./styles/app.sass";

import Page from "./components/Page";
import Home from "./screens/Home";
import UploadVariants from "./screens/UploadVariants";
import UploadDetails from "./screens/UploadDetails";
import ConnectWallet from "./screens/ConnectWallet";
import Faq from "./screens/Faq";
import Activity from "./screens/Activity";
import Search01 from "./screens/Search01";
import Search02 from "./screens/Search02";
import Profile from "./screens/Profile";
import ProfileEdit from "./screens/ProfileEdit";
import Item from "./screens/Item";
import PageList from "./screens/PageList";
import AuctionPage from "./screens/Auction";

import { useStore } from '@oyster/common';
import { useMeta } from './contexts';
import { SetupView } from './screens/Home/Setup/setup';

import Collections from './screens/Home/Collections';

function AppRoutes() {
  const { isLoading, store } = useMeta();
  const { isConfigured } = useStore();

  // const showAuctions = (store && isConfigured) || isLoading;
  const showAuctions = isConfigured;

  return (
    <Router>
      <Switch>
        <Route
          exact
          path="/"
          render={() => ( showAuctions ? (
            <Page>
              <Home />
            </Page>
          ): (
            <Page>
              <SetupView/>
            </Page>
          )
          )}
        />
        <Route
          exact
          path="/upload-variants"
          render={() => (
            <Page>
              <UploadVariants />
            </Page>
          )}
        />
        <Route
          exact
          path="/upload-details"
          render={() => (
            <Page>
              <UploadDetails />
            </Page>
          )}
        />
        <Route
          exact
          path="/connect-wallet"
          render={() => (
            <Page>
              <ConnectWallet />
            </Page>
          )}
        />
        <Route
          exact
          path="/faq"
          render={() => (
            <Page>
              <Faq />
            </Page>
          )}
        />
        <Route
          exact
          path="/activity"
          render={() => (
            <Page>
              <Activity />
            </Page>
          )}
        />
        <Route
          exact
          path="/search01"
          render={() => (
            <Page>
              <Search01 />
            </Page>
          )}
        />
        <Route
          exact
          path="/search02"
          render={() => (
            <Page>
              <Search02 />
            </Page>
          )}
        />
        <Route
          exact
          path="/profile"
          render={() => (
            <Page>
              <Profile />
            </Page>
          )}
        />
        <Route
          exact
          path="/profile-edit"
          render={() => (
            <Page>
              <ProfileEdit />
            </Page>
          )}
        />
        <Route
          exact
          path="/item"
          render={() => (
            <Page>
              <Item />
            </Page>
          )}
        />
        <Route
          exact
          path="/auction/:id"
          component={() => (
            <Page>
              <AuctionPage/>
            </Page>
          )}
        />
        <Route
          exact
          path="/pagelist"
          render={() => (
            <Page>
              <PageList />
            </Page>
          )}
        />
        
        <Route
          exact
          path="/categories"
          render={() => (
            <Page>
              <Collections />
            </Page>
          )}
        />
      </Switch>
    </Router>
  );
}

export default AppRoutes;