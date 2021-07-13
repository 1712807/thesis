export const SIGN_UP = "SIGN_UP";
export const LOG_IN = "LOG_IN";
export const LOG_IN_SUCCESS = "LOG_IN_SUCCESS";
export const LOG_IN_FAIL = "LOG_IN_FAIL";
export const SIGN_UP_FAIL = "SIGN_UP_FAIL";

export const signUp = (userInfo) => ({
    type: SIGN_UP,
    userInfo,
})

export const logIn = (userInfo) => ({
    type: LOG_IN,
    userInfo,
})

export const LOG_OUT = "LOG_OUT";
export const CLEAR_COOKIES = "CLEAR_COOKIES"; //LOG_OUT_SUCCESS

export const logOut = () => ({
    type: LOG_OUT,
})

export const START_EDITING_PROFILE = "START_EDITING_PROFILE";
export const STOP_EDITING_PROFILE = "STOP_EDITING_PROFILE";

export const startEditingProfile = () => ({
    type: START_EDITING_PROFILE,
})

export const stopEditingProfile = () => ({
    type: STOP_EDITING_PROFILE,
})

export const START_CHANGING_PASSWORD = "START_CHANGING_PASSWORD";
export const STOP_CHANGING_PASSWORD = "STOP_CHANGING_PASSWORD";

export const startChangingPassword = () => ({
    type: START_CHANGING_PASSWORD,
})

export const stopChangingPassword = () => ({
    type: STOP_CHANGING_PASSWORD,
})

export const CHANGE_PASSWORD = "CHANGE_PASSWORD";
export const CHANGE_PASSWORD_SUCCESS = "CHANGE_PASSWORD_SUCCESS";
export const CHANGE_PASSWORD_FAIL = "CHANGE_PASSWORD_FAIL";

export const changePassword = (userId, password, newPassword) => ({
    type: CHANGE_PASSWORD,
    userId,
    password,
    newPassword,
})

export const RESET_PASSWORD = "RESET_PASSWORD";
export const RESET_PASSWORD_SUCCESS = "RESET_PASSWORD_SUCCESS";
export const RESET_PASSWORD_FAIL = "RESET_PASSWORD_FAIL";

export const resetPassword = (username, email) => ({
    type: RESET_PASSWORD,
    username,
    email,
})

export const RESET_VALIDATION = "RESET_VALIDATION";
export const resetValidation = () => ({
    type: RESET_VALIDATION
})

export const EDIT_INFO = "EDIT_INFO";
export const EDIT_INFO_SUCCESS = "EDIT_INFO_SUCCESS";
export const EDIT_INFO_FAIL = "EDIT_INFO_FAIL";

export const editInfo = (userId, newInfo, email, emailNotifications, followingCategories, isChangeAvatar) => ({
    type: EDIT_INFO,
    userId, 
    newInfo,
    email,
    emailNotifications,
    followingCategories,
    isChangeAvatar,
})

export const GET_CURRENT_USER_PROFILE = "GET_CURRENT_USER_PROFILE";
export const GET_CURRENT_USER_PROFILE_SUCCESS = "GET_CURRENT_USER_PROFILE_SUCCESS";

export const getCurrentUserProfile = (token) => ({
    type: GET_CURRENT_USER_PROFILE,
    token,
})

export const GET_USER_PROFILE = "GET_USER_PROFILE";
export const GET_USER_PROFILE_SUCCESS = "GET_USER_PROFILE_SUCCESS";

export const getUserProfile = (username) => ({
    type: GET_USER_PROFILE,
    username,
})

export const GET_COMMENTS_BY_USERNAME = "GET_COMMENTS_BY_USERNAME";
export const GET_COMMENTS_BY_USERNAME_SUCCESS = "GET_COMMENTS_BY_USERNAME_SUCCESS";

export const getCommentsByUsername = (username) => ({
    type: GET_COMMENTS_BY_USERNAME,
    username,
})

export const CHANGE_MY_DEALS_MENU_TAB = "CHANGE_MY_DEALS_MENU_TAB";
export const changeMyDealsMenuTab = (tab) => ({
    type: CHANGE_MY_DEALS_MENU_TAB,
    tab,
})

export const GET_DEALS_BY_USER = "GET_DEALS_BY_USER";
export const GET_DEALS_BY_USER_SUCCESS = "GET_DEALS_BY_USER_SUCCESS";

