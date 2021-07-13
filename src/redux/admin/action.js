export const CHANGE_PAGE = "CHANGE_PAGE";
export const CHANGE_PAGE_SUCCESS = "CHANGE_PAGE_SUCCESS";

export const changePage = (page) => ({
    type: CHANGE_PAGE,
    page,
})

export const CHANGE_MENU_TAB = "CHANGE_MENU_TAB";
export const CHANGE_MENU_TAB_SUCCESS = "CHANGE_MENU_TAB_SUCCESS";

export const changeMenuTab = (tab) => ({
    type: CHANGE_MENU_TAB,
    tab,
})

export const GET_DEALS_COUNT = "GET_DEALS_COUNT";
export const GET_DEALS_COUNT_SUCCESS = "GET_DEALS_COUNT_SUCCESS";

export const getDealsCount = (viewed) => ({
    type: GET_DEALS_COUNT,
    viewed
})

export const GET_DEALS = "GET_DEALS";
export const GET_DEALS_SUCCESS = "GET_DEALS_SUCCESS";

export const getDeals = () => ({
    type: GET_DEALS,
})

export const CHANGE_DEALS_FILTERS = "CHANGE_DEALS_FILTERS";
export const changeDealsFilters = (params) => ({
    type: CHANGE_DEALS_FILTERS,
    ...params,
})

export const REVIEW_DEAL = "REVIEW_DEAL";
export const REVIEW_DEAL_SUCCESS = "REVIEW_DEAL_SUCCESS";

export const reviewDeal = (deal, actionType) => ({
    type: REVIEW_DEAL,
    deal,
    actionType,
})

export const EDIT_DEAL = "EDIT_DEAL";
export const EDIT_DEAL_SUCCESS = "EDIT_DEAL_SUCCESS";
export const EDIT_DEAL_FAIL = "EDIT_DEAL_FAIL";

export const editDeal = (deal) => ({
    type: EDIT_DEAL,
    deal, 
}) 

export const UPDATE_EDITORS_NOTE = "UPDATE_EDITORS_NOTE";
export const UPDATE_EDITORS_NOTE_SUCCESS = "UPDATE_EDITORS_NOTE_SUCCESS";

export const updateEditorsNote = (note) => ({
    type: UPDATE_EDITORS_NOTE,
    note,
})

export const DELETE_EDITORS_NOTE = "DELETE_EDITORS_NOTE";
export const DELETE_EDITORS_NOTE_SUCCESS = "DELETE_EDITORS_NOTE_SUCCESS";

export const deleteEditorsNote = () => ({
    type: DELETE_EDITORS_NOTE
})

export const MARK_DEAL_AS_FEATURED = "MARK_DEAL_AS_FEATURED";
export const MARK_DEAL_AS_FEATURED_SUCCESS = "MARK_DEAL_AS_FEATURED_SUCCESS";

export const markDealAsFeatured = (isFeatured) => ({
    type: MARK_DEAL_AS_FEATURED,
    isFeatured
})

export const MARK_DEAL_AS_VIEWED = "MARK_DEAL_AS_VIEWED";
export const markDealAsViewed = (dealId) => ({
    type: MARK_DEAL_AS_VIEWED,
    dealId, 
})

export const GET_REPORTED_DEALS = "GET_REPORTED_DEALS";
export const getReportedDeals = () => ({
    type: GET_REPORTED_DEALS
})

export const GET_REPORTED_DEALS_COUNT = "GET_REPORTED_DEALS_COUNT";
export const GET_REPORTED_DEALS_COUNT_SUCCESS = "GET_REPORTED_DEALS_COUNT_SUCCESS";
export const getReportedDealsCount = () => ({
    type: GET_REPORTED_DEALS_COUNT
})

export const GET_USERS_REPORTED_DEAL = "GET_USERS_REPORTED_DEAL";
export const GET_USERS_REPORTED_DEAL_SUCCESS = "GET_USERS_REPORTED_DEAL_SUCCESS";
export const getUsersReportedDeal = (dealId) => ({
    type: GET_USERS_REPORTED_DEAL,
    dealId,
})

export const DELETE_REPORTS_ON_DEAL = "DELETE_REPORTS_ON_DEAL";
export const DELETE_REPORTS_ON_DEAL_SUCCESS = "DELETE_REPORTS_ON_DEAL_SUCCESS";
export const deleteReportsOnDeal = (dealId) => ({
    type: DELETE_REPORTS_ON_DEAL,
    dealId
})

// reported expired deals
export const GET_IS_REPORTED_EXPIRED_DEALS = "GET_IS_REPORTED_EXPIRED_DEALS";
export const GET_IS_REPORTED_EXPIRED_DEALS_SUCCESS = "GET_IS_REPORTED_EXPIRED_DEALS_SUCCESS";
export const getIsReportedExpiredDeals = () => ({
    type: GET_IS_REPORTED_EXPIRED_DEALS,
})

export const GET_IS_REPORTED_EXPIRED_DEALS_COUNT = "GET_IS_REPORTED_EXPIRED_DEALS_COUNT"
export const getIsReportedExpiredDealsCount = () => ({
    type: GET_IS_REPORTED_EXPIRED_DEALS_COUNT,
})

export const UPDATE_EXPIRED_DEAL = "UPDATE_EXPIRED_DEAL";
export const UPDATE_EXPIRED_DEAL_SUCCESS = "UPDATE_EXPIRED_DEAL_SUCCESS";
export const updateExpired = (status, dealId) => ({
    type: UPDATE_EXPIRED_DEAL,
    status,
    dealId,
})

