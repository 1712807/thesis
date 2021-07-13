import { put, takeLatest, call, select } from 'redux-saga/effects';
import { CHANGE_PASSWORD, CHANGE_PASSWORD_FAIL, CHANGE_PASSWORD_SUCCESS, EDIT_INFO, EDIT_INFO_SUCCESS, GET_ACTIVE_MEMBERS, GET_ACTIVE_MEMBERS_SUCCESS, GET_CURRENT_USER_PROFILE, GET_CURRENT_USER_PROFILE_SUCCESS, GET_USER_PROFILE, GET_USER_PROFILE_SUCCESS, LOG_IN, LOG_IN_FAIL, LOG_IN_SUCCESS, LOG_OUT, CLEAR_COOKIES, SIGN_UP, SIGN_UP_FAIL, GET_COMMENTS_BY_USERNAME, GET_COMMENTS_BY_USERNAME_SUCCESS, GET_DEALS_BY_USER, GET_DEALS_BY_USER_SUCCESS, GET_FOLLOWING_DEALS_BY_USER, GET_PENDING_DEALS, GET_PENDING_DEALS_SUCCESS, GET_MY_NOTIFICATIONS, GET_MY_NOTIFICATIONS_SUCCESS, MARK_NOTI_AS_READ, MARK_ALL_NOTI_AS_READ, MARK_ALL_NOTI_AS_READ_SUCCESS, UPDATE_FOLLOW_USER, GET_FOLLOW_INFO_BY_USER_ID_SUCCESS, GET_FOLLOW_INFO_BY_USER_ID, UPDATE_FOLLOW_USER_SUCCESS, RESET_PASSWORD_SUCCESS, RESET_PASSWORD_FAIL, RESET_PASSWORD, SEND_FEEDBACK_SUCCESS, SEND_FEEDBACK, STOP_EDITING_PROFILE, EDIT_INFO_FAIL } from './action';
import { changePasswordApi, editInfoApi, getActiveUsersApi, getCurrentUserApi, getMyNotificationsApi, getUserApi, markNotiAsReadApi, resetPasswordApi, sendFeedbackApi, signInApi, signUpApi, updateReputationScoreApi } from '../../services/api/users';
import { getCookieData } from '../../services/utils/common';
import { getCommentsByUsernameApi } from '../../services/api/comments';
import { getDealsByUserApi, getPendingDealsApi, getFollowingDealByUserNameApi } from '../../services/api/deals';

import { UPDATE_DEAL_ID_IN_FOLLOWING_DEALS, UPDATE_DEAL_ID_IN_FOLLOWING_DEALS_SUCCESS, GET_FOLLOWING_DEALS_BY_USER_SUCCESS, UPDATE_DEAL_IN_FOLLOWING_DEALS_SUCCESS } from './action';
import { updatefollowingDealsIdApi, followUserApi, unFollowUserApi, getFollowerByUsernameApi, getFollowingByUsernameApi, getFollowerInfoByUsernameApi, getFollowingInfoByUsernameApi } from '../../services/api/users';
import { DEALBEE_PATHS, FLAGS, FOLLOWING_DEALS_PER_PAGE, MY_NOTIFICATIONS_PER_PAGE, PENDING_DEALS_PER_PAGE, RECENT_COMMENTS_PER_PAGE, USERS_DEALS_PER_PAGE } from '../../services/utils/constant';
import { setLevel } from '../../services/utils/common';
import { ADD_FLAG_NOTI, DISPLAY_EMPTY_PAGE_MESSAGE, START_LOADING_PAGE, STOP_LOADING_PAGE } from '../app/action';

const currentUser = (state) => state.users.currentUser;
const displayingUser = (state) => state.users.displayingUser;
const getRecentCommentsPage = (state) => state.users.targetUsersComments.currentPage;
const getRecentDealsPage = (state) => state.users.targetUsersDeals.currentPage;
const getPendingDealsPage = (state) => state.users.pendingDeals.currentPage;
const getFollowingDealsPage = (state) => state.users.followingDeals.currentPage;
const getCurrentNotiList = (state) => state.users.notifications.list;

