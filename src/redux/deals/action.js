export const GET_CATEGORIES = "GET_CATEGORIES";
export const GET_CATEGORIES_SUCCESS = "GET_CATEGORIES_SUCCESS";
export const getCategories = () => ({
    type: GET_CATEGORIES,
})

export const ADD_CATEGORY = "ADD_CATEGORY";
export const ADD_CATEGORY_SUCCESS = "ADD_CATEGORY_SUCCESS";
export const addCategory = (value, label) => ({
    type: ADD_CATEGORY,
    value, label
})

export const SEARCH_DEAL = "SEARCH_DEAL";
export const SEARCH_DEAL_SUCCESS = "SEARCH_DEAL_SUCCESS";
export const searchDeal = (searchKey) => ({
    type: SEARCH_DEAL,
    searchKey,
})

export const UPDATE_SEARCH_KEY = "UPDATE_SEARCH_KEY";
export const updateSearchKey = (searchKey) => ({
    type: UPDATE_SEARCH_KEY,
    searchKey,
})

export const CREATE_DEAL = "CREATE_DEAL";
export const CREATE_DEAL_SUCCESS = "CREATE_DEAL_SUCCESS";

export const createDeal = (userId, content, category, expiredDate) => ({
    type: CREATE_DEAL,
    userId,
    content,
    category,
    expiredDate,
})

export const DELETE_PENDING_DEAL = "DELETE_PENDING_DEAL";
export const DELETE_PENDING_DEAL_SUCCESS = "DELETE_PENDING_DEALS_SUCCESS";

export const deletePendingDeal = (dealId) => ({
    type: DELETE_PENDING_DEAL,
    dealId,
})

export const EDIT_PENDING_DEAL = "EDIT_PENDING_DEAL";
export const EDIT_PENDING_DEAL_SUCCESS = "EDIT_PENDING_DEAL_SUCCESS";
export const EDIT_PENDING_DEAL_FAIL = "EDIT_PENDING_DEAL_FAIL";

export const editPendingDeal = (dealId, info, category, preCategory, expiredDate) => ({
    type: EDIT_PENDING_DEAL,
    dealId, 
    info,
    category,
    preCategory,
    expiredDate,
})

export const SET_SELECTED_DEAL = "SET_SELECTED_DEAL";
export const setSelectedDeal = (id) => ({
    type: SET_SELECTED_DEAL,
    id,
})

export const CHANGE_CATEGORY = "CHANGE_CATEGORY";
export const changeCategory = (newCate) => ({
    type: CHANGE_CATEGORY,
    newCate,
})

export const SET_LIKE = "SET_LIKE";
export const ADD_LIKE_SUCCUESS = "ADD_LIKE_SUCCESS";
export const DELETE_LIKE_SUCCUESS = "DELETE_LIKE_SUCCESS";
export const setLikedStatus = (selectedDeal, status, userId, isDisliked, oldPoint) => ({
    type: SET_LIKE,
    selectedDeal,
    status,
    userId,
    isDisliked,
    oldPoint,
})

export const SET_DISLIKE = "SET_DISLIKE";
export const ADD_DISLIKE_SUCCUESS = "ADD_DISLIKE_SUCCESS";
export const DELETE_DISLIKE_SUCCUESS = "DELETE_DISLIKE_SUCCESS";
export const setDisLikedStatus = (selectedDeal, status, userId, isLiked, oldPoint) => ({
    type: SET_DISLIKE,
    selectedDeal,
    status,
    userId,
    isLiked,
    oldPoint,
})

export const GET_LIKE_BY_DEAL_ID = "GET_LIKE_BY_DEAL_ID";
export const GET_LIKE_BY_DEAL_ID_SUCCESS = "GET_LIKE_BY_DEAL_ID_SUCCESS";
export const getLikeByDealId = (dealId) => ({
    type: GET_LIKE_BY_DEAL_ID,
    dealId,
})

export const GET_DISLIKE_BY_DEAL_ID = "GET_DISLIKE_BY_DEAL_ID";
export const GET_DISLIKE_BY_DEAL_ID_SUCCESS = "GET_DISLIKE_BY_DEAL_ID_SUCCESS";
export const getDisLikeByDealId = (dealId) => ({
    type: GET_DISLIKE_BY_DEAL_ID,
    dealId,
})

