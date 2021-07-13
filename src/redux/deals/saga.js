import { put, takeLatest, call, select } from 'redux-saga/effects';
import {
    ADD_NEW_COMMENT,
    ADD_NEW_COMMENT_SUCCESS,
    CRAWL_DATA_FROM_SHOPEE,
    CRAWL_DATA_FROM_TIKI,
    CRAWL_DATA_FROM_TIKI_SUCCESS,
    CREATE_DEAL,
    CREATE_DEAL_SUCCESS,
    GET_COMMENT_BY_DEAL_ID,
    GET_COMMENT_BY_DEAL_ID_SUCCESS,
    GET_LIKE_BY_DEAL_ID,
    GET_LIKE_BY_DEAL_ID_SUCCESS,
    SET_LIKE,
    DELETE_COMMENT,
    DELETE_COMMENT_SUCCESS,
    EDIT_COMMENT,
    EDIT_COMMENT_SUCCESS,
    GET_ALL_DEALS,
    GET_DEAL,
    GET_DEAL_SUCCESS,
    SET_DISLIKE,
    GET_DISLIKE_BY_DEAL_ID_SUCCESS,
    GET_DISLIKE_BY_DEAL_ID,
    SET_LIKE_COMMENT,
    SET_DISLIKE_COMMENT,
    SET_LIKE_OR_DISLIKE_COMMENT_SUCCUESS,
    SEARCH_DEAL,
    SEARCH_DEAL_SUCCESS,
    REPORT_EXPIRE,
    REPORT_EXPIRE_SUCCESS,
    REPORT_COMMENT,
    REPORT_COMMENT_SUCCESS,
    GET_FEATURED_DEALS_SUCCESS,
    EDIT_PENDING_DEAL,
    DELETE_PENDING_DEAL,
    EDIT_PENDING_DEAL_SUCCESS,
    DELETE_PENDING_DEAL_SUCCESS,
    CHANGE_CATEGORY,
    GET_FEATURED_DEALS,
    GET_RECENT_DEALS,
    GET_HOT_DEALS,
    GET_HOT_DEALS_SUCCESS,
    GET_FLASH_DEALS,
    GET_FLASH_DEALS_SUCCESS,
    GET_BEST_DEALS,
    GET_BEST_DEALS_SUCCESS,
    GET_POPULAR_DEALS_SUCCESS,
    GET_POPULAR_DEALS,
    GET_RECENT_DEALS_SUCCESS,
    GET_REPORTED_COMMENT_BY_DEAL_ID,
    GET_REPORTED_COMMENT_BY_DEAL_ID_SUCCESS,
    GET_CHILDREN_COMMENT_BY_COMMENT_ID_SUCCESS,
    GET_CHILDREN_COMMENT_BY_COMMENT_ID,
    REPORT_DEAL_SUCCESS,
    REPORT_DEAL,
    UNREPORT_DEAL_SUCCESS,
    GET_CATEGORIES_SUCCESS,
    GET_CATEGORIES,
    UPDATE_FEATURED_COMMENT_STATUS_SUCCESS,
    UPDATE_FEATURED_COMMENT_STATUS,
    GET_FEATURED_COMMENT_BY_DEAL_ID_SUCCESS,
    GET_FEATURED_COMMENT_BY_DEAL_ID,
    GET_DEALS_FOR_USER,
    GET_DEALS_FOR_USER_SUCCESS,
    EDIT_PENDING_DEAL_FAIL,
    ADD_CATEGORY_SUCCESS,
    ADD_CATEGORY,
    UPDATE_VIEWS,
} from './action';
import {
    createDealApi,
    addDealReactionsApi,
    deleteDealReactionsApi,
    getDealReactionsByDealApi,
    updateDealReactionsApi,
    crawlDataFromShopeeApi,
    crawlDataFromTikiApi,
    getDealByDealIdApi,
    getDealBySearchKeyApi,
    updateIsReportedExpiredDealApi,
    getFeaturedDealsApi,
    editPendingDealApi,
    deletePendingDealApi,
    getHotDealsApi,
    getFlashDealsApi,
    getPopularDealsApi,
    getRecentDealsApi,
    getBestDealsApi,
    getDealsForUserApi,
    getDealByDealIdAndSlugApi,
    reportDealApi,
    unReportDealApi,
    getCategoriesApi,
    addCategoryApi,
    updateViewsOnDealApi,
} from '../../services/api/deals';
import {
    addNewCommentApi,
    getCommentByDealIdApi,
    deleteCommentApi,
    editCommentApi,
    updateReportCommentApi,
    getReportedCommentByDealIdApi,
    addReportedCommentApi,
    getChildrenCommentByCommentIdApi,
    updateFeaturedCommentStatusApi,
    getFeaturedCommentByDealIdApi,
} from '../../services/api/comments';
import { removeAccents, getNewReputationScore, removeTagFromString, hasEditorPermission } from '../../services/utils/common';
import { getUserApi } from '../../services/api/users';
import { updateReputationScore } from '../users/saga';
import moment from 'moment';
import { ADD_FLAG_NOTI, DISPLAY_EMPTY_PAGE_MESSAGE } from '../app/action';
import { BEST_DEALS_MAX, DEALBEE_PATHS, DEALS_FOR_USER_PER_PAGE, DEAL_COMMENTS_PER_PAGE, FEATURED_DEALS_PER_PAGE, FLAGS, FLASH_DEALS_MAX, HOT_DEALS_PER_PAGE, POPULAR_DEALS_PER_PAGE, RECENT_DEALS_PER_PAGE, SEARCH_KEY_DEALS_PER_PAGE } from '../../services/utils/constant';
import { UPDATE_USER_POINT } from '../users/action';

