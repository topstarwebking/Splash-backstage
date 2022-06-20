import { UPLOAD_CREATE_SUCCESS, UPLOAD_CREATE_FAILL, GET_UPLOADED_NFTS_FAIL, GET_UPLOADED_NFTS_SUCCESS } from "../actions/types";

const uploading = {
    upload: {},
    uploadedNfts: []
}
export default function Uploading(state = uploading, action) {
    switch(action.type) {
        case UPLOAD_CREATE_SUCCESS:
            return {...state, upload: action.payload};
        case UPLOAD_CREATE_FAILL:
            return {...state, upload: action.payload};
        case GET_UPLOADED_NFTS_SUCCESS:
            return {...state, uploadedNfts: action.payload};
        case GET_UPLOADED_NFTS_FAIL:
            return {...state, uploadedNfts: action.payload};
        default:
            return {...state};
    }
}