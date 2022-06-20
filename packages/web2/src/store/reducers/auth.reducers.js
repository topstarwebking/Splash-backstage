import { AUTH_LOGOUT, AUTH_SUCCESS } from "../actions/types";

const auth = {
    user: {}
}
export default function Auth(state = auth, action) {
    switch(action.type) {
        case AUTH_SUCCESS:
            return {...state, user: action.payload};
        case AUTH_LOGOUT:
            return {...state, user: action.payload};
        default:
            return {...state};
    }
}