export const CRAWL_DATA_FROM_SHOPEE = "CRAWL_DATA_FROM_SHOPEE";
export const CRAWL_DATA_FROM_SHOPEE_SUCCESS = "CRAWL_DATA_FROM_SHOPEE_SUCCESS";
export const crawlDataFromShopee = (link) => ({
    type: CRAWL_DATA_FROM_SHOPEE,
    link,
})

export const CRAWL_DATA_FROM_TIKI = "CRAWL_DATA_FROM_TIKI";
export const CRAWL_DATA_FROM_TIKI_SUCCESS = "CRAWL_DATA_FROM_TIKI_SUCCESS";
export const crawlDataFromTiki = (link) => ({
    type: CRAWL_DATA_FROM_TIKI,
    link,
})

export const ADD_NEW_COMMENT = 'ADD_NEW_COMMENT';
export const ADD_NEW_COMMENT_SUCCESS = 'ADD_NEW_COMMENT_SUCCESS';
export const addNewComment = (comment) => ({
  type: ADD_NEW_COMMENT,
  comment,
});

export const GET_COMMENT_BY_DEAL_ID = "GET_COMMENT_BY_DEAL_ID";
export const GET_COMMENT_BY_DEAL_ID_SUCCESS = "GET_COMMENT_BY_DEAL_ID_SUCCESS";
export const getCommentByDealId = (dealId) => ({
    type: GET_COMMENT_BY_DEAL_ID,
    dealId,
})

export const GET_CHILDREN_COMMENT_BY_COMMENT_ID = "GET_CHILDREN_COMMENT_BY_COMMENT_ID";
export const GET_CHILDREN_COMMENT_BY_COMMENT_ID_SUCCESS = "GET_CHILDREN_COMMENT_BY_COMMENT_ID_SUCCESS";
export const getChildrenCommentByCommentId = (commentId) => ({
    type: GET_CHILDREN_COMMENT_BY_COMMENT_ID,
    commentId,
})

export const HIDE_CHILDREN_COMMENT = "HIDE_CHILDREN_COMMENT";
export const hideAllReplyComments = (replyComments) => ({
    type: HIDE_CHILDREN_COMMENT,
    replyComments,
})


export const GET_REPORTED_COMMENT_BY_DEAL_ID = "GET_REPORTED_COMMENT_BY_DEAL_ID";
export const GET_REPORTED_COMMENT_BY_DEAL_ID_SUCCESS = "GET_REPORTED_COMMENT_BY_DEAL_ID_SUCCESS";

export const getReportedCommentByDealId = (dealId) => ({
    type: GET_REPORTED_COMMENT_BY_DEAL_ID,
    dealId,
})

export const DELETE_COMMENT = 'DELETE_COMMENT';
export const DELETE_COMMENT_SUCCESS = 'DELETE_COMMENT_SUCCESS';
export const deleteComment = (commentId, username) => ({
    type: DELETE_COMMENT,
    commentId,
    username,
})

export const EDIT_COMMENT = 'EDIT_COMMENT';
export const EDIT_COMMENT_SUCCESS = 'EDIT_COMMENT_SUCCESS';
export const editComment = (dealId, newComment) => ({
    type: EDIT_COMMENT,
    dealId,
    newComment,
})

export const GET_ALL_DEALS = "GET_ALL_DEALS";
export const GET_ALL_DEALS_SUCCESS = "GET_ALL_DEALS_SUCCESS";

export const getAllDeals = () => ({
    type: GET_ALL_DEALS,
})

export const GET_FEATURED_DEALS = "GET_FEATURED_DEALS";
export const GET_FEATURED_DEALS_SUCCESS = "GET_FEATURED_DEALS_SUCCESS";

export const getFeaturedDeals = () => ({
    type: GET_FEATURED_DEALS,
})

export const GET_HOT_DEALS = "GET_HOT_DEALS";
export const GET_HOT_DEALS_SUCCESS = "GET_HOT_DEALS_SUCCESS";

export const getHotDeals = () => ({
    type: GET_HOT_DEALS,
})

export const GET_FLASH_DEALS = "GET_FLASH_DEALS";
export const GET_FLASH_DEALS_SUCCESS = "GET_FLASH_DEALS_SUCCESS";

export const getFlashDeals = () => ({
    type: GET_FLASH_DEALS,
})