export const IGNORED_DEAL = "IGNORED_DEAL";
export const IGNORED_DEAL_SUCCESS = "IGNORED_DEAL_SUCCESS";
export const ignoredDeal = (dealId) => ({
    type: IGNORED_DEAL,
    dealId,
})

export const OPEN_CONFIRM_MODAL_ON_DEAL = "OPEN_CONFIRM_MODAL_ON_DEAL";
export const openConfirmModalOnDeal = (status, dealId, actionType, dealType) => ({
    type: OPEN_CONFIRM_MODAL_ON_DEAL,
    status,
    dealId,
    actionType,
    dealType,
})

// reported comments
export const GET_REPORTED_COMMENTS = "GET_REPORTED_COMMENTS";
export const GET_REPORTED_COMMENTS_SUCCESS = "GET_REPORTED_COMMENTS_SUCCESS";
export const getReportedComments = () => ({
    type: GET_REPORTED_COMMENTS,
})

export const GET_REPORTED_COMMENTS_COUNT = "GET_REPORTED_COMMENTS_COUNT";
export const GET_REPORTED_COMMENTS_COUNT_SUCCESS = "GET_REPORTED_COMMENTS_COUNT_SUCCESS";
export const getReportedCommentsCount = () => ({
    type: GET_REPORTED_COMMENTS_COUNT,
})

export const UPDATE_REPORTED_COMMENT = "UPDATE_REPORTED_COMMENT";
export const UPDATE_REPORTED_COMMENT_SUCCESS = "UPDATE_REPORTED_COMMENT_SUCCESS";
export const updateReportedComment = (status, commentId, isOnly) => ({
    type: UPDATE_REPORTED_COMMENT,
    status,
    commentId,
    isOnly,
})

export const IGNORED_REPORTED_COMMENT = "IGNORED_REPORTED_COMMENT";
export const IGNORED_REPORTED_COMMENT_SUCCESS = "IGNORED_REPORTED_COMMENT_SUCCESS";
export const ignoreReportedComment = (commentId, isOnly) => ({
    type: IGNORED_REPORTED_COMMENT,
    commentId,
    isOnly
})

export const OPEN_CONFIRM_MODAL_ON_REPORTED_COMMENT = "OPEN_CONFIRM_MODAL_ON_REPORTED_COMMENT";
export const openConfirmModalOnReportedComment = (params) => ({
    type: OPEN_CONFIRM_MODAL_ON_REPORTED_COMMENT,
    params,
})


export const CHANGE_COMMENTS_FILTERS = "CHANGE_COMMENTS_FILTERS";
export const changeCommentsFilters = (params) => ({
    type: CHANGE_COMMENTS_FILTERS,
    ...params,
})

export const VIEW_DETAIL_USERS_REPORTING = "VIEW_DETAIL_USERS_REPORTING";
export const VIEW_DETAIL_USERS_REPORTING_SUCCESS = "VIEW_DETAIL_USERS_REPORTING_SUCCESS"
export const viewDetailUsersReporting = (params) => ({
    type: VIEW_DETAIL_USERS_REPORTING,
    params,
})

//users
export const START_ADD_USER = "START_ADD_USER";
export const STOP_ADD_USER = "STOP_ADD_USER";

export const startAddUser = () => ({
    type: START_ADD_USER
})

export const stopAddUser = () => ({
    type: STOP_ADD_USER
})

export const GET_USERS = "GET_USERS";
export const GET_USERS_SUCCESS = "GET_USERS_SUCCESS";

export const getUsers = (params) => ({
    type: GET_USERS,
    params,
})

export const GET_USERS_COUNT = "GET_USERS_COUNT";
export const GET_USERS_COUNT_SUCCESS = "GET_USERS_COUNT_SUCCESS";

export const getUsersCount = (params) => ({
    type: GET_USERS_COUNT,
    params,
})

export const BLOCK_USER = "BLOCK_USER";
export const BLOCK_USER_SUCCESS = "BLOCK_USER_SUCCESS";

export const blockUser = (id, isBlocking, reason) => ({
    type: BLOCK_USER,
    id,
    isBlocking,
    reason,
}) 

export const CREATE_USER_ACCOUNT = "CREATE_USER_ACCOUNT";
export const CREATE_USER_ACCOUNT_SUCCESS = "CREATE_USER_ACCOUNT_SUCCESS";

export const createUserAccount = (user) => ({
    type: CREATE_USER_ACCOUNT,
    user,
})

export const CHANGE_USERS_ROLE = "CHANGE_USERS_ROLE";
export const CHANGE_USERS_ROLE_SUCCESS = "CHANGE_USERS_ROLE_SUCCESS";

export const changeUsersRole = (userId, role, categories) => ({
    type: CHANGE_USERS_ROLE,
    userId,
    role,
    categories,
})

export const CHANGE_POINTED_DEAL_ID = "CHANGE_POINTED_DEAL_ID";
export const changePointedDealId = (id) => ({
    type: CHANGE_POINTED_DEAL_ID,
    id,
})

export const GET_FEEDBACK = "GET_FEEDBACK";
export const GET_FEEDBACK_SUCCESS = "GET_FEEDBACK_SUCCESS";

export const getFeedback = () => ({
    type: GET_FEEDBACK
})

export const MARK_FEEDBACK_AS_SOLVED = "MARK_FEEDBACK_AS_SOLVED";
export const MARK_FEEDBACK_AS_SOLVED_SUCCESS = "MARK_FEEDBACK_AS_SOLVED_SUCCESS";

export const markFeedbackAsSolved = (id) => ({
    type: MARK_FEEDBACK_AS_SOLVED,
    id
})