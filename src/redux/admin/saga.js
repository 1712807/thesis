import { call, put, select, takeLatest } from 'redux-saga/effects';
import {
    editDealApi,
    getDealsApi, 
    getDealsCountApi,
    markDealAsViewedApi,
    reviewDealApi,
    getIsReportedExpiredDealsApi,
    getIsReportedExpiredDealsCountApi,
    updateExpiredDealsApi,
    getReportedCommentsApi,
    getUsersApi,
    blockUserApi,
    createUserApi,
    getUsersCountApi,
    ignoreReportedDealApi,
    deletedMarkedCommentApi,
    ignoreReportedCommentApi,
    getReportedCommentsCountApi,
    changeUsersRoleApi,
    getReportedCommentByCommentIdApi,
    updateEditorsNoteApi,
    deleteEditorsNoteApi,
    getReportedCommentByUserIdApi,
    markDealAsFeaturedApi,
    getReportedDealsCountApi,
    getReportedDealsApi,
    getUsersReportedDealApi,
    deleteReportsOnDealApi,
    getFeedbackApi,
    markFeedbackAsSolvedApi,
} from "../../services/api/admin";
import {
    EDIT_DEAL, EDIT_DEAL_SUCCESS,
    GET_DEALS_COUNT,
    GET_DEALS_COUNT_SUCCESS,
    MARK_DEAL_AS_VIEWED,
    REVIEW_DEAL,
    REVIEW_DEAL_SUCCESS,
    GET_IS_REPORTED_EXPIRED_DEALS_SUCCESS,
    GET_IS_REPORTED_EXPIRED_DEALS,
    UPDATE_EXPIRED_DEAL,
    UPDATE_EXPIRED_DEAL_SUCCESS,
    GET_REPORTED_COMMENTS,
    GET_REPORTED_COMMENTS_SUCCESS,
    GET_DEALS_SUCCESS,
    GET_DEALS,
    GET_USERS_SUCCESS,
    GET_USERS,
    BLOCK_USER,
    BLOCK_USER_SUCCESS,
    CREATE_USER_ACCOUNT,
    CREATE_USER_ACCOUNT_SUCCESS,
    GET_USERS_COUNT_SUCCESS,
    GET_USERS_COUNT,
    IGNORED_DEAL_SUCCESS,
    IGNORED_DEAL,
    UPDATE_REPORTED_COMMENT_SUCCESS,
    UPDATE_REPORTED_COMMENT,
    IGNORED_REPORTED_COMMENT_SUCCESS,
    IGNORED_REPORTED_COMMENT,
    GET_REPORTED_COMMENTS_COUNT,
    GET_REPORTED_COMMENTS_COUNT_SUCCESS,
    GET_IS_REPORTED_EXPIRED_DEALS_COUNT,
    CHANGE_USERS_ROLE_SUCCESS,
    CHANGE_USERS_ROLE,
    CHANGE_MENU_TAB,
    CHANGE_DEALS_FILTERS,
    UPDATE_EDITORS_NOTE,
    DELETE_EDITORS_NOTE,
    CHANGE_COMMENTS_FILTERS,
    DELETE_EDITORS_NOTE_SUCCESS,
    UPDATE_EDITORS_NOTE_SUCCESS,
    MARK_DEAL_AS_FEATURED,
    MARK_DEAL_AS_FEATURED_SUCCESS,
    GET_REPORTED_DEALS_COUNT,
    GET_REPORTED_DEALS,
    GET_USERS_REPORTED_DEAL,
    GET_USERS_REPORTED_DEAL_SUCCESS,
    DELETE_REPORTS_ON_DEAL,
    DELETE_REPORTS_ON_DEAL_SUCCESS,
    VIEW_DETAIL_USERS_REPORTING_SUCCESS,
    VIEW_DETAIL_USERS_REPORTING,
    GET_FEEDBACK_SUCCESS,
    GET_FEEDBACK,
    MARK_FEEDBACK_AS_SOLVED_SUCCESS,
    MARK_FEEDBACK_AS_SOLVED,
    EDIT_DEAL_FAIL,
} from "./action";
import { SIGN_UP_FAIL } from '../users/action';
import { ADD_FLAG_NOTI } from '../app/action';
import { DEALBEE_PATHS, FLAGS } from '../../services/utils/constant';
import { setLevel } from '../../services/utils/common';

