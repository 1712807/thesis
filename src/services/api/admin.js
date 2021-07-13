import axios from 'axios';

export const getDealsCountApi = (params) => axios.get(`/api/dealbee/admin/deals/count`, {params});
export const getDealsApi = (params) => axios.get(`/api/dealbee/admin/deals`, {params});

export const getReportedDealsCountApi = (params) => axios.get("/api/dealbee/admin/reported_deals/count", {params});
export const getReportedDealsApi = (params) => axios.get("/api/dealbee/admin/reported_deals", {params});
export const getReportedDealApi = (params) => axios.get("/api/dealbee/admin/reported_deal", {params});
export const getUsersReportedDealApi = (params) => axios.get("/api/dealbee/admin/reported_deal/users", {params});
export const deleteReportsOnDealApi = (params) => axios.delete("/api/dealbee/admin/reported_deal", {params})

export const reviewDealApi = (params) => axios.put("/api/dealbee/admin/deal/review", params);
export const editDealApi = (params) => axios.put("/api/dealbee/admin/deal/edit", params);
export const markDealAsViewedApi = (params) => axios.post("/api/dealbee/admin/deal/viewed", params);

export const markDealAsFeaturedApi = (params) => axios.put("/api/dealbee/admin/deal/featured_mark", params);
export const updateEditorsNoteApi = (params) => axios.put("/api/dealbee/admin/deal/editors_note", params);
export const deleteEditorsNoteApi = (params) => axios.delete(`/api/dealbee/admin/deal/editors_note`, {params});

export const getIsReportedExpiredDealsApi = (params) => axios.get(`/api/dealbee/admin/deal/reported_expired`, {params});
export const getIsReportedExpiredDealsCountApi = (category) => axios.get(`/api/dealbee/admin/deal/reported_expired/count`, {params: {category}});
export const updateExpiredDealsApi = (params) => axios.put(`/api/dealbee/admin/expired_deal_update`, params);
export const ignoreReportedDealApi = (params) => axios.put('/api/dealbee/admin/reported_deal/ignore', params);

export const getReportedCommentsApi = (params) => axios.get(`/api/dealbee/admin/reported_comments`, {params});
export const deletedMarkedCommentApi = (params) => axios.put(`/api/dealbee/admin/reported_comment/mark_deleted`, params);
export const ignoreReportedCommentApi = (params) => axios.put('/api/dealbee/admin/reported_comment/ignore', params);
export const getReportedCommentsCountApi = () => axios.get("/api/dealbee/admin/reported_comments/count");
export const getReportedCommentByCommentIdApi = (params) => axios.get(`/api/dealbee/admin/reported_comments/comment_id`, params);
export const deleteReportedCommentApi = (params) => axios.delete(`/api/dealbee/admin/reported_comment`, params);
export const getReportedCommentByUserIdApi = (userId) => axios.get(`/api/dealbee/admin/reported_comments/count_by_user_id`, {params: {userId}});
export const getReportedComment = (commentId) => axios.get(`/api/dealbee/admin/reported_comment/${commentId}`);

//users api
export const getUsersApi = () => axios.get(`/api/dealbee/admin/users`);
export const getUsersCountApi = () => axios.get(`/api/dealbee/admin/users/count`);
export const blockUserApi = (params) => axios.put(`/api/dealbee/admin/users/block`, params);
export const createUserApi = (params) => axios.post("/api/dealbee/admin/user", params);
export const changeUsersRoleApi = (params) => axios.put('/api/dealbee/admin/user/role', params);
export const getFeedbackApi = () => axios.get("/api/dealbee/admin/feedbacks");
export const markFeedbackAsSolvedApi = (id) => axios.put("/api/dealbee/admin/feedback/solve", {id});