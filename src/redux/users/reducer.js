import { DEALBEE_PATHS, FOLLOWING_DEALS_PER_PAGE, MY_NOTIFICATIONS_PER_PAGE, PENDING_DEALS_PER_PAGE, RECENT_COMMENTS_PER_PAGE, USERS_DEALS_PER_PAGE } from '../../services/utils/constant';
import * as actions from './action';
import * as dealActions from "../deals/action";
import * as adminActions from "../admin/action";
import { getCookieData, hasEditorPermission, hasModeratorPermission } from '../../services/utils/common';
import { addTokenToApiHeader } from '../../services/api/users';

const emptyList = {
    list: [],
    currentPage: 1,
    isLoading: false,
}

const initialState = { 
    isGettingCurrentUser: true,
    isShowingRegisterPage: false,
    isEditingInfo: false,
    isChangingPassword: false,
    activeMembers: [],
    currentUser: {},
    accountValidation: "valid",
    resetRequestState: "valid",
    isSigning: false,
    displayingUser: {isLoading: true},
    targetUsersComments: emptyList,
    targetUsersDeals: emptyList,
    followingDeals: emptyList,
    pendingDeals: emptyList,
    currentDealsMenuTab: 0,
    notifications: {
        updated: false,
        list: [],
        newNotiCount: 0,
        allNotiLoaded: false,
        isLoading: false,
    },
    isChangeAvatar: false,

    followingUserIds: [],
    followerUserIds: [],
    followInfoList: [],
    feedbackSent: false,
    pendingDealEdited: false,
};

const saveTokens = (accessToken, refreshToken) => {
    document.cookie = `token=${accessToken}; path=/`;
    document.cookie = `token=${accessToken}; path=${DEALBEE_PATHS.userProfile}`;
    document.cookie = `token=${accessToken}; path=${DEALBEE_PATHS.deal}`;
    document.cookie = `refresh-token=${refreshToken}; path=/`;
    document.cookie = `refresh-token=${refreshToken}; path=${DEALBEE_PATHS.userProfile}`;
    document.cookie = `refresh-token=${refreshToken}; path=${DEALBEE_PATHS.deal}`;
    addTokenToApiHeader();
}

