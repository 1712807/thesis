import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectedDealSelector, selectedDealCommentsSelector, bestDealsSelector, recentDealsSelector } from '../../../selectors/dealsSelectors';
import { createUseStyles } from 'react-jss';
import { currentUserSelector, isGettingCurrentUserSelector } from '../../../selectors/usersSelector';
import NewCommentCard from './comments/NewCommentCard';
import ActionOnDeal from './components/ActionOnDeal';
import DetailDeal from './components/DetailDeal';
import BestDeals from "../../deal_lists/BestDeals";
import { getBestDeals, getCommentByDealId, getDeal, getRecentDeals, getFeaturedCommentByDealId} from '../../../redux/deals/action';
import LoadingSpinner from '../../common/loaders/LoadingSpinner';
import PageLoader from '../../common/loaders/PageLoader';
import EditorsNote from './components/EditorsNote';
import { getDocumentTitle, hasEditorPermission, isPastDate } from '../../../services/utils/common';
import CommentGroup from './comments/CommentGroup';
import { MAX_PAGE_WIDTH } from '../../../services/utils/constant';
import { detailPageParamsSelector } from '../../../selectors/appSelectors';
import FeaturedComments from './comments/FeaturedComments';
import SuggestedDeals from '../../deal_lists/SuggestedDeals';

let isLoadingMore = false;
let isShowingRecentDeals = false;
const DetailDealPage = () => {
    const classes = useStyles();
    const detailPageParams = useSelector(detailPageParamsSelector);
    const {id: dealId, isPreview} = detailPageParams;
    
    const dealForPreview = JSON.parse(localStorage.getItem('dealForPreview'));
    const selectedDealFromState = useSelector(selectedDealSelector);
    const selectedDeal = isPreview ? dealForPreview : selectedDealFromState;

    if (selectedDeal.info && selectedDeal.info.title) {
        document.title = getDocumentTitle(selectedDeal.info.title, 50)
    }
    
    const selectedDealComments = useSelector(selectedDealCommentsSelector);
    const allCommentsLoaded = useSelector((state) => state.deals.allCommentsLoaded);
    const isLoadingComments = useSelector((state) => state.deals.isLoadingComments);
    const recentDeals = useSelector(recentDealsSelector);
    const featuredComments = useSelector((state) => state.deals.featuredComments)

    useEffect(() => {
        if (allCommentsLoaded) {
            isLoadingMore = false;
            isShowingRecentDeals = true;
        }
    }, [allCommentsLoaded])

    // useEffect(() => {
    //     if (isShowingRecentDeals) 
    //         dispatch(getRecentDeals()) 
    // }, [isShowingRecentDeals])

    const isGettingCurrentUser = useSelector(isGettingCurrentUserSelector);
    const currentUser = useSelector(currentUserSelector);

    const dispatch = useDispatch();
    useEffect(() => {
        if (!isPreview || (!isGettingCurrentUser && hasEditorPermission(currentUser.role))) {
            dispatch(getDeal(dealId));
        }
        if (!isPreview) dispatch(getFeaturedCommentByDealId(dealId));
        return function clearLocalStorage() {
            localStorage.removeItem('dealForPreview');
        }
    }, [])

    const isLoadingDeal = useSelector((state) => state.deals.isLoadingSelectedDeal)
    const bestDeals = useSelector(bestDealsSelector)
    const isLoading = !isPreview && isLoadingDeal;

    useEffect(() => {
        if (!isPreview && !isLoadingDeal && selectedDeal.id === parseInt(dealId)) {
            dispatch(getBestDeals());
        }
    }, [isLoadingDeal])

    useEffect(() => {
       if (!isLoading || recentDeals.offset >= 0) isLoadingMore = false;
    }, [selectedDealComments.length, recentDeals.offset]) 

    const { id, expired_at } = selectedDeal;
    const isExpired = selectedDeal.expired || isPastDate(expired_at);

    const renderDetailInfo = () => {
        return (
            <div className={classes.leftCol}>
                <DetailDeal selectedDeal={selectedDeal} expired={isExpired}/>
                <EditorsNote />                  
                {!isPreview &&
                    <>
                        <ActionOnDeal currentUser={currentUser} selectedDeal={selectedDeal} expired={isExpired}/>
                          
                          {<NewCommentCard dealId={id} currentUser={currentUser} />}
                          {featuredComments.length > 0 && <FeaturedComments list={featuredComments} />} 
                          <div className={classes.commentsContainer}>
                              {selectedDealComments.length > 0 && <h3 style={{marginTop: '1rem', marginBottom: '.5rem'}}>Tất cả bình luận</h3>}
                              {selectedDealComments.map((item) => <CommentGroup key={item.id} comment={item} />)}
                              {((isLoadingMore && !allCommentsLoaded) || isLoadingComments) ? <LoadingSpinner /> : ''}
                          </div>
                    </>    
                }
            </div>
        );
    }

    const renderRelatedDeal = () => {
        return isPreview || bestDeals.list.filter((item) => item.id !== selectedDeal.id).length === 0
            ? <div className={classes.rightCol}></div> 
            : (
                <div className={classes.rightCol}>
                    <h3>{selectedDeal.category ? "Deal tốt cùng ngành hàng" : "Deal tốt trên Dealbee"}</h3>
                    <BestDeals />
                </div>
            )
    }

    document.addEventListener("scroll", () => {
        const {scrollHeight: maxHeight, clientHeight: containerHeight, scrollTop} = document.getElementsByTagName("html")[0];
        const isBottom = Math.ceil(scrollTop + containerHeight) >= maxHeight;
        
        if (!isPreview && !isLoadingDeal && isBottom && !isLoadingMore) {
            isLoadingMore = true;
            if (isShowingRecentDeals) dispatch(getRecentDeals()) //console.log("get deals"); 
            else {
                dispatch(getCommentByDealId(dealId));   
            }
        }
    });

    return isLoading ? (
        <div className={classes.container}>
            <PageLoader/>
        </div>
    ) : (
        <div className={classes.container}>
            <div
                className={classes.contentContainer}
                id="dealbee-deal-detail-page"
                style={{pointerEvents: isPreview ? "none" : ''}}
            >
                {renderDetailInfo()}
                {renderRelatedDeal()}
            </div>
            {isShowingRecentDeals && recentDeals.list.filter((item) => item.id !== selectedDeal.id).length > 0 && (
                <div style={{marginTop: "4rem"}}>
                    <h3>{selectedDeal.category ? "Có thể bạn sẽ quan tâm" : "Deal mới trên Dealbee"}</h3>
                    <SuggestedDeals exceptFor={selectedDeal.id} />
                </div>
            )}
            {recentDeals.isLoading && recentDeals.list.length === 0 && <LoadingSpinner />}
        </div>        
    );
};