function* getCurrentUserProfile(action) {
    var token = getCookieData("token");
    if (token === "undefined") token = action.token;
    try {
        const response = yield call(getCurrentUserApi, token);
        const {data} = response;
        const {message} = data;
        if (message === "jwt expired") {
            yield put({
                type: CLEAR_COOKIES
            });
        }
        yield put({
            type: GET_CURRENT_USER_PROFILE_SUCCESS,
            userInfo: message === "jwt expired" ? {} : data.user || {},
            newTokens: data.newTokens || {},
        })
    } catch (e) {
        yield put({
            type: CLEAR_COOKIES,
        });
        window.location.reload();
    }
    
}

export function* getCurrentUserProfileSaga() {
    yield takeLatest(GET_CURRENT_USER_PROFILE, getCurrentUserProfile)
}

function* getUserProfile(action) {
    const response = yield call(getUserApi, action.username);
 
    if (response.status === 200 && response.data.message === "success") {
        const username = action.username
        yield put({
            type: GET_COMMENTS_BY_USERNAME,
            username,
        })
        const responseFollowerUser = yield call(getFollowerByUsernameApi, username)
        const responseFollowingUser = yield call(getFollowingByUsernameApi, username)
        yield put({
            type: GET_USER_PROFILE_SUCCESS,
            userInfo: response.data.user,
            followerUserIds: responseFollowerUser.data,
            followingUserIds: responseFollowingUser.data,
        })
        return;
    }
    yield put({
        type: DISPLAY_EMPTY_PAGE_MESSAGE,
    })
}

export function* getuserProfileSaga() {
    yield takeLatest(GET_USER_PROFILE, getUserProfile)
}

function* getCommentsByUsername(action) {
    const page = yield select(getRecentCommentsPage);
    if (page < 0) {
        yield put({
            type: GET_COMMENTS_BY_USERNAME_SUCCESS,
            list: [],
        })
    };

    const {username} = action;
    const params = {username, page, commentsPerPage: RECENT_COMMENTS_PER_PAGE}; 
    const response = yield call(getCommentsByUsernameApi, params);
    if (response.status === 200) {
        yield put({
            type: GET_COMMENTS_BY_USERNAME_SUCCESS,
            list: response.data,
        })
    }
}

export function* getCommentsByUsernameSaga() {
    yield takeLatest(GET_COMMENTS_BY_USERNAME, getCommentsByUsername);
}

function* getDealsByUser() {
    const page = yield select(getRecentDealsPage);
    if (page < 0) return;
    
    const user = yield select(displayingUser);
    const params = {username: user.username, page, limit: USERS_DEALS_PER_PAGE}; 
    const response = yield call(getDealsByUserApi, params);
    if (response.status === 200) {
        yield put({
            type: GET_DEALS_BY_USER_SUCCESS,
            list: response.data,
        })
    }
}

export function* getDealsByUserSaga() {
    yield takeLatest(GET_DEALS_BY_USER, getDealsByUser)
}

function* getPendingDealsByUser() {
    const user = yield select(currentUser);
    const page = yield select(getPendingDealsPage);
    if (page < 0) return;

    const params = {
        userId: user.id,
        page,
        limit: PENDING_DEALS_PER_PAGE
    };

    const response = yield call(getPendingDealsApi, params);
    if (response.status === 200) {
        yield put({
            type: GET_PENDING_DEALS_SUCCESS,
            list: response.data,
        })
    }
}

export function* getPendingDealsByUserSaga() {
    yield takeLatest(GET_PENDING_DEALS, getPendingDealsByUser)
}

function* getFollowingDealsByUser(action) {
    const { user: {followingDealsId, username} } = action;
    const page = yield select(getFollowingDealsPage);
    if (page < 0) return;
    if (followingDealsId) {
        const res = yield getFollowingDealByUserNameApi({username, limit: FOLLOWING_DEALS_PER_PAGE, page})
        yield put({
            type: GET_FOLLOWING_DEALS_BY_USER_SUCCESS,
            list: res.data.deals,
        })
    }
    
}

export function* getFollowingDealsByUserSaga() {
    yield takeLatest(GET_FOLLOWING_DEALS_BY_USER, getFollowingDealsByUser);
}

