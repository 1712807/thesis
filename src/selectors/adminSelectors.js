import { createSelector } from 'reselect';

const adminSelector = (state) => state.admin;

export const currentPageSelector = createSelector(
    adminSelector,
    (admin) => admin.currentPage
)

export const currentMenuTabSelector = createSelector(
    adminSelector,
    (admin) => admin.currentMenuTab
)

export const currentDealListSelector = createSelector(
    adminSelector,
    (admin) => admin.currentDealList
)

export const currentCommentListSelector = createSelector(
    adminSelector,
    (admin) => admin.currentCommentList,
)

export const dealsCountSelector = createSelector(
    adminSelector,
    (admin) => admin.dealsCount
)

export const commentsCountSelector = createSelector(
    adminSelector,
    (admin) => admin.commentsCount
)

export const isShowingConfirmActionOnReportedCommentModalSelector = createSelector(
    adminSelector,
    (admin) => admin.isShowingConfirmActionOnReportedCommentModal,
)

export const isShowingConfirmActionOnDealModalSelector = createSelector(
    adminSelector,
    (admin) => admin.isShowingConfirmActionOnDealModal,
)

export const isLoadingDataSelector = createSelector(
    adminSelector,
    (admin) => admin.isLoadingData
)

export const isShowingUsersReportingSelector = createSelector(
    adminSelector,
    (admin) => admin.isShowingUsersReporting,
)

export const pointedDealIdSelector = createSelector(
    adminSelector,
    (admin) => admin.pointedDealId
)

//user
export const userListSelector = createSelector(
    adminSelector,
    (admin) => admin.userList
)