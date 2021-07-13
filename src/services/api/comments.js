import axios from 'axios';

export const addNewCommentApi = (params) => axios.post(`/api/dealbee/comment`, params);
export const getCommentByDealIdApi = (params) => axios.get('/api/dealbee/comment/deal', params);
export const getChildrenCommentByCommentIdApi = (params) => axios.get(`/api/dealbee/comment/children`,params);
export const deleteCommentApi = (commentId) => axios.delete(`/api/dealbee/comment`, commentId);
export const editCommentApi = (params) => axios.put(`/api/dealbee/comment`, params);

export const getAllCommentsApi = () => axios.get(`/api/dealbee/comments`);

export const updateReportCommentApi = (params) => axios.put(`/api/dealbee/reported_comment`, params);

export const getCommentsByUsernameApi = (params) => axios.get(`/api/dealbee/comment/user`, {params})

export const addReportedCommentApi = (params) => axios.post(`/api/dealbee/reported_comment`, params);
export const getReportedCommentByDealIdApi = (params) => axios.get(`/api/dealbee/reported_comments/deal`, params);

export const updateFeaturedCommentStatusApi = (params) => axios.put(`/api/dealbee/featured_comment/update`, params);
export const getFeaturedCommentByDealIdApi = (params) => axios.get(`/api/dealbee/featured_comments`, params);