const getSelectedDealComment = (state) => state.deals.selectedDealComments;
const getSelectedDeal = (state) => state.deals.selectedDeal;
const getFeaturedDealsOffset = (state) => state.deals.featuredDeals.offset;
const getHotDealsOffset = (state) => state.deals.hotDeals.offset;
const getPopularDealsOffset = (state) => state.deals.popularDeals.offset;
const getRecentDealsOffset = (state) => state.deals.recentDeals.offset;
const getDealsForUserOffset = (state) => state.deals.dealsForUser.offset;
const getCurrentUser = (state) => state ? state.users.currentUser : {};
const getCurrentCategory = (state) => state.deals.currentCategory;
const getChildrenComments = (state) => state.deals.childrenComments;
const getDealsBySearchKey = (state) => state.deals.dealsBySearchKey;

function* getCategories() {
    const response = yield call(getCategoriesApi);
    if (response.status === 200) {
        yield put({
            type: GET_CATEGORIES_SUCCESS,
            data: response.data.map((item) => ({
                value: item.key,
                label: item.label
            }))
        })
    }
}

export function* getCategoriesSaga() {
    yield takeLatest(GET_CATEGORIES, getCategories)
}

function* addCategory(action) {
    const { value, label } = action;
    const params = { value, label };
    try {
        yield call(addCategoryApi, params);
        yield put({
            type: ADD_CATEGORY_SUCCESS,
            newCategory: params,
        })
    } catch (e) {
        console.log(e);
    }
}

export function* addCategorySaga() {
    yield takeLatest(ADD_CATEGORY, addCategory)
}

function* updateViews(selectedDeal) {
    const { id, views } = selectedDeal;
    const newViews = views === null ? 1 : views + 1;
    const params = {
        id,
        newViews,
    }
    const res = yield call(updateViewsOnDealApi, params);
    if (res.status === 200) {
        yield put({
            type: UPDATE_VIEWS,
            newViews,
        })
    }
}

function* crawlDataFromShopee(action) {
    const { link } = action;
    var n = link.length;
        var i = n - 1;
        while (i >= 0) {
            if (link[i-1] === '.') {
                break;
            }
            i--;
        }
        var j = i - 2;
        while (j >= 0) {
            if (link[j-1] === '.') {
                break;
            }
            j--;
        }
        var idProduct = link.substring(i, n);
        var idShop = link.substring(j, i - 1);
        
        yield call(crawlDataFromShopeeApi, idProduct, idShop);
    
        
}
export function* crawlDataFromShopeeSaga() {
    yield takeLatest(CRAWL_DATA_FROM_SHOPEE, crawlDataFromShopee);
}