export const usersReducer = (state = initialState, action) => {
    switch(action.type) {
        case actions.RESET_VALIDATION: 
            return {
                ...state,
                accountValidation: "valid",
                resetRequestState: "valid",
            }
        case actions.START_EDITING_PROFILE: 
            return {
                ...state,
                isEditingInfo: true,
                accountValidation: "valid",
                isSigning: false,
            }
        case actions.STOP_EDITING_PROFILE: 
            return {
                ...state,
                isEditingInfo: false,
            }
        case actions.EDIT_INFO: 
            return {
                ...state,
                isChangeAvatar: action.isChangeAvatar,
                isSigning: true,
            }
        case actions.EDIT_INFO_SUCCESS:
            return {
                ...state,
                currentUser: {
                    ...state.currentUser,
                    info: action.newInfo,
                    followingCategories: action.followingCategories,
                    email: action.email,
                    emailNotifications: action.emailNotifications,
                },
                displayingUser: {
                    ...state.displayingUser,
                    info: action.newInfo,
                    followingCategories: action.followingCategories
                },
                isChangeAvatar: false,
            }
        case actions.START_CHANGING_PASSWORD:
            return {
                ...state,
                isChangingPassword: true,
                accountValidation: "valid",
            }
        case actions.STOP_CHANGING_PASSWORD:
            return {
                ...state,
                isChangingPassword: false,
            }
        case actions.CHANGE_PASSWORD: 
            return {
                ...state,
                accountValidation: "processing",
            }
        case actions.CHANGE_PASSWORD_SUCCESS:
            return {
                ...state,
                isChangingPassword: false,
            }
        case actions.CHANGE_PASSWORD_FAIL: 
            return {
                ...state,
                accountValidation: action.message
            }
        case actions.RESET_PASSWORD:
            return {
                ...state,
                resetRequestState: "reseting",
            }
        case actions.RESET_PASSWORD_FAIL:
            return {
                ...state,
                resetRequestState: action.message
            }
        case actions.RESET_PASSWORD_SUCCESS:
            return {
                ...state,
                resetRequestState: "success"
            }
        case actions.GET_CURRENT_USER_PROFILE:
            return {
                ...state,
                isGettingCurrentUser: true,
            }
        case actions.GET_CURRENT_USER_PROFILE_SUCCESS: {
            const { newTokens: {accessToken, refreshToken} } = action;
            saveTokens(accessToken, refreshToken);
            return {
                ...state, 
                currentUser: action.userInfo,
                isGettingCurrentUser: false,
            }
        }
        case actions.GET_USER_PROFILE_SUCCESS:
            return {
                ...state,
                displayingUser: {
                    ...action.userInfo,
                    isLoading: false,
                },
                followerUserIds: action.followerUserIds,
                followingUserIds: action.followingUserIds,
                isLoadingProfile: false,
            }
        case actions.GET_COMMENTS_BY_USERNAME:
            return {
                ...state,
                targetUsersComments: {
                    ...state.targetUsersComments,
                    isLoading: true,
                }
            }
        case actions.GET_COMMENTS_BY_USERNAME_SUCCESS:
            return {
                ...state,
                targetUsersComments: {
                    isLoading: false,
                    list: [...state.targetUsersComments.list, ...action.list],
                    currentPage: action.list.length < RECENT_COMMENTS_PER_PAGE
                        ? -1 
                        : state.targetUsersComments.currentPage + 1
                }
            }

            
        case actions.CHANGE_MY_DEALS_MENU_TAB:
            return {
                ...state,
                currentDealsMenuTab: action.tab,
                targetUsersDeals: emptyList,
                followingDeals: emptyList,
                pendingDeals: emptyList,
            }

        case actions.GET_DEALS_BY_USER:
            return {
                ...state,
                targetUsersDeals: {
                    ...state.targetUsersDeals,
                    isLoading: true,
                }
            }
        case actions.GET_DEALS_BY_USER_SUCCESS:
            return {
                ...state,
                targetUsersDeals: {
                    isLoading: false,
                    list: [...state.targetUsersDeals.list, ...action.list],
                    currentPage: action.list.length < USERS_DEALS_PER_PAGE
                        ? -1 
                        : state.targetUsersDeals.currentPage + 1
                }
            }

        case actions.GET_PENDING_DEALS:
            return {
                ...state,
                pendingDeals: {
                    ...state.pendingDeals,
                    isLoading: true,
                }
            }
        case actions.GET_PENDING_DEALS_SUCCESS:
            return {
                ...state,
                pendingDeals: {
                    isLoading: false,
                    list: [...state.pendingDeals.list, ...action.list],
                    currentPage: action.list.length < PENDING_DEALS_PER_PAGE 
                        ? -1
                        : state.pendingDeals.currentPage + 1
                }
            }

        case actions.GET_FOLLOWING_DEALS_BY_USER:
            return {
                ...state,
                followingDeals: {
                    ...state.followingDeals,
                    isLoading: true,
                }
            }
        case actions.GET_FOLLOWING_DEALS_BY_USER_SUCCESS: 
            return {
                ...state,
                followingDeals: {
                    isLoading: false,
                    list: [...state.followingDeals.list, ...action.list],
                    currentPage: action.list.length < FOLLOWING_DEALS_PER_PAGE
                        ? -1
                        : state.followingDeals.currentPage + 1
                },
            }

        case actions.UPDATE_DEAL_ID_IN_FOLLOWING_DEALS_SUCCESS: 
            return {
                ...state,
                currentUser: {...state.currentUser, followingDealsId: action.newFollowingDealsId}
            }
        case actions.UPDATE_DEAL_IN_FOLLOWING_DEALS_SUCCESS:
            return {
                ...state,
                followingDeals: {
                    ...state.followingDeals,
                    list: state.followingDeals.list.filter((i) => i.id !== action.dealId)
                    /* currentPage: 0,
                    list: action.newList, */
                }          
            }

        case dealActions.EDIT_PENDING_DEAL:
            return {
                ...state,
                pendingDealEdited: false,
            }
        case dealActions.EDIT_PENDING_DEAL_FAIL:
            return {
                ...state,
                pendingDealEdited: null,
            }
        case dealActions.EDIT_PENDING_DEAL_SUCCESS:
            return {
                ...state,
                pendingDeals: {
                    ...state.pendingDeals,
                    list: state.pendingDeals.list.map((item) => (item.id === action.deal.id ? action.deal : item))
                },
                pendingDealEdited: true,
            }
        case dealActions.DELETE_PENDING_DEAL_SUCCESS:
            return {
                ...state,
                pendingDeals: {
                    ...state.pendingDeals,
                    list: state.pendingDeals.list.filter((item) => item.id !== action.dealId)
                }
            }

        case adminActions.START_ADD_USER: 
            return {
                ...state,
                accountValidation: "valid",
            }
        case actions.LOG_IN: 
        case actions.SIGN_UP:
            return {
                ...state,
                isSigning: true,
            }
        case actions.LOG_IN_SUCCESS: {
            const {user, token, refreshToken, afterSignUp} = action;
            const prevUrl = getCookieData("prevUrl");
            const origin = window.location.origin;

            const newPage = afterSignUp 
                ? `${DEALBEE_PATHS.userProfile}/${user.username}`
                : (hasEditorPermission(user.role) || hasModeratorPermission(user.role)) 
                    ? prevUrl.slice(0, prevUrl.length - 1) === origin
                        ? `${origin}${DEALBEE_PATHS.admin}`
                        : prevUrl
                    : prevUrl

            window.location.href = newPage;
            saveTokens(token, refreshToken);

            return {
                ...state,
                currentUser: user,
                // isSigning: false,
            }
        }
        case actions.SIGN_UP_FAIL: 
        case actions.LOG_IN_FAIL:
        case actions.EDIT_INFO_FAIL:
            return {
                ...state,
                accountValidation: action.message,
                isSigning: false,
            }
        case actions.CLEAR_COOKIES: {
            saveTokens("undefined", "undefined");
            return {
                ...state,
                currentUser: {}
            }
        }
        case actions.GET_ACTIVE_MEMBERS_SUCCESS: 
            return {
                ...state,
                activeMembers: action.members,
            }
        case actions.GET_MY_NOTIFICATIONS:
            return {
                ...state,
                notifications: {
                    ...state.notifications,
                    isLoading: true,
                }
            }
        case actions.GET_MY_NOTIFICATIONS_SUCCESS:
            return {
                ...state,
                notifications: {
                    isLoading: false,
                    updated: action.isOpening ? true : false,
                    list: action.isOpening ? [...state.notifications.list, ...action.list] : [],
                    newNotiCount: action.isOpening 
                        ? 0 
                        : action.list.filter((item) => !item.is_displayed).length,
                    allNotiLoaded: action.list.length < MY_NOTIFICATIONS_PER_PAGE ? true : false,
                }
            }
        case actions.UPDATE_NEW_NOTI_SUCCESS: 
            return {
                ...state,
                notifications: {
                    ...state.notifications,
                    updated: false,
                }
            }
        case actions.MARK_ALL_NOTI_AS_READ: 
            return {
                ...state,
                notifications: {
                    ...state.notifications,
                    updated: true,
                    list: state.notifications.list.map((item) => ({
                        ...item,
                        is_read: true,
                    })),
                    newNotiCount: 0,
                }
            }

        case adminActions.CHANGE_USERS_ROLE_SUCCESS:
            return {
                ...state,
                displayingUser: {
                    ...state.displayingUser,
                    role: state.displayingUser && state.displayingUser.id === action.userId ? action.role : state.displayingUser.role
                }
            }
        case actions.GET_FOLLOW_INFO_BY_USER_ID_SUCCESS:
            return {
                ...state,
                followInfoList: action.data,
            }
        case actions.UPDATE_FOLLOW_USER_SUCCESS: {
            const displayingUserId = state.displayingUser.id;
            return {
                ...state,
                followerUserIds: displayingUserId === action.followedUserId && (
                    action.status ? [...state.followerUserIds, {followed_by_user_id: action.followedByUserId}]
                    : state.followerUserIds.filter((item) => item.followed_by_user_id !== action.followedByUserId)
                ),
            }
        }
        case actions.GET_FOLLOWER_BY_USER_ID_SUCCESS: {
            return {
                ...state,
                followerUserIds: action.followerUserIds,
            }
        }
            
        case actions.SEND_FEEDBACK_SUCCESS:
            return {
                ...state,
                feedbackSent: true
            }
        case actions.UPDATE_USER_POINT:
            return {
                ...state,
                currentUser: {
                    ...state.currentUser,
                    point: action.newPoint
                }
            }
        default: return state;
    }
}

export default usersReducer;