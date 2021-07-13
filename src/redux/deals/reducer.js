import { CATEGORIES_COLORS, DEALS_FOR_USER_PER_PAGE, DEAL_COMMENTS_PER_PAGE, FEATURED_DEALS_PER_PAGE, HOT_DEALS_MAX, HOT_DEALS_PER_PAGE, POPULAR_DEALS_MAX, POPULAR_DEALS_PER_PAGE, RECENT_DEALS_PER_PAGE, SEARCH_KEY_DEALS_PER_PAGE } from '../../services/utils/constant';
import * as actions from './action';
import * as adminActions from "../admin/action"
import { getLinkToDeal, getLinkToProfile } from '../../services/utils/common';

const emptyDealList = {
    list: [],
    offset: 0,
    isLoading: false,
}

const emptyDeal = { 
    id: null,
    info: {
        title: '',
        link: '',
        price: '',
        discount: '',
        detail: '',
        imageUrl: '',
        category: '',
    },
    interaction: {
        views: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
    }
}

const initialState = {
    categories: [],
    isShowingErrorMessageModal: false,
    isShowingDetail: false,
    searchKey: false,

    featuredDeals: emptyDealList,
    hotDeals: emptyDealList,
    flashDeals: emptyDealList,
    popularDeals: emptyDealList,
    recentDeals: emptyDealList,
    bestDeals: emptyDealList,
    dealsForUser: emptyDealList,

    isLoadingSelectedDeal: true,
    selectedDealId: null,
    selectedDeal: emptyDeal,
    currentCategory: "all",
    selectedDealLikes: [],
    selectedDealComments: [],
    isLoadingComments: false,
    allCommentsLoaded: false,
    selectedDealDisLikes: [],
    productInfo: {},
    dealsBySearchKey: [],
    isLoadingDealsBySearchKey: false,
    allDealsBySearchKeyLoaded: false,
    isShowingReportCommentModal: false,
    selectedDealReportedComments: [],
    replyCommentId: null,
    childrenComments: [],
    isLoadingChildrenComments: null,

    featuredComments: [],
 };