function* crawlDataFromTiki(action) {
    const { link } = action;
    var n = link.indexOf(".html");
        var i = n-1;
        while (i >= 0) {
            if (link[i-1] === 'p') {
                break;
            }
            i--;
        }
        
    var idProduct = link.substring(i, n)
        
    const res = yield call(crawlDataFromTikiApi, idProduct);
    const description = removeTagFromString(res.data.description);

    if (res.status === 200) {
        const productInfo = {
            title: res.data.name,
            discount: res.data.discount_rate,
            imgUrls: res.data.thumbnail_url,
            price: res.data.price,
            detail: description,
            short_detail: res.data.short_description,
            originalPrice: res.data.list_price,
        }

        yield put({
            type: CRAWL_DATA_FROM_TIKI_SUCCESS,
            productInfo,
        })
    }
        
}
export function* crawlDataFromTikiSaga() {
    yield takeLatest(CRAWL_DATA_FROM_TIKI, crawlDataFromTiki);
}

function* createDeal(action) {
    const { content, category, expiredDate } = action;
    const user = yield select(getCurrentUser);
    const params = {
        userId: user.id,
        content,
        category: category || "others",
        expiredDate,
    }

    const response = yield call(createDealApi, params);
    if (response.status === 200) {
        yield put({
            type: CREATE_DEAL_SUCCESS,
            ...response.data,
            username: user.username,
        })
       /*  yield put({
            type: SET_SELECTED_DEAL,
            id: response.data.id,
        }) */
    } 
}

export function* createDealSaga() {
    yield takeLatest(CREATE_DEAL, createDeal);
}

function* deletePendingDeal(action) {
    const {dealId} = action;
    const currentUser = yield select(getCurrentUser);
    const params = {
        dealId,
        userId: currentUser.id
    }
    const response = yield call(deletePendingDealApi, params);
    if (response.status === 200 && response.data.message === "success") {
        yield put({
            type: DELETE_PENDING_DEAL_SUCCESS,
            dealId,
        })
        yield put({
            type: ADD_FLAG_NOTI,
            flag: FLAGS.ownerDeleteDealSuccess,
        })
    }
}

export function* deletePendingDealSaga() {
    yield takeLatest(DELETE_PENDING_DEAL, deletePendingDeal);
}

function* editPendingDeal(action) {
    const {dealId, info, category, preCategory, expiredDate} = action;
    const currentUser = yield select(getCurrentUser);
    const params = {
        dealId, 
        info,
        preCategory,
        category,
        expiredDate,
        userId: currentUser.id,
    }
    try {
        const response = yield call(editPendingDealApi, params);
        const {data: {id, category, expired_at, info}} = response;
        yield put({
            type: EDIT_PENDING_DEAL_SUCCESS,
            deal: {
                id, category, expired_at, info                
            },
        })
        yield put({
            type: ADD_FLAG_NOTI,
            flag: FLAGS.editInfoSuccess,
        })
    } catch (e) {
        yield put({
            type: EDIT_PENDING_DEAL_FAIL
        })
        yield put({
            type: ADD_FLAG_NOTI,
            flag: FLAGS.changeAvatarFail,
        })
    }
}

export function* editPendingDealSaga() {
    yield takeLatest(EDIT_PENDING_DEAL, editPendingDeal);
}

function* setLikedStatus(action) {
    const { selectedDeal, status, userId, isDisliked, oldPoint } = action;
    const {id, user_id: ownerId} = selectedDeal;

    // update status on UI and db
    const params = {
        dealId: id,
        userId,
        ownerId,
        isLiked: true,
        oldPoint
    }
    let res;
    if (isDisliked) yield call(updateDealReactionsApi, params);
    else {
        status ? res = yield call(addDealReactionsApi, params) : res = yield call(deleteDealReactionsApi, {params}); 

        yield put({
            type: UPDATE_USER_POINT,
            newPoint: res.data.user.point
        })
    }   
     // update reputation score for post owner
    const newOwnerAction = yield getNewReputationScore(status, selectedDeal.username);
    const dataOwner = {username: selectedDeal.username, result: newOwnerAction}
    yield updateReputationScore(dataOwner);  
  
     
}
export function* setLikedStatusSaga() {
    yield takeLatest(SET_LIKE, setLikedStatus);
}

