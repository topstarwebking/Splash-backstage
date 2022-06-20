import { WALLET_DLG_SHOWN, WALLET_DLG_HIDDEN } from "../actions/types";

const wallet_dlg = {
    visibility: false
}
export default function WalletDlgChanged(state = wallet_dlg, action) {
    switch(action.type) {
        case WALLET_DLG_SHOWN:
            return {...state, visibility: true};
        case WALLET_DLG_HIDDEN:
            return {...state, visibility: false};
        default:
            return {...state};
    }
}