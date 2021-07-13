import { createSelector } from 'reselect';

const usersSelector = (state) => state.users;

export const isEditingInfoSelector = createSelector(
    usersSelector,
    (users) => users.isEditingInfo
)

export const isChangingPasswordSelector = createSelector(
    usersSelector,
    (users) => users.isChangingPassword
)

export const activeMembersSelector = createSelector(
    usersSelector,
    (users) => users.activeMembers
)

export const currentUserSelector = createSelector(
    usersSelector,
    (users) => users.currentUser
)

export const accountValidationSelector = createSelector(
    usersSelector,
    (users) => users.accountValidation
)

export const displayingUserSelector = createSelector(
    usersSelector,
    (users) => users.displayingUser
)

export const usersRecentCommentsSelector = createSelector(
    usersSelector,
    (users) => users.targetUsersComments
)

export const usersDealsSelector = createSelector(
    usersSelector,
    (users) => users.targetUsersDeals
)

export const followingDealsIdSelector = createSelector(
    usersSelector,
    (users) => users.currentUser.followingDealsId,
)

export const followingDealsSelector = createSelector(
    usersSelector,
    (users) => users.followingDeals,
)

export const pendingDealsSelector = createSelector(
    usersSelector,
    (users) => users.pendingDeals,
)

export const currentDealsMenuTabSelector = createSelector(
    usersSelector,
    (users) => users.currentDealsMenuTab
)

export const isGettingCurrentUserSelector = createSelector(
    usersSelector,
    (users) => users.isGettingCurrentUser
)