function* getLikeByDealId(action) {
    const { dealId } = action;
    const dealPageParams = yield(select((state) => state.app.detailPageParams));
    const params = { dealId, slug: dealPageParams.slug, isLiked: true };
    const response = yield call(getDealReactionsByDealApi, {params});

    if (response.status === 200) {
        yield put({
            type: GET_LIKE_BY_DEAL_ID_SUCCESS,
            data: response.data,
        })
    }
}

export function* getLikeByDealIdSaga() {
    yield takeLatest(GET_LIKE_BY_DEAL_ID, getLikeByDealId);
}

function* addNewComment(action) {
    const { comment } = action;
    const selectedDeal = yield select(getSelectedDeal);
    const { user_id: ownerId } = selectedDeal;
    const currentUser = yield select(getCurrentUser);

    const response = yield call(addNewCommentApi, {...comment, ownerId, oldPoint: parseInt(currentUser.point)});
    // const res = yield call(getUserApi, comment.content.username);
    // response.data.userInfo = res.data;  
    if (response.status === 200) {
        yield put({
            type: ADD_NEW_COMMENT_SUCCESS,
            newComment: {
                ...response.data.comment,
                user_id: currentUser.id,
                user_info: currentUser.info,
                user_username: currentUser.username,
                user_role: currentUser.role,
            },
            parentId: comment.parentId,
        })
    }
}

export function* addNewCommentSaga() {
    yield takeLatest(ADD_NEW_COMMENT, addNewComment);
}

function* getCommentByDealId(action) {
    const { dealId } = action;
    const dealPageParams = yield(select((state) => state.app.detailPageParams));
    const list = yield select(getSelectedDealComment);
    const params = { dealId, offset: list.length, limit: DEAL_COMMENTS_PER_PAGE, slug: dealPageParams.slug};
    const response = yield call(getCommentByDealIdApi, { params });
    if (response.status === 200 && !response.data.message) {
        yield put({
            type: GET_COMMENT_BY_DEAL_ID_SUCCESS,
            data: response.data,
            // reportedComments: reportedCommentResponse.data,
        })
    }
    
}

export function* getCommentByDealIdSaga() {
    yield takeLatest(GET_COMMENT_BY_DEAL_ID, getCommentByDealId);
}

function* getChildrenCommentByCommentId(action) {
    const { commentId } = action;
    const list = yield select(getChildrenComments);
    const currentChildrenComments = list.filter((i) => i.parent_id === commentId);
    const params = { commentId, offset: currentChildrenComments.length, limit: DEAL_COMMENTS_PER_PAGE};
    const response = yield call(getChildrenCommentByCommentIdApi, { params });
    if (response.status === 200 && !response.data.message) {
        yield put({
            type: GET_CHILDREN_COMMENT_BY_COMMENT_ID_SUCCESS,
            data: response.data,
        })
    }
    
}

export function* getChildrenCommentByCommentIdSaga() {
    yield takeLatest(GET_CHILDREN_COMMENT_BY_COMMENT_ID, getChildrenCommentByCommentId);
}

function* getReportedCommentByDealId(action) {
    const dealPageParams = yield(select((state) => state.app.detailPageParams));
    const {dealId} = action;
    const params = {dealId, slug: dealPageParams.slug};
    const response = yield call(getReportedCommentByDealIdApi, { params });
    if (response.status === 200) {
        yield put({
            type: GET_REPORTED_COMMENT_BY_DEAL_ID_SUCCESS,
            reportedComments: response.data,
        })
    }
}

export function* getReportedCommentByDealIdSaga() {
    yield takeLatest(GET_REPORTED_COMMENT_BY_DEAL_ID, getReportedCommentByDealId)
}

function* deleteComment(action) {
    const { commentId } = action;
    const selectedDealComments = yield select(getSelectedDealComment);
    const childrenComments = yield select(getChildrenComments);
    const currentComment = selectedDealComments.filter(i => i.id === commentId)[0] || childrenComments.filter(i => i.id === commentId)[0]
    const numberOfDeletedMarkedComments = 1 + parseInt(currentComment.number_of_children || 0);

    const params = { commentId, oldPoint: currentComment.user_point }
    const res = yield call(deleteCommentApi, {params});
    if (res.status === 200) {
        yield put({
            type: DELETE_COMMENT_SUCCESS,
            commentId,
            numberOfDeletedMarkedComments,
            parentId: currentComment.parent_id,
        })
    }
}

