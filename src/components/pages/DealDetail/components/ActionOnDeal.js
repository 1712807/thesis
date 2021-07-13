import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectedDealLikesSelector, selectedDealDisLikesSelector } from '../../../../selectors/dealsSelectors';
import { createUseStyles } from 'react-jss';
import { setLikedStatus, setDisLikedStatus } from '../../../../redux/deals/action';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faThumbsDown, faThumbsUp, faComment } from '@fortawesome/free-solid-svg-icons';
import ShareDeal from './ShareDeal';
import { ModalTransition } from '@atlaskit/modal-dialog';
import AddDealCheckBox from './AddDealCheckBox';
import ReportDealModal from './ReportDealModal';
import { hasEditorPermissionOnCategory } from '../../../../services/utils/common';
import { DEALBEE_PATHS } from '../../../../services/utils/constant';

const useStyles = createUseStyles({
    action: {
        display: 'grid',
        borderTop: 'thin solid lightgray',
        borderBottom: 'thin solid lightgray',
        padding: '1rem 0',
        fontSize: '.7rem',
        justifyContent: 'space-between',
        gridTemplateColumns: 'auto auto',
        "& > div:first-child": {
            marginRight: "1rem",
        },
        '@media screen and (max-width: 461px)': {
            gridTemplateColumns: 'auto',
            "& > div:first-child": {
                marginRight: "0",
            },
        }
    },
    likeDislikeContainer: {
        "& > div": {
            display: 'flex',
            padding: '.7rem',
            cursor: 'pointer',
            alignItems: 'center',
            backgroundColor: '#f2f2f2',
            border: '1px solid lightgray', 
            color: 'gray',
        },
        "& svg": {
            width: '1.1rem !important',
            height: '1.1rem',
        }
    },
    likedIcon: {
        '&:hover': {
            color: 'rgb(4, 180, 66)',
        }
    },
    dislikedIcon: {
        '&:hover': {
            color: '#e60c0c94',
        }

    },
    dealScoreContainer: {
        display: 'flex',
        textAlign: 'center',
    },
    dealScoreLabel: {
        padding: '.5rem',
        color: 'white',
        borderRadius: '5px 0 0 5px',
        height: '-webkit-fill-available',
        display: 'flex',
        alignItems: 'center',
        maxWidth: '65px',
        fontSize: '.85rem',
        fontWeight: 'bold',
    },
    dealScore: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '0 5px 5px 0',
        minWidth: '35px',
        fontSize: '1.5rem',
        fontWeight: 'bold',
    },
    viewsContainer: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    leftCol: {
        display: 'flex',
        flexWrap: 'wrap',
        "& > div": {
            marginRight: "0.7rem",
            // marginBottom: '.5rem',
            height: '40px',
        },
        '&& > div:last-child': {
            '@media screen and (max-width: 372px)': {
                height: '1.5rem',
            }
        },
        '@media screen and (max-width: 461px)': {
            justifyContent: 'center',
        }
    },
    expired: {
        color: 'rgb(4, 135, 229)',
        margin: 'auto',
        cursor: 'pointer',
        display: "flex",
        justifyContent: "center",
        fontSize: '.85rem',
        fontWeight: '500',
        '&:hover': {
            textDecoration: 'underline',
        }
    },
    confirmICon: {
        width: '20px !important',
        height: '20px',
        padding: '.5rem',
        color: 'white',
        background: 'black',
        borderRadius: '50px',
    },
});