const getCurrentUserId = (state) => state.users.currentUser.id;
const getDealsFilters = (state) => state.admin.dealsFilters;
const getCurrentMenuTab = (state) => state.admin.currentMenuTab;
const getSelectedDeal = (state) => state.deals.selectedDeal;

function* getDealsCount() {
    const tab = yield select(getCurrentMenuTab);
    const filters = yield select(getDealsFilters);
    const status = tab === 0 ? "waiting" : tab === 1 ? "approved" : tab === 2 ? "rejected" : '';

    if (tab !== 3) {
        const {viewed, category} = filters;
        const params = {status, viewed, category};
        const response = yield call(getDealsCountApi, params);
        if (response.status === 200) {
            yield put({
                type: GET_DEALS_COUNT_SUCCESS,
                count: response.data.count,
            })
        }
    } else {
        yield put({
            type: GET_REPORTED_DEALS_COUNT
        })
    }
}

export function* getDealsCountSaga() {
    yield takeLatest(GET_DEALS_COUNT, getDealsCount)
}


function* getDeals() {
    const filters = yield select(getDealsFilters);
    const tab = yield select(getCurrentMenuTab);

    if (tab !== 3) {
        const params = {
            ...filters,
            status: tab === 0 ? "waiting" : tab === 1 ? "approved" : "rejected"
        }
        const response = yield call(getDealsApi, params);
        if (response.status === 200 && response.data.message === "success") {
            yield put({
                type: GET_DEALS_SUCCESS,
                deals: response.data.deals,
            })
        }
    }
    else {
        yield put({
            type: GET_REPORTED_DEALS
        });
    }
    
}

export function* getDealsSaga() {
    yield takeLatest(GET_DEALS, getDeals)
}

function* getReportedDealsCount() {
    const filters = yield select(getDealsFilters);
    const params = {
        category: filters.category,
    }
    const response = yield call(getReportedDealsCountApi, params);
    if (response.status === 200) {
        yield put({
            type: GET_DEALS_COUNT_SUCCESS,
            count: response.data.count,
        })
    }
}

export function* getReportedDealsCountSaga() {
    yield takeLatest(GET_REPORTED_DEALS_COUNT, getReportedDealsCount)
}

function* getReportedDeals() {
    const filters = yield select(getDealsFilters);
    const response = yield call(getReportedDealsApi, filters);
    if (response.status === 200 && response.data.message === "success") {
        yield put({
            type: GET_DEALS_SUCCESS,
            deals: response.data.deals,
        })
    }
}

export function* getReportedDealsSaga() {
    yield takeLatest(GET_REPORTED_DEALS, getReportedDeals)
}

function* getUsersReportedDeal(action) {
    const {dealId} = action;
    const response = yield call(getUsersReportedDealApi, {dealId});
    if (response.status === 200 && response.data.message === "success") {
        yield put({
            type: GET_USERS_REPORTED_DEAL_SUCCESS,
            list: response.data.list,
            dealId,
        })
    }
}

export function* getUsersReportedDealSaga() {
    yield takeLatest(GET_USERS_REPORTED_DEAL, getUsersReportedDeal)
}

function* deleteReportsOnDeal(action) {
    const {dealId} = action;
    const response = yield call(deleteReportsOnDealApi, {dealId})
    if (response.status === 200 && response.data.message === "success") {
        yield put({
            type: DELETE_REPORTS_ON_DEAL_SUCCESS,
            dealId,
        })
    }
}

export function* deleteReportsOnDealSaga() {
    yield takeLatest(DELETE_REPORTS_ON_DEAL, deleteReportsOnDeal)
}
 
function* changeMenuTab(action) {
    const {tab} = action;
    if (tab === 3) return;
    yield put({
        type: CHANGE_DEALS_FILTERS,
        page: 1,
    })
    yield getDeals();
    yield getDealsCount();
}

export function* changeMenuTabSaga() {
    yield takeLatest(CHANGE_MENU_TAB, changeMenuTab);
}

export function* changeDealsFiltersSaga() {
    yield takeLatest(CHANGE_DEALS_FILTERS, getDeals);
}