export function* deleteCommentSaga() {
    yield takeLatest(DELETE_COMMENT, deleteComment);
}

function* editComment(action) {
    const {newComment} = action;
    const params = {
        content: newComment.content,
        commentId: newComment.id,
    }

    const res = yield call(editCommentApi, params);
    if (res.status === 200) {
        yield put({
            type: EDIT_COMMENT_SUCCESS,
            newComment: newComment.content,
            commentId: newComment.id,
            updatedAt: res.data.comment.updated_at,
        })
    }
}

export function* editCommentSaga() {
    yield takeLatest(EDIT_COMMENT, editComment);
}

function* getAllDeals() {
    yield put({
        type: GET_FEATURED_DEALS,
    })    
    yield put({
        type: GET_HOT_DEALS,
    })
    yield put({
        type: GET_FLASH_DEALS,
    })
    yield put({
        type: GET_RECENT_DEALS,
    })
    yield put({
        type: GET_POPULAR_DEALS,
    })
    yield put({
        type: GET_BEST_DEALS,
    })
    const currentUser = yield select(getCurrentUser);
    if (currentUser.id) {
        yield put({
            type: GET_DEALS_FOR_USER
        })
    }
}

export function* getAllDealsSaga() {
    yield takeLatest(GET_ALL_DEALS, getAllDeals)
}

function* getFeaturedDeals() {
    const category = yield select(getCurrentCategory);
    const offset = yield select(getFeaturedDealsOffset);
    if (offset < 0) {
        yield put({
            type: GET_FEATURED_DEALS_SUCCESS,
            list: [],
        })
        return;
    };
    const params = {
        category,
        offset,
        limit: FEATURED_DEALS_PER_PAGE,
    }
    const response = yield call(getFeaturedDealsApi, params);
    if (response.status === 200) {
        yield put({
            type: GET_FEATURED_DEALS_SUCCESS,
            list: response.data,
        })
    }
}

export function* getFeaturedDealsSaga() {
    yield takeLatest(GET_FEATURED_DEALS, getFeaturedDeals)
}

function* getHotDeals() {
    const category = yield select(getCurrentCategory);
    const offset = yield select(getHotDealsOffset);
    if (offset < 0) {
        yield put({
            type: GET_HOT_DEALS_SUCCESS,
            list: [],
        })
        return;
    }
    const params = {
        category, 
        offset,
        limit: HOT_DEALS_PER_PAGE,
    }
    const response = yield call(getHotDealsApi, params);
    if (response.status === 200) {
        yield put({
            type: GET_HOT_DEALS_SUCCESS,
            list: response.data,
        })
    }
}

export function* getHotDealsSaga() {
    yield takeLatest(GET_HOT_DEALS, getHotDeals)
}

function* getFlashDeals() {
    const category = yield select(getCurrentCategory);
    const params = {
        category,
        limit: FLASH_DEALS_MAX,
    }
    const response = yield call(getFlashDealsApi, params);
    if (response.status === 200) {
        yield put({
            type: GET_FLASH_DEALS_SUCCESS,
            list: response.data,
        })
    }
}

export function* getFlashDealsSaga() {
    yield takeLatest(GET_FLASH_DEALS, getFlashDeals)
}

function* getPopularDeals() {
    const category = yield select(getCurrentCategory);
    const offset = yield select(getPopularDealsOffset);
    if (offset < 0) {
        yield put({
            type: GET_POPULAR_DEALS_SUCCESS,
            list: [],
        })
        return;
    }
    const params = {
        category,
        offset,
        limit: POPULAR_DEALS_PER_PAGE,
    }
    const response = yield call(getPopularDealsApi, params);
    if (response.status === 200) {
        yield put({
            type: GET_POPULAR_DEALS_SUCCESS,
            list: response.data,
        })
    }
}

export function* getPopularDealsSaga() {
    yield takeLatest(GET_POPULAR_DEALS, getPopularDeals)
}