export function* updateReputationScore(params) {
    yield call(updateReputationScoreApi, params);
 }

 function* updateDealInfollowingDealsId(action) {
    const { dealId, status } = action;
    const user = yield select(currentUser);

    if (!status) {
        const pathName = window.location.pathname;
        if (pathName.includes(DEALBEE_PATHS.userProfile)) {
            yield put({
                type: UPDATE_DEAL_IN_FOLLOWING_DEALS_SUCCESS,
                dealId,
            })
        }
    }
    const params = { userId: user.id, dealId, status}
    const res = yield call(updatefollowingDealsIdApi, params);
    if (res.status === 200 && res.data.message === "success") {
        yield put({
            type: UPDATE_DEAL_ID_IN_FOLLOWING_DEALS_SUCCESS,
            newFollowingDealsId: res.data.following_deals_id,
        })
    }
 }

export function* updateDealInfollowingDealsIdSaga() {
     yield takeLatest(UPDATE_DEAL_ID_IN_FOLLOWING_DEALS, updateDealInfollowingDealsId);
}

function* signUp(action) {
    const {userInfo} = action;
    const {username, password, email, info} = userInfo;
    const params = {
        username, 
        password,
        email,
        info,
    }
    const response = yield call(signUpApi, params);
    if (response.status === 200) {
        const {data: {user, token, message}} = response;
        if (message === "success") {
            yield put({
                type: LOG_IN_SUCCESS,
                user,
                token,
                afterSignUp: true,
            });
        }
        else {
            yield put({
                type: SIGN_UP_FAIL,
                message,
            })
        }
    }
}

export function* signUpSaga() {
    yield takeLatest(SIGN_UP, signUp)
}

function* logIn(action) {
    const {userInfo} = action;
    try {
        const response = yield call(signInApi, userInfo);
        const {data: {user, token, refreshToken, message}} = response;
        if (message === "success") {
            yield put({
                type: LOG_IN_SUCCESS,
                user, 
                token,
                refreshToken,
            });
        } else {
            yield put({
                type: LOG_IN_FAIL,
                message: message,
            })
        }
    } catch (e) {
        yield put({
            type: LOG_IN_FAIL,
            message: e,
        })
    }
}

export function* logInSaga() {
    yield takeLatest(LOG_IN, logIn)
}

function* logOut() {
    const user = yield select(currentUser);
    if (!user.id) return;
    yield put({
        type: CLEAR_COOKIES,
    })
}

export function* logOutSaga() {
    yield takeLatest(LOG_OUT, logOut)
}

function* changePassword(action) {
    const {userId, password, newPassword} = action;
    const params = {userId, password, newPassword};
    const response = yield call(changePasswordApi, params);
    if (response.status === 200) {
        const {data: {message}} = response;
        if (message === "success") {
            yield put({
                type: CHANGE_PASSWORD_SUCCESS,
            })
            yield put({
                type: ADD_FLAG_NOTI,
                flag: FLAGS.editInfoSuccess
            })
        }
        else {
            yield put({
                type: CHANGE_PASSWORD_FAIL,
                message,
            })
        }
    }
}

export function* changePasswordSaga() {
    yield takeLatest(CHANGE_PASSWORD, changePassword)
}

function* resetPassword(action) {
    try {
        const {username, email} = action;
        const response = yield call(resetPasswordApi, {username, email});
        const {data: {newPassword, message}} = response;
        if (message === "success") {
            yield put({
                type: RESET_PASSWORD_SUCCESS,
                newPassword
            });
        } else {
            yield put({
                type: RESET_PASSWORD_FAIL,
                message,
            })    
        }
    } catch (e) {
        yield put({
            type: RESET_PASSWORD_FAIL,
            message: e,
        })
    }
}

export function* resetPasswordSaga() {
    yield takeLatest(RESET_PASSWORD, resetPassword)
}

