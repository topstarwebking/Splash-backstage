import { WALLET_DLG_SHOWN, WALLET_DLG_HIDDEN } from "./types"

export const walletDlgShow = () => dispatch => {
    dispatch({
        type: WALLET_DLG_SHOWN,
        payload: true
    })
}

export const walletDlgHide = () => dispatch => {
    dispatch({
        type: WALLET_DLG_HIDDEN,
        payload: false
    })
}