export const getDealsByUser = () => ({
    type: GET_DEALS_BY_USER,
})

export const GET_FOLLOWING_DEALS_BY_USER = "GET_FOLLOWING_DEALS_BY_USER";
export const GET_FOLLOWING_DEALS_BY_USER_SUCCESS = "GET_FOLLOWING_DEALS_BY_USER_SUCCESS";

export const getFollowingDealsByUser = (user) => ({
    type: GET_FOLLOWING_DEALS_BY_USER,
    user,
})
export const GET_PENDING_DEALS = "GET_PENDING_DEALS";
export const GET_PENDING_DEALS_SUCCESS = "GET_PENDING_DEALS_SUCCESS";

export const getPendingDeals = () => ({
    type: GET_PENDING_DEALS,
})

export const UPDATE_DEAL_ID_IN_FOLLOWING_DEALS = "UPDATE_DEAL_ID_IN_FOLLOWING_DEALS"
export const UPDATE_DEAL_ID_IN_FOLLOWING_DEALS_SUCCESS = "UPDATE_DEAL_ID_IN_FOLLOWING_DEALS_SUCCESS"
export const UPDATE_DEAL_IN_FOLLOWING_DEALS_SUCCESS = "UPDATE_DEAL_IN_FOLLOWING_DEALS_SUCCESS";

export const updateDealInfollowingDealsId = (dealId, status) => ({
    type: UPDATE_DEAL_ID_IN_FOLLOWING_DEALS,
    dealId,
    status,
})

export const GET_ACTIVE_MEMBERS = "GET_ACTIVE_MEMBERS";
export const GET_ACTIVE_MEMBERS_SUCCESS = "GET_ACTIVE_MEMBERS_SUCCESS";

export const getActiveMembers = () => ({
    type: GET_ACTIVE_MEMBERS,
})

export const GET_MY_NOTIFICATIONS = "GET_MY_NOTIFICATIONS";
export const GET_MY_NOTIFICATIONS_SUCCESS = "GET_MY_NOTIFICATIONS_SUCCESS";

export const getMyNotifications = (isOpening) => ({
    type: GET_MY_NOTIFICATIONS,
    isOpening,
})

export const UPDATE_NEW_NOTI_SUCCESS = "UPDATE_NEW_NOTI_SUCCESS";
export const updateNewNotiSuccess = () => ({
    type: UPDATE_NEW_NOTI_SUCCESS,
})

export const MARK_NOTI_AS_READ = "MARK_NOTI_AS_READ";
export const markNotiAsRead = (id) => ({
    type: MARK_NOTI_AS_READ,
    id,
})

export const MARK_ALL_NOTI_AS_READ = "MARK_ALL_NOTI_AS_READ";
export const MARK_ALL_NOTI_AS_READ_SUCCESS = "MARK_ALL_NOTI_AS_READ_SUCCESS";

export const markAllNotiAsRead = () => ({
    type: MARK_ALL_NOTI_AS_READ,
})

export const UPDATE_FOLLOW_USER = "UPDATE_FOLLOW_USER";
export const UPDATE_FOLLOW_USER_SUCCESS = 'UPDATE_FOLLOW_USER_SUCCESS';
export const updateFollowUser = (followedByUserId, followedUserId, status, followedUsername) => ({
    type: UPDATE_FOLLOW_USER,
    followedByUserId,
    followedUserId,
    status,
    followedUsername,
})

export const GET_FOLLOW_INFO_BY_USER_ID = "GET_FOLLOW_INFO_BY_USER_ID";
export const GET_FOLLOW_INFO_BY_USER_ID_SUCCESS = "GET_FOLLOW_INFO_BY_USER_ID_SUCCESS";
export const getFollowInfoByUsername = (username, status) => ({
    type: GET_FOLLOW_INFO_BY_USER_ID,
    username,
    status,
})

export const GET_FOLLOWER_BY_USER_ID_SUCCESS = "GET_FOLLOWER_BY_USER_ID_SUCCESS";

export const SEND_FEEDBACK = "SEND_FEEDBACK";
export const SEND_FEEDBACK_SUCCESS = "SEND_FEEDBACK_SUCCESS";
export const sendFeedback = (feedback) => ({
    type: SEND_FEEDBACK,
    feedback,
})

export const UPDATE_USER_POINT = "UPDATE_USER_POINT";