const ActionOnDeal = (props) => {
    const dispatch = useDispatch();
    const classes = useStyles();
    const { currentUser, selectedDeal, expired } = props;
    const { comments_count: commentsCount, currentUserReported, category, views } = selectedDeal;
    const selectedDealLikes = useSelector(selectedDealLikesSelector);
    const selectedDealDisLikes = useSelector(selectedDealDisLikesSelector);

    const usersIdLikeDeal = selectedDealLikes.map((item) => item.user_id);
    const likedStatus = usersIdLikeDeal.includes(currentUser.id);
    const usersIdDisLikeDeal = selectedDealDisLikes.map((item) => item.user_id);
    const dislikedStatus = usersIdDisLikeDeal.includes(currentUser.id);

    const [liked, setLiked] = useState(false);
    const [disLiked, setDisLiked] = useState(false);
    const [isReported, setIsReported] = useState(currentUserReported);
    const [score, setScore] = useState(0);
    const [isShowingReportModal, setIsShowingReportModal] = useState(false);

    useEffect(() => {
        setLiked(likedStatus);
        setDisLiked(dislikedStatus);
        setIsReported(currentUserReported);
        setScore(selectedDealLikes.length - selectedDealDisLikes.length)
    }, [likedStatus, dislikedStatus, currentUserReported, selectedDealLikes, selectedDealDisLikes])

    const onClickedLikeOrDislike = (type) => {
        if (currentUser.id) {
            if (type === 'like') {
                const newScore = liked ? score - 1 : (disLiked ? score + 2 : score + 1)
                setScore(newScore)
                setLiked(!liked);
                setDisLiked(false);
                dispatch(setLikedStatus(selectedDeal, !liked, currentUser.id, disLiked, currentUser.point))
            }
            else {
                const newScore = disLiked ? score + 1 : (liked ? score -2 : score - 1)
                setScore(newScore)
                setDisLiked(!disLiked);
                setLiked(false);
                dispatch(setDisLikedStatus(selectedDeal, !disLiked, currentUser.id, liked, currentUser.point));
            }
        } 
        else {
            //dispatch(openErrorMessageModal(true));
            window.location.href=`${DEALBEE_PATHS.login}?required=true`;
        }  
    }

    const onReportCliked = () => {
        if (!currentUser.id) {
            //dispatch(openErrorMessageModal(true));
            window.location.href=`${DEALBEE_PATHS.login}?required=true`;
            return;
        }
        setIsShowingReportModal(true);
    }

    // const onReportConfirmed = () => {
    //     const flag = isReported ? FLAGS.unreportDealExpiredSuccess : FLAGS.reportDealExpiredSuccess;
    //     dispatch(addFlagNoti(flag));
    //     if (!expired) {
    //         setIsReported(!isReported);
    //         dispatch(reportExpire(selectedDeal, currentUser, !isReported));
    //     }
    // }

    const likeAndDislikeAction = () => {
        return (
            <div className={classes.likeDislikeContainer} style={{display: 'flex'}}>
                <div
                    className={classes.likedIcon}
                    onClick={() => onClickedLikeOrDislike('like')}
                    style={{borderRadius: '5px 0 0 5px'}}>
                    <FontAwesomeIcon icon={faThumbsUp} style={{color: liked ? 'rgb(4, 180, 66)' : ''}} />             
                </div>  
                <div 
                    className={classes.dislikedIcon}
                    onClick={() => onClickedLikeOrDislike('dislike')}
                    style={{borderRadius: '0 5px 5px 0'}}    
                >
                    <FontAwesomeIcon icon={faThumbsDown} style={{color: disLiked ? '#e60c0c94' : ''}} />
                </div>
            </div>
        );
    }

    const renderInteraction = () => { 
        return (
            <div style={{display: 'flex', flexDirection: "column", justifyContent: 'center'}}>
                <div className={classes.viewsContainer}>
                    <FontAwesomeIcon icon={faEye} style={{color: 'gray', marginRight: '.25rem'}} />
                    <div style={{color: 'gray'}}>{views} lượt xem</div>
                </div>
                <div className={classes.viewsContainer}>
                    <FontAwesomeIcon icon={faComment} style={{color: 'gray', marginRight: '.25rem'}} />
                    <div style={{color: 'gray'}}>{commentsCount} bình luận</div>
                </div>
                
            </div>
        );
    }
    
    return (
        <div className={classes.action}>
            <div className={classes.leftCol}>
                
                <div className={classes.dealScoreContainer}>
                    <div 
                        className={classes.dealScoreLabel}
                        style={{
                            background: score < 0 ? "dimgray" : "green",
                        }}
                    >
                        Điểm deal
                    </div>
                    <div 
                        className={classes.dealScore}
                        style={{
                            background: score < 0 ? "lightgray" : "mediumseagreen",
                            color: score < 0 ? "dimgray" : "white"
                        }}
                    >
                        {score}
                    </div>
                </div>  
                {likeAndDislikeAction()}
                {renderInteraction()}
                {!expired && 
                    <div style={{display: "flex"}}>
                        <AddDealCheckBox deal={selectedDeal} />
                        {!hasEditorPermissionOnCategory(currentUser, category) && currentUser.id && <div className={classes.expired} onClick={onReportCliked}>{isReported ? "Hủy báo cáo" : 'Báo cáo deal'}</div>}          
                    </div>
                }
            </div>
                
            <ShareDeal selectedDeal={selectedDeal}/>
            <ModalTransition>
                {isShowingReportModal &&
                    <ReportDealModal reported={isReported} onClose={() => setIsShowingReportModal(false)}/>
                }
            </ModalTransition>
        </div>
    );
}

export default ActionOnDeal;