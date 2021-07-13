import Avatar from "@atlaskit/avatar";
import { faCamera, faComment, faEdit, faMinusCircle, faStar, faThumbsUp, faUserTag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { useDispatch, useSelector } from "react-redux";
import { getCommentsByUsername, getUserProfile, startEditingProfile, editInfo } from "../../../redux/users/action";
import { currentUserSelector, displayingUserSelector, pendingDealsSelector, usersRecentCommentsSelector } from "../../../selectors/usersSelector";
import { getDateFormatted, getDocumentTitle, getLinkToDeal, getTimeAgoLabel, getTimeLabel, hasModeratorPermission, uploadPhoto } from "../../../services/utils/common";
import { MAX_PAGE_WIDTH } from "../../../services/utils/constant";
import UsersDeals from "../../deal_lists/UsersDeals";
import MyDeals from "./components/MyDeals";
import CategoryTag from "../../common/components/CategoryTag";
import { detailPageParamsSelector } from "../../../selectors/appSelectors";
import LoadingSpinner from "../../common/loaders/LoadingSpinner";
import { useCommonStyles } from "../../../services/utils/common_classes";
import { addFlagNoti } from '../../../redux/app/action';
import { FLAGS } from '../../../services/utils/constant';
import Tooltip from "@atlaskit/tooltip";
import { ModalTransition } from "@atlaskit/modal-dialog";
import BlockUserModal from "../../common/modals/BlockUserModal";
import EditUsersInfoForAdminModal from "../../common/modals/EditUsersInfoForAdminModal";
import ScoreInfoModal from "../../common/modals/ScoreInfoModal";
import ButtonFollow from '../../common/buttons/ButtonFollow';
import FollowInfoModal from './components/FollowInfoModal';
import UserLevelLabel from "../../common/components/UserLevelLabel";
import SectionLoader from "../../common/loaders/SectionLoader";
let flag = false;

const UserProfile = () => {
    const classes = useStyles();
    const commonClasses = useCommonStyles();
    const dispatch = useDispatch();
    
    const [isShowingBlockModal, setIsShowingBlockModal] = useState(false);
    const [isShowingAdminEditModal, setIsShowingAdminEditModal] = useState(false);
    const [isShowingScoreModal, setIsShowingScoreModal] = useState(false);

    const usernameOnParams = useSelector(detailPageParamsSelector).username;
    const searchParams = new URLSearchParams(window.location.search);
    const location = searchParams.get("location");
    const currentTab = location === "pending_deals" ? 1 : 0;

    useEffect(() => {
        if (usernameOnParams) 
            dispatch(getUserProfile(usernameOnParams));
    }, [])

    const pendingDeals = useSelector(pendingDealsSelector);
    useEffect(() => {
        const element = document.getElementById("users-deals");
        if (!flag && currentTab === 1 && element && pendingDeals.list.length > 0) {
            flag = true;
            element.scrollIntoView({block: "end"});
        }
    }, [pendingDeals && pendingDeals.list.length])

    const uploadPhotoRef = useRef();
   
    const displayingUser = useSelector(displayingUserSelector) || {};
    const { followingCategories, isLoading: isLoadingProfile } = displayingUser;

    if (!isLoadingProfile && displayingUser.id) {
        document.title = getDocumentTitle(displayingUser.info.displayName)
    }

    const currentUser = useSelector(currentUserSelector);
    const currentUserIsAdminOrMod = hasModeratorPermission(currentUser.role);
    const isMyProfile = currentUser.id === displayingUser.id;
    const usersComments = useSelector(usersRecentCommentsSelector);
    const {list, currentPage, isLoading} = usersComments;
    const commentList = list.map((item) => ({
        id: item.id,
        content: item.content.text,
        time: getTimeLabel(item.created_at),
        deal: {
            title: item.deal_info.title,
            link: getLinkToDeal(item.deal_id, item.deal_info.title),
        }      
    }));
    const isChangeAvatar = useSelector((state) => state.users.isChangeAvatar);

    // if (!displayingUser.id) return '';
    const {username, id: userId, lastActiveOn, joinedAt} = displayingUser;
    const info = displayingUser.info || {};

    const onChangeAvatar = () => {
        uploadPhotoRef.current.click();
      };

    const onPhotoUpdated = async(file) => {
        const newFiles = await uploadPhoto(file)
        if (newFiles.size < 80000) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                const newInfo = {
                    ...info,
                    avatarUrl: reader.result
                }
                dispatch(editInfo(currentUser.id, newInfo, followingCategories, true))
            });
            reader.readAsDataURL(newFiles)
        } else {
            dispatch(addFlagNoti(FLAGS.changeAvatarFail))
        }
    }

    const renderBasicInfo = () => {
        return (
            <div style={{width: "fit-content", display: "flex"}}>
                <div style={{marginRight: "1rem"}}>
                    <div className={classes.avatar}>
                        <Avatar
                            appearance="circle"
                            size="xlarge"
                            src={info.avatarUrl}
                        />
                        {isChangeAvatar && <div style={{position: 'absolute', top: '0', left: '50%', right: '50%'}}>
                            <LoadingSpinner />
                        </div>}
                        {currentUser.id === displayingUser.id && <div className={classes.changeAvatar} role="presentation" onClick={onChangeAvatar}>
                            <FontAwesomeIcon icon={faCamera} />
                            <input
                                ref={uploadPhotoRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => onPhotoUpdated(e.currentTarget.files[0])}
                                hidden
                                aria-hidden
                            />
                        </div>}
                    </div>
                    {currentUser.id === displayingUser.id ?
                        (<div 
                            className={classes.editLabel}
                            onClick={() => dispatch(startEditingProfile())}
                        >
                            Chỉnh sửa hồ sơ
                        </div>) : <ButtonFollow followedByUserId={currentUser.id} followedUserId={displayingUser.id} followedUsername={displayingUser.username} />
                    }
                </div>
                <div className={classes.names}>
                    <h3>
                        {info.displayName || username}
                    </h3>
                    <div>@{username}</div>
                    <div style={{fontSize: "0.9rem", marginTop: "0.75rem"}}>{info.introduction || ''}</div>
                </div>
            </div>
        )
    }

    const renderOverview = () => {
        const {role, point} = displayingUser;
        return (
            <div className={classes.overview}>
                <div>
                    <UserLevelLabel role={role} point={point} onClick={() => setIsShowingScoreModal(true)}/>
                </div>
                <div>Gia nhập từ {getDateFormatted(joinedAt)}</div>
                <div>Hoạt động lần cuối {getTimeAgoLabel(lastActiveOn)}</div>
                {/* <div>15 người đã xem</div> */}
                <FollowInfoModal type="followers" username={displayingUser.username} name={displayingUser.info.displayName || displayingUser.username} />
                <FollowInfoModal type="following" username={displayingUser.username} name={displayingUser.info.displayName || displayingUser.username}/>
            </div>
        )
    }

    const renderStats = () => {
        const user_action = displayingUser.user_action || {
            comments: 0,
            interaction: 0,
            reputation_score: 0,
            shares: 0,
        };
        const {comments, interaction, reputation_score, shares} = user_action;
        return (
            <div className={classes.stats}>
                <div>
                    <div>{shares || 0}</div>
                    <div>
                        <FontAwesomeIcon icon={faUserTag}/>
                        khuyến mãi đã chia sẻ
                    </div>
                </div>
                <div>
                    <div>{comments || 0}</div>
                    <div>
                        <FontAwesomeIcon icon={faComment}/>
                        lượt bình luận
                    </div>
                </div>
                <div>
                    <div>{interaction || 0}</div>
                    <div>
                        <FontAwesomeIcon icon={faThumbsUp}/>
                        lượt tương tác
                    </div>
                </div>
                <div>
                    <div>{reputation_score || 0}</div>
                    <div>
                        <FontAwesomeIcon icon={faStar}/> 
                        điểm uy tín
                    </div>
                </div>
            </div>
        )
    }

    const renderComment = (comment) => {
        const {deal: {link, title}, time, content} = comment;
        return (
            <div className={classes.comment}>
                <div className={classes.commentOn}>
                    <div className={classes.cmtOnTime}>
                        {time}
                    </div>
                    <a
                        href={link} 
                        target="_blank"
                        rel="noreferrer"
                        className={classes.postTitle}
                    >
                        {title}
                    </a>
                </div>
                
                <div style={{
                    marginTop: "0.5rem", 
                }}>
                    {content.length < 250 ? content : `${content.substring(0, 250)}...`}
                </div>
            </div>
        )
    }

    const renderFollowingCategories = () => {
        if (!followingCategories || followingCategories.length === 0) return '';
        return (
            <div>
                <h3 className={classes.sectionTitle} style={{marginBottom: "0.5rem"}}>Ngành hàng đang theo dõi</h3>
                <div className={classes.followingCategories}>
                    {followingCategories.map((item) => item !== "all" && item !== "others" && (
                        <CategoryTag category={item}/>
                    ))}
                </div>
            </div>
        )
    }

    const loadMoreCommentsOfUser = () => {
        dispatch(getCommentsByUsername(username));
    }

    const renderRecentComments = () => {
        return (
            <div className={classes.recentComments}>
                <h3 className={classes.sectionTitle}>Bình luận gần đây</h3>
                {!isLoading && commentList.length === 0
                    ? <div className={commonClasses.emptyDealMsg} style={{paddingTop: 0}}>
                        Không có bình luận nào để hiển thị.
                        {/* {isMyProfile ? "Bạn chưa có bất cứ bình luận nào." : `${displayingUser.info.displayName || displayingUser.username} chưa có bất cứ bình luận nào.`} */}
                    </div> 
                    : commentList.map((item) => renderComment(item))
                }
                {currentPage > 0 && (
                    isLoading ? <LoadingSpinner />
                    : <div 
                        className={classes.viewMoreCmtsText}
                        onClick={loadMoreCommentsOfUser}
                    >
                        Xem thêm bình luận
                    </div>
                )}
            </div>
        )
    }

    const renderRecentPosts = () => {
        return (
            <div className={classes.postedDeals}>
                {isMyProfile 
                    ? <div>
                        <h3 className={classes.sectionTitle}>Deal của tôi</h3>
                        <div className={classes.myDealsContainer}>
                            <MyDeals defaultTab={currentTab}/>
                        </div>
                    </div>
                    : <div>
                        <h3 className={classes.sectionTitle}>Deal đã chia sẻ</h3>
                        <div className={classes.myDealsContainer} style={{padding: "0 0.25rem"}}>
                            <UsersDeals userId={userId} isMine={false} name={info.displayName || username}/>
                        </div>
                    </div>
                }
            </div>
        )
    }

    const renderAdminActions = () => {
        return (
            <div className={classes.adminActions}>
                {currentUser.role === "admin" && (
                    <div style={{color: "dimgray", marginRight: "0.5rem"}} onClick={() => setIsShowingAdminEditModal(true)}>
                        <Tooltip content="Thay đổi vai trò">
                            <FontAwesomeIcon icon={faEdit}/>
                        </Tooltip>
                    </div>
                )}
                <div style={{color: "tomato"}} onClick={() => setIsShowingBlockModal(true)}>
                    <Tooltip content="Khóa tài khoản">
                        <FontAwesomeIcon icon={faMinusCircle}/>
                    </Tooltip>
                </div>
            </div>
        )
    }

    return isLoadingProfile ? <SectionLoader height={700} style={{ marginTop: "2rem" }}/> : (
        <div className={classes.userProfilePage}>
            {currentUserIsAdminOrMod && !isMyProfile && (displayingUser.role !== "admin" || currentUser.username === "admin") && renderAdminActions()}
            <div className={classes.basicInfoAndStats}>
                {renderBasicInfo()}
                {renderOverview()}
                {renderStats()}
            </div>
            {renderFollowingCategories()}
            <div className={classes.latestActivities} id="users-deals">
                {renderRecentPosts()}
                {renderRecentComments()}
            </div>

            <ModalTransition>
                {isShowingBlockModal && 
                    <BlockUserModal 
                        onClose={() => setIsShowingBlockModal(false)}
                        user={displayingUser}
                        isBlocking={true}
                    />
                }
                {isShowingAdminEditModal && 
                    <EditUsersInfoForAdminModal
                        onClose={() => setIsShowingAdminEditModal(false)}
                        user={displayingUser}
                    />
                }
                {isShowingScoreModal &&
                    <ScoreInfoModal 
                        isMine={isMyProfile}
                        name={displayingUser.info.displayName}
                        point={displayingUser.point}
                        onClose={() => setIsShowingScoreModal(false)}
                    />
                }
            </ModalTransition>
        </div>
    )
}


