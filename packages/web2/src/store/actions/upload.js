import { 
    UPLOAD_CREATE, 
    UPLOAD_UPDATE, 
    UPLOAD_DELETE, 
    UPLOAD_CREATE_FAILL, 
    UPLOAD_CREATE_SUCCESS, 
    GET_UPLOADED_NFTS_FAIL, GET_UPLOADED_NFTS_SUCCESS } from "./types"
import axios from 'axios';

// export const uploadCreate = (address,itemName,itemDesc,itemSize,itemProperty,royalties,price,locking) => async (dispatch) => {
export const uploadCreate = (hashValue, address,itemName,itemDesc,itemSize,itemProperty,royalties,price,locking) => async (dispatch) => {
  
    const {data} = await axios.post("http://localhost:5000/api/v1/upload/upload_details", {hashValue, address,itemName,itemDesc,itemSize,itemProperty,royalties,price,locking})
    try {
        if(data.message){
            dispatch({ type: UPLOAD_CREATE_FAILL, payload: data.message})

        }else {
            dispatch({ type: UPLOAD_CREATE_SUCCESS, payload: data})
        }

    } catch (error) {
        dispatch({ type: UPLOAD_CREATE_FAILL, payload: error})        
    }   
}

export const getUploadedNFTs = () => async (dispatch) => {
  
    try {
        const { data } = await axios.get("http://localhost:5000/api/v1/upload")
        if(data.message){
            dispatch({ type: GET_UPLOADED_NFTS_FAIL, payload: data.message})
        }else {
            dispatch({ type: GET_UPLOADED_NFTS_SUCCESS, payload: data})
        }

    } catch (error) {
        dispatch({ type: GET_UPLOADED_NFTS_FAIL, payload: error})        
    }   
}


// export const uploadUpdate = () => dispatch => {
//     dispatch({
//         type: UPLOAD_UPDATE,
//         payload: {}
//     })
// }