function* getRecentDeals() {
    const category = yield select(getCurrentCategory);
    const offset = yield select(getRecentDealsOffset);
    if (offset < 0) {
        yield put({
            type: GET_RECENT_DEALS_SUCCESS,
            list: []
        });
        return;
    }
    const params = {
        category, 
        offset,
        limit: RECENT_DEALS_PER_PAGE
    }
    const response = yield call(getRecentDealsApi, params);
    if (response.status === 200) {
        yield put({
            type: GET_RECENT_DEALS_SUCCESS,
            list: response.data,
        })
    }
}

export function* getRecentDealsSaga() {
    yield takeLatest(GET_RECENT_DEALS, getRecentDeals)
}

function* getBestDeals(action) {
    const currentCategory = yield select(getCurrentCategory);
    const params = {
        category: action.category || currentCategory,
        limit: BEST_DEALS_MAX
    }
    const response = yield call(getBestDealsApi, params);
    if (response.status === 200) {
        yield put({
            type: GET_BEST_DEALS_SUCCESS,
            list: response.data,
        })
    }
}

export function* getBestDealsSaga() {
    yield takeLatest(GET_BEST_DEALS, getBestDeals)
}

function* getDealsForUser() {
    const offset = yield select(getDealsForUserOffset);
    if (offset < 0) {
        yield put({
            type: GET_DEALS_FOR_USER_SUCCESS,
            list: []
        })
        return;
    }
    const response = yield call(getDealsForUserApi, { offset, limit: DEALS_FOR_USER_PER_PAGE });
    if (response.status === 200) {
        yield put({
            type: GET_DEALS_FOR_USER_SUCCESS,
            list: response.data,
        })
    }
}

export function* getDealsForUserSaga() {
    yield takeLatest(GET_DEALS_FOR_USER, getDealsForUser)
}

function* getDeal(action) {
    const dealPageParams = yield(select((state) => state.app.detailPageParams));
    const isDetailPage = dealPageParams.id ? true : false;
    const dealId = isDetailPage ? dealPageParams.id : action.id;
    const params = isDetailPage ? {id: dealId, slug: dealPageParams.slug} : {id: dealId};
    const response = isDetailPage 
        ? yield call(getDealByDealIdAndSlugApi, {params}) 
        : yield call(getDealByDealIdApi, {params});
    const currentUser = yield(select(getCurrentUser))
    if (response.status !== 200 || response.data.message !== "success") {
        if (!dealPageParams.isPreview) {
            if (response.data.message === "[error][deal][not approved]" && hasEditorPermission(currentUser.role)) {
                window.location.href = `${DEALBEE_PATHS.admin}?dealId=${dealId}`
            } else {
                yield put({
                    type: DISPLAY_EMPTY_PAGE_MESSAGE,
                })
            }
        }
        return;
    }
    let selectedDeal =  response.data;
    const username = selectedDeal.username;
    const userInfoRes = yield call(getUserApi, username);
    selectedDeal.user_info = userInfoRes.data.user;
    if (isDetailPage) {
        /* const responseFollowerUser = yield call(getFollowerByUsernameApi, userId)
        yield put({
            type: GET_FOLLOWER_BY_USER_ID_SUCCESS,
            followerUserIds: responseFollowerUser.data,
        }) */
      /*   yield put({
            type: GET_COMMENT_BY_DEAL_ID,
            dealId,
        }) */
        yield put({
            type: GET_REPORTED_COMMENT_BY_DEAL_ID,
            dealId,
        })
        yield put({
            type: GET_LIKE_BY_DEAL_ID,
            dealId,
        })
        yield put({
            type: GET_DISLIKE_BY_DEAL_ID,
            dealId,
        })
        yield put({
            type: GET_FEATURED_COMMENT_BY_DEAL_ID,
            dealId,
        })
    }
    yield put({
        type: GET_DEAL_SUCCESS,
        deal: selectedDeal,
    })
    yield updateViews(response.data);
}

export function* getDealSaga() {
    yield takeLatest(GET_DEAL, getDeal)
}