function* reviewDeal(action) {
    const {actionType: status, deal} = action;
    const {id, info, category, prevCategory, isFeatured, editorsNote, user_id: userId, expiredDate, expired, status: prevStatus} = deal;
    const editorId = yield select(getCurrentUserId);
    const params = {
        status,
        editorId,
        id,
        info,
        category,
        prevCategory,
        isFeatured,
        editorsNote,
        expiredDate,
        expired,
        userId,
        prevStatus,
    };
    const response = yield call(reviewDealApi, params);
    if (response.status === 200 && response.data.message === "success") {
        yield put({
            type: REVIEW_DEAL_SUCCESS,
            id,
            status,
        })
        yield put({
            type: ADD_FLAG_NOTI,
            flag: status === "approved" 
                ? FLAGS.approveDealSuccess
                : prevStatus === "waiting"
                    ? FLAGS.rejectDealSuccess
                    : FLAGS.deleteDealSuccess,
        })
    }
}

export function* reviewDealSaga() {
    yield takeLatest(REVIEW_DEAL, reviewDeal)
}

function* editDeal(action) {
    const {deal} = action;
    const editorId = yield select(getCurrentUserId);
    const params = {
        editorId,
        ...deal,
    }
    try {
        yield call(editDealApi, params);
        yield put({
            type: EDIT_DEAL_SUCCESS,
        })
        yield put({
            type: ADD_FLAG_NOTI,
            flag: FLAGS.editInfoSuccess
        })
    } catch (e) {
        yield put({
            type: EDIT_DEAL_FAIL,
        })
        yield put({
            type: ADD_FLAG_NOTI,
            flag: FLAGS.changeAvatarFail
        })
    }
}

export function* editDealSaga() {
    yield takeLatest(EDIT_DEAL, editDeal)
}

function* updateEditorsNote(action) {
    const {note} = action;
    const editorId = yield select(getCurrentUserId);
    const deal = yield select(getSelectedDeal);

    const params = {note, editorId, dealId: deal.id};
    const response = yield call(updateEditorsNoteApi, params);
    if (response.status === 200 && response.data.message === "success") {
        yield put({
            type: UPDATE_EDITORS_NOTE_SUCCESS,
            note: {
                content: note,
                editorId,
            }
        })
        yield put({
            type: ADD_FLAG_NOTI,
            flag: FLAGS.updateEditorsNoteSuccesss,
        })
    }
}

export function* updateEditorsNoteSaga() {
    yield takeLatest(UPDATE_EDITORS_NOTE, updateEditorsNote)
}

function* deleteEditorsNote() {
    const deal = yield select(getSelectedDeal);
    const params = {dealId: deal.id}
    const response = yield call(deleteEditorsNoteApi, params);
    if (response.status === 200 && response.data.message === "success") {
        yield put({
            type: DELETE_EDITORS_NOTE_SUCCESS,
        })
        yield put({
            type: ADD_FLAG_NOTI,
            flag: FLAGS.deleteEditorsNoteSuccess,
        })
    }
}

export function* deleteEditorsNoteSaga() {
    yield takeLatest(DELETE_EDITORS_NOTE, deleteEditorsNote)
}

function* markDealAsFeatured(action) {
    const {isFeatured} = action;
    const deal = yield select(getSelectedDeal);
    const response = yield call(markDealAsFeaturedApi, {dealId: deal.id, isFeatured});
    if (response.status === 200 && response.data.message === "success") {
        yield put({
            type: MARK_DEAL_AS_FEATURED_SUCCESS,
            isFeatured,
        })
        // yield put({
        //     type: ADD_FLAG_NOTI,
        //     flag: isFeatured 
        //         ? FLAGS.markDealAsFeaturedSuccess 
        //         : FLAGS.unmarkDealAsFeaturedSuccess
        // })
    }
}

export function* markDealAsFeaturedSaga() {
    yield takeLatest(MARK_DEAL_AS_FEATURED, markDealAsFeatured)
}

function* markDealAsViewed(action) {
    const {dealId} = action;
    const editorId = yield select(getCurrentUserId);
    const params = {dealId, editorId};
    yield call(markDealAsViewedApi, params);
}

export function* markDealAsViewedSaga() {
    yield takeLatest(MARK_DEAL_AS_VIEWED, markDealAsViewed)
}

function* getIsReportedExpiredDeals() {
    const filters = yield select(getDealsFilters);
    const res = yield call(getIsReportedExpiredDealsApi, filters);

    let deals = res.data.deals;
    for (let i = 0; i < deals.length; i++) {
        deals[i].level = setLevel(deals[i].user_point);
    }
    if (res.status === 200 && res.data.message === "success") {
        yield put({
            type: GET_IS_REPORTED_EXPIRED_DEALS_SUCCESS,
            deals,
        })
    }
}

