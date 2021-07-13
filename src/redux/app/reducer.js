import * as actions from "./action";

const initialState = {
    detailPageParams: {},
    isLoadingPage: true,
    isEmptyPage: false,
    newFlag: null,
    flagsCount: 0,
}

export const appReducer = (state = initialState, action) => {
    switch(action.type) {
        case actions.ADD_FLAG_NOTI: 
            return {
                ...state,
                newFlag: {
                    ...action.flag,
                    id: state.flagsCount + 1,
                },
                flagsCount: state.flagsCount + 1,
            }
        case actions.UPDATE_FLAGS_SUCCESS: 
            return {
                ...state,
                newFlag: null,
            }
        case actions.START_LOADING_PAGE: 
            return {
                ...state,
                isLoadingPage: true,
            }
        case actions.STOP_LOADING_PAGE:
            return {
                ...state,
                isLoadingPage: false,
            }
        case actions.SET_DETAIL_DEAL_PAGE:
            return {
                ...state,
                detailPageParams: action.page
            }
        case actions.DISPLAY_EMPTY_PAGE_MESSAGE:
            return {
                ...state,
                isEmptyPage: true,
            }
        default:
            return state;
    }
}