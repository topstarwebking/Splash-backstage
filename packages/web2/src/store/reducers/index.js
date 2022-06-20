import { combineReducers } from "redux";
// import { Upload } from "../../../../backend/db";
import Auth from "./auth.reducers";
import Uploading from "./upload.reducer";
import WalletDlgChanged from "./wallet.reducers";

const reducers = combineReducers({
    auth: Auth,
    uploading: Uploading,
    walletDlg: WalletDlgChanged
})

export default reducers;