export function* getIsReportedExpiredDealsSaga() {
    yield takeLatest(GET_IS_REPORTED_EXPIRED_DEALS, getIsReportedExpiredDeals);
}

function* getIsReportedExpiredDealsCount() {
    const filters = yield select(getDealsFilters);
    const { category } = filters;
    const response = yield call(getIsReportedExpiredDealsCountApi, category);
    if (response.status === 200) {
        yield put({
            type: GET_DEALS_COUNT_SUCCESS,
            count: response.data.count,
        })
    }
}

export function* getIsReportedExpiredDealsCountSaga() {
    yield takeLatest(GET_IS_REPORTED_EXPIRED_DEALS_COUNT, getIsReportedExpiredDealsCount)
}


function* updateExpired(action) {
    const { status, dealId } = action;
    const params = {
        status,
        dealId,
    }

    const res = yield call(updateExpiredDealsApi, params);
    if (res.status === 200 && res.data.message === "success") {
        yield put({
            type: UPDATE_EXPIRED_DEAL_SUCCESS,
            dealId,
            status,
        })
        yield put({
            type: ADD_FLAG_NOTI,
            flag: FLAGS.markDealAsExpiredSuccess
        })
    }
}

export function* updateExpiredSaga() {
    yield takeLatest(UPDATE_EXPIRED_DEAL, updateExpired);
}

function* ignoredDeal(action) {
    const { dealId } = action;

    const res = yield call(ignoreReportedDealApi, { dealId });

    if (res.status === 200 && res.data.message === "success") {
        yield put({
            type: IGNORED_DEAL_SUCCESS,
            dealId,
        })
    } 
}

export function* ignoredDealSaga() {
    yield takeLatest(IGNORED_DEAL, ignoredDeal);
}

//reported comments
function* getReportedComments() {
    const filters = yield select(getDealsFilters);
    const { page, sortKey, limit } = filters;
    const params = {page, commentsPerPage: limit, sortKey};
    const response = yield call(getReportedCommentsApi, params );
    const comments = response.data.comments;
   

    for (let i = 0; i < comments.length; i++) {
        const countOwnerRes = yield call(getReportedCommentByUserIdApi, comments[i].user_id)
        comments[i].numberOfReported = countOwnerRes.data.count;
    }
    if (response.status === 200 && response.data.message === "success") {
        yield put({
            type: GET_REPORTED_COMMENTS_SUCCESS,
            comments,
        })
    }
    
}

export function* getReportedCommentsSaga() {
    yield takeLatest(GET_REPORTED_COMMENTS, getReportedComments);
}

function* getReportedCommentsCount() {
    const response = yield call(getReportedCommentsCountApi);
    if (response.status === 200) {
        yield put({
            type: GET_REPORTED_COMMENTS_COUNT_SUCCESS,
            count: response.data.count,
        })
    }
}

export function* getReportedCommentsCountSaga() {
    yield takeLatest(GET_REPORTED_COMMENTS_COUNT, getReportedCommentsCount)
}

function* updateReportedComment(action) {
    const { status, commentId, isOnly } = action;
    let params = {
        status,
        commentId,
    }

    const res = yield call(deletedMarkedCommentApi, params);
   
    if (res.status === 200 && res.data.message === "success") {
        yield put({
            type: UPDATE_REPORTED_COMMENT_SUCCESS,
            commentId,
        })
        if (isOnly) window.location.href=DEALBEE_PATHS.admin;
    }
}

export function* updateReportedCommentSaga() {
    yield takeLatest(UPDATE_REPORTED_COMMENT, updateReportedComment);
}

function* ignoreReportedComment(action) {
    const { commentId, isOnly } = action;

    const res = yield call(ignoreReportedCommentApi, { commentId });

    if (res.status === 200 && res.data.message === "success") {
        yield put({
            type: IGNORED_REPORTED_COMMENT_SUCCESS,
            commentId,
        })
        if (isOnly) window.location.href=DEALBEE_PATHS.admin;
    } 
  //  const params = { commentId }
   // yield call(deleteReportedCommentApi, { params });
}

export function* ignoreReportedCommentSaga() {
    yield takeLatest(IGNORED_REPORTED_COMMENT, ignoreReportedComment);
}

