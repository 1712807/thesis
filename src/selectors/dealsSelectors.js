import { createSelector } from 'reselect';

const dealsSelector = (state) => state.deals;

export const selectedDealSelector = createSelector(
     dealsSelector,
     (deals) => deals.selectedDeal
)

export const selectedDealIdSelector = createSelector(
    dealsSelector,
    (deals) => deals.selectedDealId,
)

export const featuredDealsSelector = createSelector(
    dealsSelector,
    (deals) => deals.featuredDeals
)

export const hotDealsSelector = createSelector(
    dealsSelector,
    (deals) => deals.hotDeals
)

export const flashDealsSelector = createSelector(
    dealsSelector,
    (deals) => deals.flashDeals,
)

export const popularDealsSelector = createSelector(
    dealsSelector,
    (deals) => deals.popularDeals
)

export const recentDealsSelector = createSelector(
    dealsSelector,
    (deals) => deals.recentDeals
)

export const bestDealsSelector = createSelector(
    dealsSelector,
    (deals) => deals.bestDeals
)

export const dealsForUserSelector = createSelector(
    dealsSelector,
    (deals) => deals.dealsForUser
)

export const categoriesSelector = createSelector(
    dealsSelector,
    (deals) => deals.categories
)

export const currentCategorySelector = createSelector(
    dealsSelector,
    (deals) => deals.currentCategory
)
export const selectedDealLikesSelector = createSelector(
    dealsSelector,
    (deals) => deals.selectedDealLikes,
)

export const selectedDealDisLikesSelector = createSelector(
    dealsSelector,
    (deals) => deals.selectedDealDisLikes,
)

export const productInfoSelector = createSelector(
    dealsSelector,
    (deals) => deals.productInfo,
)

export const selectedDealCommentsSelector = createSelector(
    dealsSelector,
    (deals) => deals.selectedDealComments,
)

export const isShowingErrorMessageModalSelector = createSelector(
    dealsSelector,
    (deals) => deals.isShowingErrorMessageModal,
)

export const dealsBySearchKeySelector = createSelector(
    dealsSelector,
    (deals) => deals.dealsBySearchKey,
)

export const searchKeySelector = createSelector(
    dealsSelector,
    (deals) => deals.searchKey,
)

export const selectedDealReportedCommentsSelector = (commentId) => createSelector(
    dealsSelector,
    (deals) => deals.selectedDealReportedComments.filter((item) => item.comment_id === commentId),
)

export const replyCommentIdSelector = createSelector(
    dealsSelector,
    (deals) => deals.replyCommentId,
)

export const childrenCommentsSelector = (parentId) => createSelector(
    dealsSelector,
    (deals) => deals.childrenComments.filter((item) => item.parent_id === parentId),
)