export const dealsReducer = (state = initialState, action) => {
    switch(action.type) {
        case actions.GET_CATEGORIES_SUCCESS: 
            return {
                ...state,
                categories: [
                    { value: "all", label: "Tất cả" },
                    ...action.data.map((item, index) => ({ ...item, color: CATEGORIES_COLORS[index] })),
                    {value: "others", label: "Ngành hàng khác"}
                ],
            }
        case actions.ADD_CATEGORY_SUCCESS:
            const newCategories = state.categories.slice(0, state.categories.length - 1)
            return {
                ...state,
                categories: [...newCategories, action.newCategory, {value: "others", label: "Ngành hàng khác"}]
            }
        case actions.OPEN_ERROR_MESSAGE_MODAL: 
            return {
                ...state,
                isShowingErrorMessageModal: action.status,
            }
        case actions.SEARCH_DEAL:
            return {
                ...state,
                isLoadingDealsBySearchKey: true,
            }
        case actions.SEARCH_DEAL_SUCCESS:
            return {
                ...state,
                dealsBySearchKey: [...state.dealsBySearchKey, ...action.deals],
                searchKey: true,
                isLoadingDealsBySearchKey: false,
                allDealsBySearchKeyLoaded: action.deals.length < SEARCH_KEY_DEALS_PER_PAGE ? true : false,
            }
        case actions.UPDATE_SEARCH_KEY: {
            return {
                ...state,
                searchKey: action.searchKey,
            }
        }
        case actions.CREATE_DEAL_SUCCESS:
            if (action.status === "waiting")
                window.location.href = `${getLinkToProfile(action.username)}?location=pending_deals`;
            else window.location.href = getLinkToDeal(action.newDeal.id, action.newDeal.info.title)
            return state;
        case actions.SET_SELECTED_DEAL:
            return {
                ...state,
                selectedDealId: action.id,
            }
        case actions.CHANGE_CATEGORY: 
            return {
                ...state,
                currentCategory: action.newCate,    
                featuredDeals: emptyDealList,
                hotDeals: emptyDealList,
                flashDeals: emptyDealList,
                popularDeals: emptyDealList,
                recentDeals: emptyDealList,
                bestDeals: emptyDealList,
            
            }
        case actions.ADD_LIKE_SUCCUESS:
            return {
                ...state,
                selectedDealLikes: [...state.selectedDealLikes, action.data],
            }
        case actions.DELETE_LIKE_SUCCUESS:
            return {
                ...state,
                selectedDealLikes: state.selectedDealLikes.filter((item) => item.user_id !== action.likeUserId),
            }
        case actions.GET_LIKE_BY_DEAL_ID_SUCCESS:
            return {
                ...state,
                selectedDealLikes: action.data,
            }
        case actions.CRAWL_DATA_FROM_TIKI_SUCCESS: 
            return {
                ...state,
                productInfo: action.productInfo,
            }
        case actions.ADD_NEW_COMMENT_SUCCESS: {
            const newCommentsCount = parseInt(state.selectedDeal.comments_count) + 1
            return {
                ...state,
                selectedDealComments: action.parentId
                ? state.selectedDealComments.map((item) => item.id === action.parentId
                    ? {...item, number_of_children: parseInt(item.number_of_children) + 1}: item
                )
                : [action.newComment, ...state.selectedDealComments],
                selectedDeal: {
                    ...state.selectedDeal,
                    comments_count: newCommentsCount,
                },
                childrenComments: action.parentId ? [action.newComment, ...state.childrenComments] : state.childrenComments,
            }
        }
        case actions.GET_COMMENT_BY_DEAL_ID:
            return {
                ...state,
                isLoadingComments: true,
            }
        case actions.GET_COMMENT_BY_DEAL_ID_SUCCESS:
            return {
                ...state,
                selectedDealComments: [...state.selectedDealComments, ...action.data],
                isLoadingComments: false,
                allCommentsLoaded: action.data.length < DEAL_COMMENTS_PER_PAGE ? true : false,
            }
        case actions.GET_CHILDREN_COMMENT_BY_COMMENT_ID: 
            return {
                ...state,
                isLoadingChildrenComments: action.commentId,
            }
        case actions.GET_CHILDREN_COMMENT_BY_COMMENT_ID_SUCCESS:
            return {
                ...state,
                childrenComments: [...state.childrenComments, ...action.data],
                isLoadingChildrenComments: null,
            }
        case actions.GET_REPORTED_COMMENT_BY_DEAL_ID_SUCCESS: 
            return {
                ...state,
                selectedDealReportedComments: action.reportedComments,
            }
        case actions.DELETE_COMMENT_SUCCESS: {
            const newCommentsCount = state.selectedDeal.comments_count - action.numberOfDeletedMarkedComments;
            return {
                ...state,
                selectedDealComments: action.parentId === null
                                    ? state.selectedDealComments.filter((item) => item.id !== action.commentId)
                                    : state.selectedDealComments.map((item) => item.id === action.parentId 
                                            ? {...item, number_of_children: parseInt(item.number_of_children) - 1 }: item),
                selectedDeal: {
                    ...state.selectedDeal,
                    comments_count: newCommentsCount,
                },
                childrenComments: action.parentId !== null ? state.childrenComments.filter((item) => 
                               item.id !== action.commentId) : state.childrenComments,
                featuredComments: state.featuredComments.filter((item) => item.id !== action.commentId)
            }
        }
        case actions.EDIT_COMMENT_SUCCESS: {
            return {
                ...state,
                selectedDealComments: state.selectedDealComments.map((item) => item.id === action.commentId
                ? {...item, content: action.newComment, updated_at: action.updatedAt} : item),
                childrenComments: state.childrenComments.map((item) => item.id === action.commentId
                ? {...item, content: action.newComment, updated_at: action.updatedAt} : item),
            }
        }

        case actions.GET_FEATURED_DEALS: 
            return {
                ...state,
                featuredDeals: {
                    ...state.featuredDeals,
                    isLoading: true,
                }
            }
        case actions.GET_FEATURED_DEALS_SUCCESS:
            return {
                ...state,
                featuredDeals: {
                    isLoading: false,
                    list: [...state.featuredDeals.list, ...action.list],
                    offset: action.list.length < FEATURED_DEALS_PER_PAGE 
                        ? -1
                        : state.featuredDeals.offset + FEATURED_DEALS_PER_PAGE
                },
            }

        case actions.GET_HOT_DEALS:
            return {
                ...state,
                hotDeals: {
                    ...state.hotDeals,
                    isLoading: true,
                }
            }
        case actions.GET_HOT_DEALS_SUCCESS: {
            const newList = [...state.hotDeals.list, ...action.list];
            return {
                ...state,
                hotDeals: {
                    isLoading: false,
                    list: newList,
                    offset: action.list.length < HOT_DEALS_PER_PAGE || newList.length >= HOT_DEALS_MAX
                        ? -1
                        : newList.length
                },
            }
        }

        case actions.GET_FLASH_DEALS:
            return {
                ...state,
                flashDeals: {
                    ...state.flashDeals,
                    isLoading: true,
                }
            }
        case actions.GET_FLASH_DEALS_SUCCESS:
            return {
                ...state,
                flashDeals: {
                    list: action.list,
                    isLoading: false,
                },
            }
        
        case actions.GET_POPULAR_DEALS:
            return {
                ...state,
                popularDeals: {
                    ...state.popularDeals,
                    isLoading: true,
                }
            }
        case actions.GET_POPULAR_DEALS_SUCCESS: {
            const newList = [...state.popularDeals.list, ...action.list];
            return {
                ...state,
                popularDeals: {
                    isLoading: false,
                    list: newList,
                    offset: action.list.length < POPULAR_DEALS_PER_PAGE || newList.length >= POPULAR_DEALS_MAX
                        ? -1
                        : newList.length
                }
            }
        }

        case actions.GET_RECENT_DEALS:
            return {
                ...state,
                recentDeals: {
                    ...state.recentDeals,
                    isLoading: true,
                }
            }
        case actions.GET_RECENT_DEALS_SUCCESS:
            return {
                ...state,
                recentDeals: {
                    isLoading: false,
                    list: [...state.recentDeals.list, ...action.list],
                    offset: action.list.length < RECENT_DEALS_PER_PAGE 
                        ? -1
                        : state.recentDeals.offset + RECENT_DEALS_PER_PAGE
                }
            }
        
        case actions.GET_BEST_DEALS: 
            return {
                ...state,
                bestDeals: {
                    ...state.bestDeals,
                    isLoading: true,
                }
            }
        case actions.GET_BEST_DEALS_SUCCESS:
            return {
                ...state,
                bestDeals: {
                    isLoading: false,
                    list: action.list,
                }
            }
        
        case actions.GET_DEALS_FOR_USER:
            return {
                ...state,
                dealsForUser: {
                    ...state.dealsForUser,
                    isLoading: true,
                }
            }
        case actions.GET_DEALS_FOR_USER_SUCCESS:
            return {
                ...state,
                dealsForUser: {
                    isLoading: false,
                    list: [...state.dealsForUser.list, ...action.list],
                    offset: action.list.length < DEALS_FOR_USER_PER_PAGE 
                        ? -1
                        : state.dealsForUser.offset + DEALS_FOR_USER_PER_PAGE
                }
            }
        

        case actions.GET_DEAL:
            return {
                ...state,
                isLoadingComments: true,
                isLoadingSelectedDeal: true,
            }
        case actions.GET_DEAL_SUCCESS:
            return {
                ...state,
                isLoadingSelectedDeal: false,
                selectedDeal: action.deal,
                selectedDealId: action.deal.id,
                currentCategory: action.deal.category || "all",
            }
        case actions.ADD_DISLIKE_SUCCUESS:
            return {
                ...state,
                selectedDealDisLikes: [...state.selectedDealDisLikes, action.data],
            }
        case actions.DELETE_DISLIKE_SUCCUESS:
            return {
                ...state,
                selectedDealDisLikes: state.selectedDealDisLikes.filter((item) => item.user_id !== action.dislikeUserId),
            }
        case actions.GET_DISLIKE_BY_DEAL_ID_SUCCESS:
            return {
                ...state,
                selectedDealDisLikes: action.data,
            }
        case actions.SET_LIKE_OR_DISLIKE_COMMENT_SUCCUESS: 
            return {
                ...state,
                selectedDealComments: state.selectedDealComments.map((item) => 
                        item.id === action.commentId ? {...item, content: action.newContent } : item)
            }
        case actions.UPDATE_VIEWS:
            return {
                ...state,
                selectedDeal: {...state.selectedDeal, views: action.newViews}
            }
        case actions.REPORT_EXPIRE_SUCCESS: 
            return {
                ...state,
                selectedDeal: {...state.selectedDeal, is_reported: action.newIsReported},
            }

        case actions.REPORT_DEAL_SUCCESS: 
            return {
                ...state,
                selectedDeal: {
                    ...state.selectedDeal,
                    currentUserReported: action.payload,
                }
            }
        case actions.UNREPORT_DEAL_SUCCESS:
            return {
                ...state,
                selectedDeal: {
                    ...state.selectedDeal,
                    currentUserReported: null,
                }
            }
        case actions.REPORT_COMMENT_SUCCESS:
            return {
                ...state,
                selectedDealComments: state.selectedDealComments.map((item) => 
                item.id === action.commentId ? {...item, is_reported: action.newIsReported } : item),
                selectedDealReportedComments: [...state.selectedDealReportedComments,action.newReportedComment],
            }
        case adminActions.REVIEW_DEAL_SUCCESS:
            return {
                ...state,
                selectedDeal: {
                    ...state.selectedDeal,
                    status: action.status,
                }
            }
        case adminActions.DELETE_EDITORS_NOTE_SUCCESS:
            return {
                ...state,
                selectedDeal: {
                    ...state.selectedDeal,
                    editors_note: null,
                }
            }
        case adminActions.UPDATE_EDITORS_NOTE_SUCCESS:
            return {
                ...state,
                selectedDeal: {
                    ...state.selectedDeal,
                    editors_note: action.note,
                }
            }
        case adminActions.MARK_DEAL_AS_FEATURED_SUCCESS:
            return {
                ...state,
                selectedDeal: {
                    ...state.selectedDeal,
                    featured: action.isFeatured
                }
            }
        case adminActions.UPDATE_EXPIRED_DEAL_SUCCESS: 
            return {
                ...state,
                selectedDeal: {
                    ...state.selectedDeal,
                    expired: action.status,
                }
            }
        case actions.UPDATE_REPLY_COMMENT_ID:
            return {
                ...state,
                replyCommentId: action.parentId,
            }
        case actions.HIDE_CHILDREN_COMMENT:
            const childrenCommentIds = action.replyComments.map(i => i.id); 
            return {
                ...state,
                childrenComments: state.childrenComments.filter((item) => !childrenCommentIds.includes(item.id)),
                replyCommentId: null,
            }
        case actions.UPDATE_FEATURED_COMMENT_STATUS_SUCCESS:
            const newFeaturedComment = state.selectedDealComments.filter((item) => item.id === action.commentId)[0]
            return {
                ...state,
                selectedDealComments: state.selectedDealComments.map((item) => item.id === action.commentId
                                        ? {...item, is_featured: action.status, featured_by: action.userId} : item),
                featuredComments: action.status ? [...state.featuredComments, newFeaturedComment]
                                        : state.featuredComments.filter((item) => item.id !== action.commentId)
            }
        case actions.GET_FEATURED_COMMENT_BY_DEAL_ID_SUCCESS:
            return {
                ...state,
                featuredComments: action.data,
            }
        default: return state;
    }
}

export default dealsReducer;