import { DEALS_PER_PAGE_OPTIONS } from "../../services/utils/constant";
import * as actions from "./action";

const defaultDealsFilters = {
    sortKey: "latest",
    viewed: "all",
    category: "all",
    limit: DEALS_PER_PAGE_OPTIONS[0],
    page: 1,
}

const defaultCommentsFilters = {
    sortKey: "oldest",
    limit: DEALS_PER_PAGE_OPTIONS[0],
    page: 1,
}

const defaultIsShowingUsersReporting = {
    status: false,
    dealId: '',
    commentId:'',
    reportContent: [],
}
const defaultIsShowingConfirmActionOnReportedCommentModal = {
    status: false,
    commentId: '',
    actionType: '',
    userId: '',
}

const initialState = {
    currentPage: 0,
    currentMenuTab: 0,
    currentDealList: [],
    allDealsLoaded: false,
    dealsCount: 0,
    userList: [],
    usersCount: 0,
    currentCommentList: [],
    commentsCount: 0,
    isLoadingData: false,
    dealsFilters: defaultDealsFilters,
    isShowingConfirmActionOnReportedCommentModal: defaultIsShowingConfirmActionOnReportedCommentModal,
    isShowingConfirmActionOnDealModal: {
        status: false,
        dealId: '',
        actionType: '', // approve or ignore
        dealType: '', // waiting or reject or approve or reported
    },
    isShowingUsersReporting: defaultIsShowingUsersReporting,
    pointedDealId: null,
    isLoadingUsersReported: false,
    isAddingNewUser: false,
    isLoading: false,
    feedback: {
        list: [],
        isLoading: false,
    },
    dealEdited: false,
}