function* editInfo(action) {
    const {userId, newInfo, email, emailNotifications, followingCategories} = action;
    const params = {
        userId, 
        newInfo,
        email,
        emailNotifications,
        followingCategories,
    };
    const response = yield call(editInfoApi, params);
    try {
        const { data: { message } } = response;
        if (message === "success") {
            yield put({
                type: EDIT_INFO_SUCCESS,
                ...response.data,
            })
            yield put({
                type: STOP_EDITING_PROFILE,
            })
            yield put({
                type: ADD_FLAG_NOTI,
                flag: FLAGS.editInfoSuccess,
            })
        }
        else yield put({
            type: EDIT_INFO_FAIL,
            message,
        })
    } catch (e) {
        yield put({
            type: EDIT_INFO_FAIL
        })
    }
}

export function* editInfoSaga() {
    yield takeLatest(EDIT_INFO, editInfo)
}

function* getActiveMembers() {
    const response = yield call(getActiveUsersApi);
    const users = response.data;

    for (let i = 0; i < users.length; i++) {
        users[i].level = setLevel(users[i].point);
    }
    if (response.status === 200) {
        yield put({
            type: GET_ACTIVE_MEMBERS_SUCCESS,
            members: users,
        })
    }
}

export function* getActiveMembersSaga() {
    yield takeLatest(GET_ACTIVE_MEMBERS, getActiveMembers)
}

function* getMyNotifications(action) {
    const {isOpening} = action;
    const list = yield select(getCurrentNotiList);
    const params = {
        limit: MY_NOTIFICATIONS_PER_PAGE,
        offset: list.length,
        isOpening
    }
    const response = yield call(getMyNotificationsApi, params);
    if (response.status === 200 && response.data.message === "success") {
        yield put({
            type: GET_MY_NOTIFICATIONS_SUCCESS,
            list: response.data.notiList,
            isOpening,
        })
    }
}

export function* getMyNotificationsSaga() {
    yield takeLatest(GET_MY_NOTIFICATIONS, getMyNotifications)
}

function* markNotiAsRead(action) {
    const {id} = action;
    yield call(markNotiAsReadApi, {id: id, type: "one"});
}

export function* markNotiAsReadSaga() {
    yield takeLatest(MARK_NOTI_AS_READ, markNotiAsRead)
}

function* markAllNotiAsRead() {
    const response = yield call(markNotiAsReadApi, {id: null, type: "all"});
    if (response.status === 200 && response.data.message === "success") {
        yield put({
            type: MARK_ALL_NOTI_AS_READ_SUCCESS
        })
    }
}

export function* markAllNotiAsReadSaga() {
    yield takeLatest(MARK_ALL_NOTI_AS_READ, markAllNotiAsRead);
}

function* updateFollowUser(action) {
    const { followedByUserId, followedUserId, status } = action;

    if (status) {
        yield call(followUserApi, {followedByUserId, followedUserId })
    } else {
        yield call(unFollowUserApi, {followedByUserId, followedUserId })
    }

    yield put({
        type: UPDATE_FOLLOW_USER_SUCCESS,
        followedByUserId, followedUserId, status,
    })
}

export function* updateFollowUserSaga() {
    yield takeLatest(UPDATE_FOLLOW_USER, updateFollowUser)
}

function* getFollowInfoByUsername(action) {
    yield put({
        type: START_LOADING_PAGE,
    })
    const {username, status} = action;

    let res = [];
    if (getFollowerByUsernameApi !== '') {
        if (status === 'followers') {
            res = yield call(getFollowerInfoByUsernameApi, username)
        } else {
            res = yield call(getFollowingInfoByUsernameApi, username)
        }
    }
    yield put({
        type: GET_FOLLOW_INFO_BY_USER_ID_SUCCESS,
        data: res.data || res,
    })
    yield put({
        type: STOP_LOADING_PAGE,
    })
}

export function* getFollowInfoByUsernameSaga() {
    yield takeLatest(GET_FOLLOW_INFO_BY_USER_ID, getFollowInfoByUsername)
}

function* sendFeedback(action) {
    const response = yield call(sendFeedbackApi, action.feedback);
    if (response.status === 200) {
        yield put({
            type: SEND_FEEDBACK_SUCCESS
        })
    }
}

export function* sendFeedbackSaga() {
    yield takeLatest(SEND_FEEDBACK, sendFeedback)
}