function* setDisLikedStatus(action) {
    const { selectedDeal, status, userId, isLiked, oldPoint } = action;
    const {id} = selectedDeal;
    
    // update status on UI and db
    const params = {
        dealId: id,
        userId,
        isLiked: false,
        oldPoint
    }
    let res;
    if (isLiked) yield call(updateDealReactionsApi, params);
    else {
        status ? res = yield call(addDealReactionsApi, params) : res = yield call(deleteDealReactionsApi, {params});

        yield put({
            type: UPDATE_USER_POINT,
            newPoint: res.data.user.point
        })
    }

    if (isLiked) {
        // update reputation score for post owner
        const newOwnerAction = yield getNewReputationScore(false, selectedDeal.username);
        const dataOwner = {username: selectedDeal.username, result: newOwnerAction}
        yield updateReputationScore(dataOwner);
    }
}
export function* setDisLikedStatusSaga() {
    yield takeLatest(SET_DISLIKE, setDisLikedStatus);
}

function* getDisLikeByDealId(action) {
    const { dealId } = action;
    const dealPageParams = yield(select((state) => state.app.detailPageParams));
    const params = { dealId, slug: dealPageParams.slug, isLiked: false };
    const response = yield call(getDealReactionsByDealApi, {params});

    if (response.status === 200) {
        yield put({
            type: GET_DISLIKE_BY_DEAL_ID_SUCCESS,
            data: response.data,
        })
    }
}

export function* getDisLikeByDealIdSaga() {
    yield takeLatest(GET_DISLIKE_BY_DEAL_ID, getDisLikeByDealId);
}

function* setLikeComment(action) {
    const { commentId, status, userId } = action;
    const selectedDealComments = yield select(getSelectedDealComment);
    const currentComment = selectedDealComments.filter((comment) => comment.id === commentId)[0];
    const { likeUsers, text, dislikeUsers, username } = currentComment.content;
    let newLikeUsers = [];
    let newDisLikeUsers = dislikeUsers;
    if (status) {
        newLikeUsers = [...likeUsers, { userId }];
        const dislikeUsersId = dislikeUsers.map((i) => i.userId);
        if (dislikeUsersId.includes(userId)) {
            newDisLikeUsers = dislikeUsers.filter((item) => item.userId !== userId);
        }
    }
    else {
        newLikeUsers = likeUsers.filter((item) => item.userId !== userId);
    }
    const params = {
        content: {text, likeUsers: newLikeUsers, dislikeUsers: newDisLikeUsers, username},
        commentId,
        isLiked: status,
        userId,
    }
    yield put({
        type: SET_LIKE_OR_DISLIKE_COMMENT_SUCCUESS,
        newContent:  params.content,
        commentId,
    })
    yield call(editCommentApi, params);
}

export function* setLikeCommentSaga() {
    yield takeLatest(SET_LIKE_COMMENT, setLikeComment);
}

function* setDisLikeComment(action) {
    const { commentId, status, userId } = action;
    const selectedDealComments = yield select(getSelectedDealComment);
    const currentComment = selectedDealComments.filter((comment) => comment.id === commentId)[0];
    const { likeUsers, text, dislikeUsers, username } = currentComment.content;
    let newDisLikeUsers = [];
    let newLikeUsers = likeUsers;
    if (status) {
        newDisLikeUsers = [...dislikeUsers, { userId }];
        const likeUsersId =likeUsers.map((i) => i.userId);
        if (likeUsersId.includes(userId)) {
            newLikeUsers = likeUsers.filter((item) => item.userId !== userId);
        }
    }
    else {
        newDisLikeUsers = dislikeUsers.filter((item) => item.userId !== userId);
    }

    const params = {
        content: {text, likeUsers: newLikeUsers, dislikeUsers: newDisLikeUsers, username},
        commentId,
    }
    yield put({
        type: SET_LIKE_OR_DISLIKE_COMMENT_SUCCUESS,
        newContent:  params.content,
        commentId,
    })
    yield call(editCommentApi, params);
}

export function* setDisLikeCommentSaga() {
    yield takeLatest(SET_DISLIKE_COMMENT, setDisLikeComment);
}

function* searchDeal(action) {
    const { searchKey } = action;
    const normalizedSearchKey = removeAccents(searchKey.toLowerCase());
    const currentDeals = yield select(getDealsBySearchKey);

    const params = {
        searchKey: normalizedSearchKey,
        offset: currentDeals.length, limit: SEARCH_KEY_DEALS_PER_PAGE,
    }
    const res = yield call(getDealBySearchKeyApi, { params })
    if (res.status === 200) {
        yield put({
            type: SEARCH_DEAL_SUCCESS,
            deals: res.data,
        })
    }
}

