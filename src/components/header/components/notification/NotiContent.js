import React, { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import SuccessIcon from '@atlaskit/icon/glyph/check-circle';
import InfoIcon from '@atlaskit/icon/glyph/info';
import CrossCircleIcon from '@atlaskit/icon/glyph/cross-circle';
import { getLinkToDeal, getTimeLabel } from "../../../../services/utils/common";
import { useDispatch, useSelector } from "react-redux";
import { markNotiAsRead } from "../../../../redux/users/action";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment, faIdBadge, faNewspaper, faTags, faThumbsUp, faTrophy } from '@fortawesome/free-solid-svg-icons'
import { categoriesSelector } from "../../../../selectors/dealsSelectors";
import PersonIcon from '@atlaskit/icon/glyph/person';
import EditorWarningIcon from '@atlaskit/icon/glyph/editor/warning';
import { DEALBEE_PATHS } from "../../../../services/utils/constant";

const NotiContent = (props) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    
    const {noti} = props;
    const {
        id, 
        action, 
        deal_id: dealId, 
        deal_status: dealStatus,
        deal_info: dealInfo,
        created_at: createdAt,
    } = noti;
    const isReportedDealNoti = action.indexOf('reported deal') > 0;
    const categories = useSelector(categoriesSelector);
    const isReportedCommentNoti = action.indexOf('reported comment') > 0 && action.indexOf('admin') > 0;

    const titleTruncated = () => {
        const {title} = dealInfo;
        return <span className={classes.detailPreview}>
            {title.length < 30 ? title : `${title.substring(0, 30)}...`}
        </span>
    }

    const [read, setRead] = useState(null);
    useEffect(() => {
        setRead(noti.is_read)
    }, [noti.is_read])

    const openDetailPage = () => {
        if (action === "[new pending deal]") {
            window.location.href = DEALBEE_PATHS.admin;
            return;
        }
        if (isReportedDealNoti) {
            window.location.href=`${DEALBEE_PATHS.admin}?dealId=${dealId}&isReportedDeal=true`;
            return;
        }
        if (isReportedCommentNoti) {
            console.log('aaaa')
            const startIndex = action.lastIndexOf("[");
            const commentId = action.substring(startIndex + 1, action.length - 1)
            window.location.href=`${DEALBEE_PATHS.admin}?commentId=${commentId}&isReportedComment=true`;
            return;
        }
        if (dealId && dealStatus === "approved") {
            window.location.href = getLinkToDeal(dealId, dealInfo.title);
            return;
        }
    }

    const onNotiClicked = () => {
        if (!read) dispatch(markNotiAsRead(id));
        setRead(true);
        setTimeout(openDetailPage(), !read ? 1000 : 0);
    }

    const dealApprovedNoti = () => (
        <div>
            <SuccessIcon primaryColor="rgb(0, 135, 90)" size="medium" />
            <div>
                Deal {titleTruncated()} của bạn đã được duyệt.
            </div>
        </div>
    )

    const dealDeletedNoti = (status) => (
        <div>
            <CrossCircleIcon primaryColor="rgb(222, 53, 11)" size="medium"/>
            <div>
                Deal {titleTruncated()} của bạn đã bị {status === "deleted" ? "gỡ" : "từ chối"}.
            </div>
        </div>
    )

    const dealEditedNoti = () => (
        <div>
            <InfoIcon primaryColor="rgb(66, 82, 110)" size="medium" />
            <div>
                Biên tập viên đã chỉnh sửa deal {titleTruncated()} của bạn.
            </div>
        </div>
    )

    const dealLikedNoti = () => (
        <div>
            <div className={classes.icon}>
                <FontAwesomeIcon icon={faThumbsUp} color="cornflowerblue" />
            </div>
            <div>Deal {titleTruncated()} của bạn có lượt thích mới.</div>
        </div>
    )

    const dealCommentedNoti = () => (
        <div>
            <div className={classes.icon}>
                <FontAwesomeIcon icon={faComment} color="coral" />
            </div>
            <div>Deal {titleTruncated()} của bạn có bình luận mới.</div>
        </div>
    )

    const dealExpiredNoti = () => (
        <div>
            <InfoIcon primaryColor="rgb(66, 82, 110)" size="medium" />
            <div>
                Deal {titleTruncated()} của bạn đã hết hạn.
            </div>
        </div>
    )

    const deletedFollowingDealEditorNoteNoti = () => (
        <div>
            <InfoIcon primaryColor="rgb(222, 53, 11)" size="medium" />
            <div>
                Biên tập viên đã xóa ghi chú deal {titleTruncated()} bạn đang theo dõi.
            </div>
        </div>
    )

    const editedFollowingDealNoti = () => (
        <div>
            <InfoIcon primaryColor="rgb(66, 82, 110)" size="medium" />
            <div>
                Biên tập viên đã chỉnh sửa thông tin của deal {titleTruncated()} bạn đang theo dõi
            </div>
        </div>
    )

    const followingDealExpiredNoti = () => (
        <div>
            <InfoIcon primaryColor="rgb(66, 82, 110)" size="medium" />
            <div>
                Deal {titleTruncated()} bạn đang theo dõi đã hết hạn.
            </div>
        </div>
    )

    const followingDealRejectedNoti = () => (
        <div>
            <CrossCircleIcon primaryColor="rgb(222, 53, 11)" size="medium"/>
            <div>
                Deal {titleTruncated()} bạn đang theo dõi đã bị gỡ.
            </div>
        </div>
    )

    const followingDealApprovedNoti = () => (
        <div>
            <SuccessIcon primaryColor="rgb(0, 135, 90)" size="medium" />
            <div>
                Deal {titleTruncated()} bạn đang theo dõi đã được đăng lại.
            </div>
        </div>
    )

    const categoryNewDealNoti = () => {
        const category = action.slice(23, action.length - 1);
        const categoryLabel = categories.filter((item) => item.value === category)[0].label;
        return (
            <div onClick={() => {
                localStorage.setItem('category',category);
                window.location.href=DEALBEE_PATHS.homepage;
            }}>
                <div className={classes.icon}>
                    <FontAwesomeIcon icon={faNewspaper} color="green" />
                </div>
                <div>
                Ngành hàng <span className={classes.detailPreview}>{categoryLabel}</span> bạn theo dõi có deal mới.
            </div></div>
        )   
    }

    const followingUserNoti = () => {
        const start = action.indexOf(']');
        const displayName = action.slice(start + 2, action.length - 1);
        return (
            <div>
                <PersonIcon primaryColor="rgb(66, 82, 110)" size="medium"/>
                <div>
                    Deal mới từ <span style={{fontWeight: 500}}>{displayName}</span>: {titleTruncated()}.
                </div>
            </div>
        );
   }

   const reportedDealNoti = () => {
       return (
           <div>
                <EditorWarningIcon primaryColor="rgb(255, 196, 0)" size="medium" />
                <div>
                    Có người dùng đã báo cáo deal {titleTruncated()}!
                </div>
           </div>
       )
   }

   const reportedCommentNoti = (content) => {
        return (
            <div>
                <EditorWarningIcon primaryColor="rgb(255, 196, 0)" size="medium" />
                <div>
                    Có người dùng đã báo cáo bình luận <span style={{fontWeight: 500}}>{content}</span> của bạn trong deal {titleTruncated()}.
                </div>
            </div>
        )
   }

   const reportedCommentNotiForAdmin =(content) => {
    return (
        <div>
            <EditorWarningIcon primaryColor="rgb(255, 196, 0)" size="medium" />
            <div>
                Bình luận <span style={{fontWeight: 500}}>{content}</span> trong deal {titleTruncated()} bị báo cáo.
            </div>
        </div>
    )
   }

   const changeUserLevelNoti = (status, oldLevelName, newLevelName) => {
       return (
        <div>
            <div className={classes.icon}>
                <FontAwesomeIcon icon={faTrophy} color={status === 'true' ? "rgb(255, 196, 0)" : '#787474'} />
            </div> 
            {status === 'true' ?
            <div>
                Xin chúc mừng! Bạn đã được thăng cấp từ <span style={{fontWeight: 500}}>{oldLevelName}</span> lên <span style={{fontWeight: 500}}>{newLevelName}</span>.
            </div> :
            <div>
                Rất tiếc! Bạn đã bị giáng cấp từ <span style={{fontWeight: 500}}>{oldLevelName}</span> xuống <span style={{fontWeight: 500}}>{newLevelName}</span>.
            </div>
            }
        </div>
       )
    }
    
    const newPendingDealNoti = () => {
        return (
            <div>
                <div className={classes.icon}>
                    <FontAwesomeIcon icon={faTags} color="darkgreen" />
                </div>
                Có deal mới đang chờ bạn duyệt!
            </div>
        )
    }

    const roleChangedNoti = (role) => {
        return (
            <div>
                <div className={classes.icon}>
                    <FontAwesomeIcon icon={faIdBadge} color="navy"/>
                </div>
                <div>
                    Vai trò của bạn trên Dealbee đã được thay đổi thành&nbsp;
                    <span style={{fontWeight: "500"}}>
                        {role === "admin"
                            ? "Quản trị viên"
                            : role === "editor" 
                                ? "Biên tập viên"
                                : role === "moderator"
                                    ? "Điều hành viên"
                                    : "Người dùng"
                        }
                    </span>.
                </div>
            </div>
        )
    }

    const featuredCommentNoti = (content, status) => {
        return (
            <div>
                <div className={classes.icon}>
                    <FontAwesomeIcon icon={faComment} color={status === 'true' ? "#11a250" : '#787474'} />
                </div>
                {status === 'true'
                ? <div>Bình luận <span style={{fontWeight: 500}}>{content}</span> của bạn trong deal {titleTruncated()} được đánh dấu nổi bật.</div>
                : <div>Bình luận <span style={{fontWeight: 500}}>{content}</span> của bạn trong deal {titleTruncated()} đã bị gỡ đánh dấu nổi bật.</div>
                }
            </div>
        )
    }

    const parentCommentReplyNoti = (content, childUser) => {
        return (
            <div>
                <div className={classes.icon}>
                    <FontAwesomeIcon icon={faComment} color='coral' />
                </div>
                <div><span style={{fontWeight: 500}}>{childUser}</span> đã trả lời bình luận <span style={{fontWeight: 500}}>{content}</span> của bạn trong deal {titleTruncated()}.</div>
            </div>
        )
    }

    const parentCommentLikeNoti = (content) => {
        return (
            <div>
                <div className={classes.icon}>
                    <FontAwesomeIcon icon={faThumbsUp} color="cornflowerblue" />
                </div>
                <div>Bình luận <span style={{fontWeight: 500}}>{content}</span> của bạn trong deal {titleTruncated()} có lượt thích mới.</div>
            </div>
        )
    }

    const renderDescription = () => {
        if (action.indexOf('new deal on category') > 0) {
            return categoryNewDealNoti();
        }
        if (action.indexOf('following user') > 0) {
            return followingUserNoti();
        }
        if (isReportedDealNoti) {
        // if (action.indexOf('reported deal') > 0) {
            return reportedDealNoti();
        }
        if (action.indexOf("role changed") > 0) {
            const startIndex = action.indexOf("]");
            const newRole = action.substring(startIndex + 2, action.length - 1);
            return roleChangedNoti(newRole);
        }
        if (action.indexOf('reported comment') > 0 && action.indexOf('admin') < 0) {
            const startIndex = action.indexOf("]");
            const commentContent = action.substring(startIndex + 2, action.length - 1)
            const displayingCommentContent = commentContent.length < 30 ? commentContent : `${commentContent.substring(0, 30)}...`
            return reportedCommentNoti(displayingCommentContent);
        }
        if (action.indexOf('reported comment') > 0 && action.indexOf('admin') > 0) {
            const startIndex = action.lastIndexOf("[");
            const subAction = action.substring(0, startIndex - 1);
            const commentContent = action.substring(subAction.lastIndexOf("[") + 1, subAction.length)
            const displayingCommentContent = commentContent.length < 30 ? commentContent : `${commentContent.substring(0, 30)}...`
            return reportedCommentNotiForAdmin(displayingCommentContent);
        }
        if (action.indexOf('change level') > 0) {
            const content = action.substring(action.indexOf("]") + 2, action.length -1);
            const levelNameIndex = content.indexOf("]")
            const status = content.substring(0, levelNameIndex)
            const levelName = content.substring(levelNameIndex + 2, content.length)
            const newLevelNameIndex = levelName.indexOf(']')
            const oldLevelName = levelName.substring(0, newLevelNameIndex);
            const newLevelName = levelName.substring(newLevelNameIndex+2, levelName.length)
            return changeUserLevelNoti(status, oldLevelName, newLevelName);
        }
        if (action.indexOf('featured comment') > 0) {
            const content = action.substring(action.indexOf(']') + 2, action.length - 1);
            const lastIndexContent = content.indexOf(']');
            const commentContent = content.substring(0, lastIndexContent);
            const status = content.substring(lastIndexContent + 2, content.length);
            const displayingCommentContent = commentContent.length < 30 ? commentContent : `${commentContent.substring(0, 30)}...`
            return featuredCommentNoti(displayingCommentContent, status)
        }
        if (action.indexOf('reply comment') > 0) {
            const content = action.substring(action.indexOf(']') + 2, action.length - 1);
            const lastIndexContent = content.indexOf(']');
            const childUserName = content.substring(0, lastIndexContent);
            const parentCommentContent = content.substring(lastIndexContent + 2, content.length);
            const displayingCommentContent = parentCommentContent.length < 30 ? parentCommentContent : `${parentCommentContent.substring(0, 30)}...`
            return parentCommentReplyNoti(displayingCommentContent, childUserName)
        }
        if (action.indexOf('like comment') > 0) {
            const commentContent = action.substring(action.indexOf(']') + 2, action.length - 1);
            const displayingCommentContent = commentContent.length < 30 ? commentContent : `${commentContent.substring(0, 30)}...`
            return parentCommentLikeNoti(displayingCommentContent)
        }
        switch (action) {
            case "[your deal][reviewed][approved]":
                return dealApprovedNoti();

            case "[your deal][reviewed][deleted]": 
                return dealDeletedNoti("deleted");
            
            case "[your deal][reviewed][rejected]": 
                return dealDeletedNoti("rejected");

            case "[your deal][edited]":
                return dealEditedNoti();
            
            case "[your deal][liked]": 
                return dealLikedNoti();

            case "[your deal][commented]":
                return dealCommentedNoti();

            case "[your deal][expired]": 
                return dealExpiredNoti();

            case "[your following deal][info][edited]":
                return editedFollowingDealNoti();

            case "[your following deal][expired]":
                return followingDealExpiredNoti();

            case "[your following deal][rejected]":
                return followingDealRejectedNoti();

            case "[your following deal][approved]":
                return followingDealApprovedNoti();

            case "[your following deal][editorNote][deleted]":
                return deletedFollowingDealEditorNoteNoti();
            
            case "[new pending deal]":
                return newPendingDealNoti();
            
            default: return 
        }
    }

    const renderTimeCreated = () => {
        return (
            <div className={classes.timeLabel}>
                {getTimeLabel(createdAt)}
            </div>
        )
    }

    return (
        <div 
            key={id} 
            onClick={onNotiClicked} 
            className={classes.notiCard}
            style={{backgroundColor: read ? "white" : "aliceblue"}}
        >
            {renderDescription()}
            {renderTimeCreated()}
        </div>
    )
}

const useStyles = createUseStyles({
    notiCard: {
        padding: "1rem",
        cursor: "pointer",
        "&:hover": {
            backgroundColor: "#f2f2f2 !important"
        },
        "& > div > div": {
            overflow: "hidden",
            display: "-webkit-box",
            boxOrient: "vertical",
            lineClamp: 3,
        },
        "& > div:first-child": {
            display: "flex",
            "& > span": {
                marginRight: "0.5rem",
            }
        },
    },
    detailPreview: {
        color: "#0052CC",
    },
    timeLabel: {
        fontSize: "0.75rem",
        textAlign: "right",
        color: "dimgray",
        marginTop: "0.5rem",
    },
    icon: {
        "& svg": {
            paddingLeft: "4px",
            width: "24px",
        },
        width: "24px",
        minWidth: "24px",
        marginRight: '.5rem',
    },
})

export default NotiContent;