const useStyles = createUseStyles({
    container: {
        maxWidth: MAX_PAGE_WIDTH,
        width: "100%",
        padding: '2rem 0',
        "& h3": {
            fontWeight: "500",
            margin: "0 0 1rem 0",
        },
    },
    contentContainer: {
        display: "grid",
        gridTemplateColumns: "66% 34%",
        width: "100%",
        '@media screen and (max-width: 993px)': {
            gridTemplateColumns: '100%',
        }
    },
    leftCol: {
        background: 'white',
        padding: '1rem',
        /* paddingRight: "0", */
        borderRadius: '5px',
        // flex: '61%',
        // minWidth: "61%",
        // maxWidth: "100%",
        marginRight: "2rem",
        '@media screen and (max-width: 993px)': {
            marginRight: 0,
        }
    },
    rightCol: {
        '@media screen and (max-width: 993px)': {
            display: 'none'
        }
    },
    commentsContainer: {
        "& > div:not(:last-child)":{
            marginBottom: "0.5rem",
        }
    },
    recentDeals: {
        marginTop: "4rem",
        "& > div": {
            padding: "0 0.5rem",
            backgroundColor: "white",
            display: "grid",
            flexWrap: "wrap",
            borderRadius: "5px",
            gridTemplateColumns: '1fr 1fr 1fr 1fr',
            "& > a": {
                /* maxWidth: "23%", */
                flexGrow: 1,
                borderRadius: "5px",
                border: "thin solid transparent",
                "&:hover": {
                    border: "thin solid lightgray",
                }
            },
            '@media screen and (max-width: 1000px)': {
                gridTemplateColumns: '1fr 1fr 1fr',
            },
            '@media screen and (max-width: 750px)': {
                gridTemplateColumns: '1fr 1fr',
            },
            '@media screen and (max-width: 450px)': {
                gridTemplateColumns: '1fr',
                textAlign: 'center',
                '& > a > div:last-child': {
                    margin: 'auto',
                }
            }
        }
    }
});

export default DetailDealPage;