export function* changeCommentsFiltersSaga() {
    yield takeLatest(CHANGE_COMMENTS_FILTERS, getReportedComments);
}
//users 
function* getUsers(action) {
    const {params} = action;
    const response = yield call(getUsersApi, params);
    if (response.status === 200) {
        yield put({
            type: GET_USERS_SUCCESS,
            userList: response.data,
        })
    }
}

export function* getUsersSaga() {
    yield takeLatest(GET_USERS, getUsers)
}

function* getUsersCount(action) {
    const response = yield call(getUsersCountApi);
    if (response.status === 200 && response.data.message === "success") {
        yield put({
            type: GET_USERS_COUNT_SUCCESS,
            count: response.data.count,
        })
    }
}

export function* getUsersCountSaga() {
    yield takeLatest(GET_USERS_COUNT, getUsersCount)
}

function* blockUser(action) {
    const {id, isBlocking, reason} = action;
    const params = {id, isBlocking, reason};
    const response = yield call(blockUserApi, params);
    if (response.status === 200 && response.data.message === "success") {
        yield put({
            type: BLOCK_USER_SUCCESS,
            id,
            isBlocked: isBlocking ? true : false,
            reason,
        })
        yield put({
            type: ADD_FLAG_NOTI,
            flag: isBlocking ? FLAGS.blockUserSuccess : FLAGS.unblockUserSuccess
        })
    }
}

export function* blockUserSaga() {
    yield takeLatest(BLOCK_USER, blockUser)
}

function* createUserAccount(action) {
    const {user: {username, displayName, password, email, role, categoriesList}} = action;
    const params = {
        username,
        displayName,
        password,
        email,
        role,
        categoriesList,
    }
    const response = yield call(createUserApi, params);
    if (response.status === 200) {
        const {data: {message, newUser}} = response;
        if (message === "success") {
            yield put({
                type: CREATE_USER_ACCOUNT_SUCCESS,
                newUser: {
                    ...newUser, 
                    point: 0,
                },
            });
            yield put({
                type: ADD_FLAG_NOTI,
                flag: FLAGS.createUserSuccess,
            })
        }
        else {
            yield put({
                type: SIGN_UP_FAIL,
                message,
            })
        }
    }
}

export function* createUserAccountSaga() {
    yield takeLatest(CREATE_USER_ACCOUNT, createUserAccount)
}

function* changeUsersRole(action) {
    const {userId, role, categories} = action;
    const params = {userId, role, categories};
    const response = yield call(changeUsersRoleApi, params);
    if (response.status === 200 && response.data.message === "success") {
        yield put({
            type: CHANGE_USERS_ROLE_SUCCESS,
            userId,
            role,
            categories,
        });
        yield put({
            type: ADD_FLAG_NOTI,
            flag: FLAGS.changeUsersRoleSuccess,
        })
    }
}

export function* changeUsersRoleSaga() {
    yield takeLatest(CHANGE_USERS_ROLE, changeUsersRole)
}

function* viewDetailUsersReporting(action) {
    const { params: {commentId, dealId, status }} = action
    const params = commentId !== '' && {commentId};
    let res;
    if (status) {
        commentId !== ''
        ? res = yield call(getReportedCommentByCommentIdApi, { params })
        : res = yield call(getUsersReportedDealApi, {dealId});
        if (res.status === 200) {
            yield put({
                type: VIEW_DETAIL_USERS_REPORTING_SUCCESS,
                content: res.data.list,
            })
        }
    }
}

export function* viewDetailUsersReportingSaga() {
    yield takeLatest(VIEW_DETAIL_USERS_REPORTING, viewDetailUsersReporting)
}

function* getFeedback() {
    try {
        const response = yield call(getFeedbackApi);
        yield put({
            type: GET_FEEDBACK_SUCCESS,
            list: response.data,
        })
    } catch (e) {
        console.log(e);
    }
}

export function* getFeedbackSaga() {
    yield takeLatest(GET_FEEDBACK, getFeedback)
}

function* markFeedbackAsSolved(action) {
    try {
        const { id } = action;
        yield call(markFeedbackAsSolvedApi, id);
        yield put({
            type: MARK_FEEDBACK_AS_SOLVED_SUCCESS,
            id,
        })
    } catch (e) {
        console.log(e);
    }
}

export function* markFeedbackAsSolvedSaga() {
    yield takeLatest(MARK_FEEDBACK_AS_SOLVED, markFeedbackAsSolved)
}