export const adminReducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.GET_DEALS:
        case actions.GET_DEALS_COUNT:
        case actions.GET_REPORTED_DEALS:
        case actions.GET_REPORTED_COMMENTS:
        case actions.GET_USERS: 
        case actions.CREATE_USER_ACCOUNT:
        case actions.BLOCK_USER: 
        case actions.CHANGE_USERS_ROLE:
            return {
                ...state,
                isLoadingData: true,
            }

        case actions.CHANGE_PAGE: 
            return {
                ...state,
                currentPage: action.page,
                currentMenuTab: 0,
                dealsFilters: action.page === 3 ? defaultCommentsFilters : defaultDealsFilters,
                isShowingUsersReporting: defaultIsShowingUsersReporting,
            }
        case actions.CHANGE_MENU_TAB:
            return {
                ...state,
                currentMenuTab: action.tab,
                dealsFilters: action.tab === 3 ? {...defaultDealsFilters, sortKey: 'oldest'} : defaultDealsFilters,
                isLoadingData: true,
                isShowingUsersReporting: defaultIsShowingUsersReporting,
                currentDealList: [],
                dealsCount: -1,
            }
        case actions.GET_DEALS_COUNT_SUCCESS:
            return {
                ...state,
                dealsCount: action.count,
                allDealsLoaded: parseInt(action.count) === 0 ? true : false,
            }
        case actions.GET_DEALS_SUCCESS:
            return {
                ...state,
                currentDealList: action.deals,
                isLoadingData: false,
            }
        case actions.CHANGE_DEALS_FILTERS:
            const prevState = state.dealsFilters;
            const { status, viewed, page, limit, sortKey, category } = action;
            return {
                ...state,
                isLoadingData: true,
                dealsFilters: {
                    status: status || prevState.status,
                    viewed: viewed || prevState.viewed,
                    page: page || prevState.page,
                    limit: limit || prevState.limit,
                    sortKey: sortKey || prevState.sortKey,
                    category: category || prevState.category,
                },
                currentDealList: [],
                dealsCount: status || viewed || category ? -1 : state.dealsCount
            }
        case actions.REVIEW_DEAL_SUCCESS: 
            return {
                ...state,
                currentDealList: state.currentDealList.filter((item) => item.id !== action.id),
                dealsCount: state.dealsCount-1,
            }
        case actions.GET_USERS_REPORTED_DEAL:
            return {
                ...state,
                isLoadingUsersReported: true,
            }
        case actions.GET_USERS_REPORTED_DEAL_SUCCESS:
            return {
                ...state,
                currentDealList: state.currentDealList.map((item) => ({
                    ...item,
                    usersReported: item.id === action.dealId 
                        ? action.list 
                        : item.usersReported
                })),
                isLoadingUsersReported: false,
            }
        case actions.DELETE_REPORTS_ON_DEAL_SUCCESS: 
            return {
                ...state,
                currentDealList: state.currentDealList.filter((item) => item.id !== action.dealId)
            }
        case actions.UPDATE_EXPIRED_DEAL_SUCCESS:
            return {
                ...state,
                currentDealList: state.currentDealList.filter((item) => item.id !== action.dealId)
            }
        case actions.IGNORED_DEAL_SUCCESS:
            return {
                ...state,
                currentDealList: state.currentDealList.filter((item) => item.id !== action.dealId)
            }
        case actions.GET_REPORTED_COMMENTS_SUCCESS:
            return {
                ...state,
                currentCommentList: action.comments,
                isLoadingData: false,
            }
        case actions.GET_REPORTED_COMMENTS_COUNT_SUCCESS: 
            return {
                ...state,
                commentsCount: action.count,
            }
        case actions.UPDATE_REPORTED_COMMENT_SUCCESS: 
            return {
                ...state,
                currentCommentList: state.currentCommentList.filter((item) => item.id !== action.commentId)
            }
        case actions.IGNORED_REPORTED_COMMENT_SUCCESS:
            return {
                ...state,
                currentCommentList: state.currentCommentList.filter((item) => item.id !== action.commentId)
            }
        case actions.CHANGE_COMMENTS_FILTERS:
            const prevCommentState = state.dealsFilters;
            return {
                ...state,
                isLoadingData: true,
                dealsFilters: {
                    page: action.page || prevCommentState.page,
                    limit: action.limit || prevCommentState.limit,
                    sortKey: action.sortKey || prevCommentState.sortKey,
                }
            }
        case actions.EDIT_DEAL: 
            return {
                ...state,
                dealEdited: false,
            }
        case actions.EDIT_DEAL_SUCCESS:
            return {
                ...state,
                dealEdited: true,
            }
        case actions.EDIT_DEAL_FAIL:
            return {
                ...state,
                dealEdited: null,
            }

        //user
        case actions.START_ADD_USER:
            return {
                ...state,
                isAddingNewUser: true,
            }
        case actions.STOP_ADD_USER: 
            return {
                ...state,
                isAddingNewUser: false,
            }
        case actions.CREATE_USER_ACCOUNT_SUCCESS: 
            return {
                ...state,
                isLoadingData: false,
                isAddingNewUser: false,
                userList: [action.newUser, ...state.userList],
            }
        case actions.GET_USERS_SUCCESS: 
            return {
                ...state,
                userList: action.userList.map((user) => ({
                    ...user,
                    joinedAt: user.created_at,
                })),
                isLoadingData: false,
            }
        case actions.GET_USERS_COUNT_SUCCESS:
            return {
                ...state,
                usersCount: action.count,
            }
        case actions.BLOCK_USER_SUCCESS:
            return {
                ...state,
                userList: state.userList.map((item) => ({
                    ...item,
                    status: item.id === action.id 
                        ? action.isBlocked 
                            ? "blocked" 
                            : "active" 
                        : item.status,
                    blockedReason: action.reason,
                })),
                isLoadingData: false,
            }
        case actions.CHANGE_USERS_ROLE_SUCCESS: 
            return {
                ...state, 
                isLoadingData: false,
                userList: state.userList.map((item) => ({
                    ...item, 
                    role: item.id === action.userId ? action.role : item.role,
                    editorsCategories: item.id === action.userId ? action.categories : item.editorsCategories
                }))
            }
        case actions.OPEN_CONFIRM_MODAL_ON_REPORTED_COMMENT:{
            return {
                ...state,
                isShowingConfirmActionOnReportedCommentModal: action.params,
            }
        }
        case actions.OPEN_CONFIRM_MODAL_ON_DEAL:{
            return {
                ...state,
                isShowingConfirmActionOnDealModal: {
                    ...state.isShowingConfirmActionOnDealModal,
                    status: action.status,
                    dealId: action.dealId,
                    actionType: action.actionType,
                    dealType: action.dealType,
                }
            }
        }
        case actions.VIEW_DETAIL_USERS_REPORTING: {
            return {
                ...state,
                isLoading: true,
                isShowingUsersReporting: action.params,
            }
        }
        case actions.VIEW_DETAIL_USERS_REPORTING_SUCCESS: {
            return {
                ...state,
                isLoading: false,
                isShowingUsersReporting: {
                    ...state.isShowingUsersReporting,
                    reportContent: action.content,
                }
            }
        }
        case actions.CHANGE_POINTED_DEAL_ID: {
            return {
                ...state,
                pointedDealId: action.id
            }
        }
        case actions.GET_FEEDBACK:
        case actions.MARK_FEEDBACK_AS_SOLVED:
            return {
                ...state,
                feedback: {
                    ...state.feedback,
                    isLoading: true,
                }
            }
        case actions.GET_FEEDBACK_SUCCESS:
            return {
                ...state,
                feedback: {
                    list: action.list.map((item) => ({...item, solved: item.solved_by ? true : false})),
                    isLoading: false,
                },
            }
        case actions.MARK_FEEDBACK_AS_SOLVED_SUCCESS:
            return {
                ...state,
                feedback: {
                    list: state.feedback.list.map((item) => ({...item, solved: item.id === action.id ? true : item.solved})),
                    isLoading: false
                }
            }
        default:
            return state;
    }
}

export default adminReducer;