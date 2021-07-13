import axios from 'axios';

export const getCategoriesApi = () => axios.get('/api/dealbee/categories');
export const addCategoryApi = (params) => axios.post("/api/dealbee/category", params);

export const createDealApi = (params) => axios.post('/api/dealbee/deal', params);
export const deletePendingDealApi = (params) => axios.delete(`/api/dealbee/pending_deal`, {params});
export const editPendingDealApi = (params) => axios.put(`/api/dealbee/pending_deal`, params); 

export const addDealReactionsApi = (params) => axios.post('/api/dealbee/deal/deal_reactions', params);
export const deleteDealReactionsApi = (params) => axios.delete('/api/dealbee/deal/deal_reactions', params);
export const getDealReactionsByDealApi = (params) => axios.get('/api/dealbee/deal/deal_reactions', params);
export const updateDealReactionsApi = (params) => axios.put(`/api/dealbee/deal/deal_reactions`, params);

export const crawlDataFromShopeeApi = (idProduct, idShop) => axios.get(`https://shopee.vn/api/v2/item/get?itemid=${idProduct}&shopid=${idShop}`);
export const crawlDataFromTikiApi = (idProduct) =>axios.get(`https://tiki.vn/api/v2/products/${idProduct}`);

export const getFeaturedDealsApi = (params) => axios.get(`/api/dealbee/featured_deals`, {params});
export const getHotDealsApi = (params) => axios.get(`/api/dealbee/hot_deals`, {params});
export const getFlashDealsApi = (params) => axios.get(`/api/dealbee/flash_deals`, {params});
export const getPopularDealsApi = (params) => axios.get(`/api/dealbee/popular_deals`, {params});
export const getRecentDealsApi = (params) => axios.get(`/api/dealbee/recent_deals`, {params});
export const getBestDealsApi = (params) => axios.get(`/api/dealbee/best_deals`, {params});
export const getDealsForUserApi = (params) => axios.get(`/api/dealbee/deals/for_you`, { params });

export const getDealByDealIdApi = (params) => axios.get(`/api/dealbee/deal/id`, params);
export const getDealByDealIdAndSlugApi = (params) => axios.get(`/api/dealbee/deal`, params);

export const getDealBySearchKeyApi = (params) => axios.get(`/api/dealbee/deals/key`, params);

export const updateViewsOnDealApi = (params) => axios.put(`/api/dealbee/deals/deal/views`, params);

export const updateIsReportedExpiredDealApi = (params) => axios.put(`/api/dealbee/deals/reported_deal/update`, params);

export const getDealsByUserApi = (params) => axios.get(`/api/dealbee/deals/user`, {params})
export const getPendingDealsApi = (params) => axios.get(`/api/dealbee/pending_deals`, {params})

export const reportDealApi = (params) => axios.post("/api/dealbee/reported_deal", params);
export const unReportDealApi = (params) => axios.delete("/api/dealbee/reported_deal", {params});

export const getFollowingDealByUserNameApi = (params) => axios.get(`/api/dealbee/following_deals`, {params});