export function* searchDealSaga() {
    yield takeLatest(SEARCH_DEAL, searchDeal);
}

function* reportExpire(action) {
    const { selectedDeal, user, status } = action;
    const { id, is_reported } = selectedDeal;
    const reportedHour = moment().format('YYYY-MM-DD HH:mm:ss');
    const params = {
        user,
        report_hour: reportedHour,
    }
    let newIsReported;
    if (status) {
        newIsReported = is_reported === null ? [params] : [...is_reported, params];
    }
    else {
        newIsReported = is_reported.filter((item) => item.user !== user);
    }
    const res = yield call(updateIsReportedExpiredDealApi, {id, newIsReported});
    if (res.status ===  200) {
        yield put({       
            type: REPORT_EXPIRE_SUCCESS,
            newIsReported,
        })
    }
}

export function* reportExpireSaga() {
    yield takeLatest(REPORT_EXPIRE, reportExpire);
}

function* reportDeal(action) {
    const {payload: {type, content, isReporting}} = action;
    const currentDeal = yield select(getSelectedDeal);
    const {id: dealId, category, info: {title}} = currentDeal;
    if (isReporting) {
        const params = {
            dealId,
            type,
            content,
            category, 
            title
        }
        const response = yield call(reportDealApi, params);
        if (response.status === 200 && response.data.message === "success") {
            const {data: {type, content, reported_at}} = response;
            yield put({
                type: REPORT_DEAL_SUCCESS,
                payload: {type, content, reported_at}
            })
            yield put({
                type: ADD_FLAG_NOTI,
                flag: FLAGS.reportDealSuccess
            })
        }
    } else {
        const response = yield call(unReportDealApi, {dealId});
        if (response.status === 200 && response.data.message === "success") {
            yield put({
                type: UNREPORT_DEAL_SUCCESS,
            })
            yield put({
                type: ADD_FLAG_NOTI,
                flag: FLAGS.unreportDealSuccess
            })
        }
    }
}

export function* reportDealSaga() {
    yield takeLatest(REPORT_DEAL, reportDeal)
}



function* reportComment(action) {
    const { content, comment } = action;
    const { userId } = content;
    const {id, is_reported} = comment;
    let newIsReported;
    
    newIsReported = is_reported === null ? [userId] : [...is_reported, userId]

    const res = yield call(updateReportCommentApi, {id, newIsReported});
    const contentRes = yield call(addReportedCommentApi, content);
    if (contentRes.status === 200 && res.status === 200 && res.data.message === "success") {
        yield put({
            type: REPORT_COMMENT_SUCCESS,
            newIsReported,
            commentId: id,
            newReportedComment: contentRes.data.comment,
        })
    }
}

export function* reportCommentSaga() {
    yield takeLatest(REPORT_COMMENT, reportComment);
}

function* changeCategory() {
    yield put({
        type: GET_ALL_DEALS
    })
}

export function* changeCategorySaga() {
    yield takeLatest(CHANGE_CATEGORY, changeCategory);
}

function* updateFeaturedCommentStatus(action) {
    const {commentId, userId, status} = action;
    const res = yield call(updateFeaturedCommentStatusApi, {id: commentId, userId, status})

    if (res.status === 200 && res.data.message === 'success') {
        yield put({
            type: UPDATE_FEATURED_COMMENT_STATUS_SUCCESS,
            commentId,
            userId,
            status,
        })
    }
}

export function* updateFeaturedCommentStatusSaga() {
    yield takeLatest(UPDATE_FEATURED_COMMENT_STATUS, updateFeaturedCommentStatus)
}

function* getFeaturedCommentByDealId(action){
    const { dealId } = action;
    const dealPageParams = yield(select((state) => state.app.detailPageParams));
    const params = { dealId, slug: dealPageParams.slug };
    const response = yield call(getFeaturedCommentByDealIdApi, { params });
    if (response.status === 200 && !response.data.message) {
        yield put({
            type: GET_FEATURED_COMMENT_BY_DEAL_ID_SUCCESS,
            data: response.data,
        })
    }
}

export function* getFeaturedCommentByDealIdSaga() {
    yield takeLatest(GET_FEATURED_COMMENT_BY_DEAL_ID, getFeaturedCommentByDealId)
}