const useStyles = createUseStyles({
    userProfilePage: {
        position: "relative",
        padding: "2rem 0",
        width: "100%",
        maxWidth: MAX_PAGE_WIDTH,
        "& > div": {
            backgroundColor: "white",
            borderRadius: "5px",
            padding: "1rem",
            "&:not(:last-child)": {
                marginBottom: "1rem",
            }
        }
    },
    adminActions: {
        display: "flex",
        padding: "0.5rem !important",
        position: "absolute",
        top: "2rem",
        right: "0.5rem",
        fontSize: "1.25rem",
        "& div": {
            cursor: "pointer"
        }
    },
    basicInfoAndStats: {
        "& > div:not(:last-child)": {
            marginBottom: "1rem",
        }
    },
    names: {
        "& h3": {
            fontSize: "1.5rem",
            margin: "0",
        },
    },
    editLabel: {
        marginTop: "0 !important",
        fontSize: "0.8rem",
        color: "#08c",
        cursor: "pointer",
        fontWeight: "500",
    },
    overview: {
        borderTop: "thin solid lightgray",
        borderBottom: "thin solid lightgray",
        padding: "0.25rem 0",
        display: "flex",
        flexWrap: "wrap",
        fontSize: "0.8rem",
        "& > div:not(:last-child)": {
            marginRight: "1rem",
        }
    },
    stats: {
        display: "flex",
        flexWrap: "wrap",
        "& > div:not(:last-child)": {
            marginRight: "1rem",
            "@media screen and (max-width: 675px)": {
                marginRight: "0"
            }
        },
        color: "#4d4d4d",
        "& > div > div": {
            textAlign: "center",
            "&:first-child": {
                fontSize: "2rem",
                fontWeight: "bold",
            },
            "&:last-child": {
                fontSize: "0.8rem",
                marginTop: "0.5rem",
                "& svg": {
                    marginRight: "0.25rem",
                }
            }
        },
        "@media screen and (max-width: 675px)": {
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gridTemplateRows: "repeat(2, 1fr)"
        }
    },
    sectionTitle: {
        fontWeight: "500",
        marginTop: "0 !important",
        marginBottom: "1rem",
    },
    latestActivities: {
        display: "grid",
        width: "calc(100% - 2rem)",
        gridTemplateColumns: "66.5% auto",
        // justifyContent: "space-between",
        // flexWrap: "wrap",
        "@media screen and (max-width: 768px)": {
            gridTemplateColumns: "100%"
        }
    },
    postedDeals: {
        // width: "60%",
        marginRight: "2rem",
        "@media screen and (max-width: 768px)": {
            marginRight: "0",
            marginBottom: "2rem",
        }
    },
    recentComments: {
        // width: "30%",
    },
    comment: {
        marginBottom: "1rem",
        borderLeft: "2px solid gray",
        paddingLeft: "0.5rem",
    },
    commentOn: {
        display: "flex",
        flexWrap: "wrap",
        fontSize: "0.8rem",
        "& div":{
            color: "gray",
        },
        "& a": {
            textDecoration: "none",
        }
    },
    viewMoreCmtsText: {
        width: "100%",
        borderTop: "1px solid rgb(232, 232, 232)",
        color: "rgb(91,91,91)",
        fontSize: "0.75rem",
        cursor: "pointer",
        fontWeight: "500",
        padding: "8px 0px",
        textAlign: "center",
        "&:hover": {
            backgroundColor: "rgb(246, 251, 255)"
        }
    },
    myDealsContainer: {
        border: "thin solid lightgray",
        borderRadius: "5px",
    },
    postTitle: {
        maxHeight: "100%",
        width: "100%",
        overflow: "hidden",
        display: "-webkit-box",
        boxOrient: "vertical",
        lineClamp: 2,
        "& div": {
            lineClamp: 2,
        }
    },
    avatar: {
        cursor: 'pointer',
        position: 'relative',
        '&:hover div:last-child': {
            opacity: '1',
        }
    },
    changeAvatar: {
        position: 'absolute',
        bottom: '5px',
        right: '0',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '100px',
        background: 'lightgray',
        opacity: '.5',
    },
    followInfo: {
        cursor: 'pointer',
        '&:hover': {
            textDecoration: 'underline',
        }
    },
    followingCategories: {
        display: "flex",
        flexWrap: "wrap",
        width: "fit-content",
        marginLeft: "-0.15rem",
        "& > div": {
            margin: "0.15rem"
        }
    }
})

export default UserProfile;