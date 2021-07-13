import axios from 'axios';
import { getCookieData } from '../utils/common';

export const addTokenToApiHeader = () => {
    axios.defaults.headers.common['dealbee-at'] = getCookieData("token");
    axios.defaults.headers.common['dealbee-rt'] = getCookieData("refresh-token");
}

export const signUpApi = (params) => axios.post('/api/dealbee/user/signup', params);

export const signInApi = (params) => axios.post('/api/dealbee/user/signin', params);

export const changePasswordApi = (params) => axios.put('/api/dealbee/user/password/change', params);
export const resetPasswordApi = (params) => axios.put('/api/dealbee/user/password/reset', params);

export const editInfoApi = (params) => axios.put('/api/dealbee/user/', params);

export const getCurrentUserApi = () => {
    addTokenToApiHeader();
    return axios.get('/api/dealbee/current_user');
}

export const getUserApi = (username) => axios.get(`/api/dealbee/user`, {params: {username}});

export const getActiveUsersApi = () => axios.get(`/api/dealbee/active_users`)

export const updateReputationScoreApi = (params) => axios.put(`/api/dealbee/user/reputation_score/update`, params);

export const updatefollowingDealsIdApi = (params) => axios.put(`/api/dealbee/user/following_deal/update`, params);

export const getMyNotificationsApi = (params) => axios.get(`/api/dealbee/user/notifications`, {params});
export const markNotiAsReadApi = (params) => axios.put(`/api/dealbee/user/notification/mark_as_read`, params);

export const followUserApi = (params) => axios.post(`/api/dealbee/user/follow`, params);
export const unFollowUserApi = (params) => axios.post(`/api/dealbee/user/unfollow`, params);

export const getFollowerByUsernameApi = (username) => axios.get(`/api/dealbee/user/follower`, {params: { username}});
export const getFollowingByUsernameApi = (username) => axios.get(`/api/dealbee/user/following`, {params: { username}});

export const getFollowerInfoByUsernameApi = (username) => axios.get(`/api/dealbee/user/follower/info`, {params: { username}});
export const getFollowingInfoByUsernameApi = (username) => axios.get(`/api/dealbee/user/following/info`, { params: { username } });

export const sendFeedbackApi = (params) => axios.post("/api/dealbee/user/feedback", params)