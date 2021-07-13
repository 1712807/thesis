export const START_LOADING_PAGE = "START_LOADING_PAGE";
export const STOP_LOADING_PAGE = "STOP_LOADING_PAGE";

export const startLoadingPage = () => ({
    type: START_LOADING_PAGE,
})

export const stopLoadingPage = () => ({
    type: STOP_LOADING_PAGE,
})

export const SET_DETAIL_DEAL_PAGE = "SET_DETAIL_DEAL_PAGE";
export const setDetailDealPage = (page) => ({
    type: SET_DETAIL_DEAL_PAGE,
    page,
})

export const DISPLAY_EMPTY_PAGE_MESSAGE = "DISPLAY_EMPTY_PAGE_MESSAGE";
export const displayErrorMessage = () => ({
    type: DISPLAY_EMPTY_PAGE_MESSAGE,
})

export const ADD_FLAG_NOTI = "ADD_FLAG_NOTI";
export const addFlagNoti = (flag) => ({
    type: ADD_FLAG_NOTI,
    flag,
})

export const UPDATE_FLAGS_SUCCESS = "UPDATE_FLAGS_SUCCESS";
export const updateFlagsSuccess = () => ({
    type: UPDATE_FLAGS_SUCCESS
})