export const GET_POPULAR_DEALS = "GET_POPULAR_DEALS";
export const GET_POPULAR_DEALS_SUCCESS = "GET_POPULAR_DEALS_SUCCESS";

export const getPopularDeals = () => ({
    type: GET_POPULAR_DEALS,
})

export const GET_RECENT_DEALS = "GET_RECENT_DEALS";
export const GET_RECENT_DEALS_SUCCESS = "GET_RECENT_DEALS_SUCCESS";

export const getRecentDeals = () => ({
    type: GET_RECENT_DEALS,
})

export const GET_BEST_DEALS = "GET_BEST_DEALS";
export const GET_BEST_DEALS_SUCCESS = "GET_BEST_DEALS_SUCCESS";

export const getBestDeals = (category) => ({
    type: GET_BEST_DEALS,
    category,
})

export const GET_DEALS_FOR_USER = "GET_DEALS_FOR_USER";
export const GET_DEALS_FOR_USER_SUCCESS = "GET_DEALS_FOR_USER_SUCCESS";

export const getDealsForUsers = () => ({
    type: GET_DEALS_FOR_USER
})

export const GET_DEAL = "GET_DEAL";
export const GET_DEAL_SUCCESS = "GET_DEAL_SUCCESS";

export const getDeal = (id) => ({
    type: GET_DEAL,
    id,
})

export const SET_LIKE_COMMENT = "SET_LIKE_COMMENT";
export const SET_DISLIKE_COMMENT = "SET_DISLIKE_COMMENT";
export const SET_LIKE_OR_DISLIKE_COMMENT_SUCCUESS = "SET_LIKE_OR_DISLIKE_COMMENT_SUCCUESS";

export const setLikeComment = (commentId, status, userId) => ({
    type: SET_LIKE_COMMENT,
    commentId,
    status,
    userId,
})

export const setDisLikeComment = (commentId, status, userId) => ({
    type: SET_DISLIKE_COMMENT,
    commentId,
    status,
    userId,
})

export const OPEN_ERROR_MESSAGE_MODAL = "OPEN_ERROR_MESSAGE_MODAL";
export const openErrorMessageModal = (status) => ({
    type: OPEN_ERROR_MESSAGE_MODAL,
    status,
})

export const REPORT_EXPIRE = "REPORT_EXPIRE";
export const REPORT_EXPIRE_SUCCESS = "REPORT_EXPIRE_SUCCESS";
export const reportExpire = (selectedDeal, user, status) => ({
    type: REPORT_EXPIRE,
    selectedDeal,
    user,
    status,
})

export const REPORT_DEAL = "REPORT_DEAL";
export const REPORT_DEAL_SUCCESS = "REPORT_DEAL_SUCCESS";
export const UNREPORT_DEAL_SUCCESS = "UNREPORT_DEAL_SUCCESS";

export const reportDeal = (payload) => ({
    type: REPORT_DEAL,
    payload
})

export const REPORT_COMMENT = "REPORT_COMMENT";
export const REPORT_COMMENT_SUCCESS = "REPORT_COMMENT_SUCCESS";
export const reportComment = (content, comment) => ({
    type: REPORT_COMMENT,
    content,
    comment,
})

export const UPDATE_REPLY_COMMENT_ID = "UPDATE_REPLY_COMMENT_ID";
export const updateReplyCommentId = (parentId) => ({
    type: UPDATE_REPLY_COMMENT_ID,
    parentId,
})

export const UPDATE_FEATURED_COMMENT_STATUS = "UPDATE_FEATURED_COMMENT_STATUS";
export const UPDATE_FEATURED_COMMENT_STATUS_SUCCESS = "UPDATE_FEATURED_COMMENT_STATUS_SUCCESS";
export const updateFeaturedCommentStatus = (commentId, userId, status) => ({
    type: UPDATE_FEATURED_COMMENT_STATUS,
    commentId,
    userId,
    status,
})

export const GET_FEATURED_COMMENT_BY_DEAL_ID = "GET_FEATURED_COMMENT_BY_DEAL_ID";
export const GET_FEATURED_COMMENT_BY_DEAL_ID_SUCCESS = "GET_FEATURED_COMMENT_BY_DEAL_ID_SUCCESS";
export const getFeaturedCommentByDealId = (dealId) => ({
    type: GET_FEATURED_COMMENT_BY_DEAL_ID,
    dealId,
})

export const UPDATE_VIEWS = "UPDATE_VIEWS";