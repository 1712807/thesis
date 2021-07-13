import React, { useRef, useState, useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import Avatar from '@atlaskit/avatar';
import { currentUserSelector } from '../../../../selectors/usersSelector';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import { editComment, setLikeComment, setDisLikeComment, reportComment, updateReplyCommentId, getChildrenCommentByCommentId } from '../../../../redux/deals/action';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsDown, faThumbsUp, faFlag, faBahai } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '@atlaskit/tooltip';
import TextArea from '@atlaskit/textarea';
import { selectedDealReportedCommentsSelector, replyCommentIdSelector, childrenCommentsSelector } from '../../../../selectors/dealsSelectors';
import moment from 'moment-timezone';
import { getLinkToProfile, getTimeAgoLabel, hasEditorPermission, hasModeratorPermission, getTimeLabel } from '../../../../services/utils/common';
import { useCommonStyles } from '../../../../services/utils/common_classes';
import ConfirmDeleteCommentModal from './ConfirmDeleteCommentModal';
import ConfirmFeaturedCommentModal from './ConfirmFeaturedCommentModal';
import { DEALBEE_PATHS, INPUT_LENGTHS, TEXT_INPUT_CUSTOM_STYLE } from '../../../../services/utils/constant';
import ScoreInfoModal from '../../../common/modals/ScoreInfoModal';
import UserLevelLabel from '../../../common/components/UserLevelLabel';
import Button from "@atlaskit/button";

const ICON_HIGHLIGHTED_COLORS = {
  like: "rgb(4, 180, 66)",
  dislike: "rgba(230, 12, 12, 0.58)",
  report: "rgb(255, 171, 0)" 
} 

const useStyles = createUseStyles({
  commentContent: {
    width: '100%',
    position: 'relative',
  },
  input: {
    border: 'none',
    background: 'transparent',
    fontFamily: 'inherit',
    width: '100%',
    '&:focus': {outline: 'none'},
  },
  action: {
    display: 'flex',
    marginTop: '.2rem',
    alignItems: 'center',
    fontSize: "0.75rem",
    flexWrap: 'wrap',
  },
  formatIcon: {
    color: 'gray',
    marginRight: '.5rem',
    cursor: 'pointer',
    // '&:hover' : {
    //   color: '#0052CC',
    // }
  },
  commentLayout: {
    width: '100%',
  },
  actionLabel: {
    cursor: 'pointer',
    marginRight: '.6rem',
    color: 'gray',
    padding: '.1rem 0',
    borderRadius: '5px',
    fontWeight: '500',
    display: 'flex',
    '&:hover': {
      textDecoration: 'underline',
    }
  },
  formatHour: {
    display: 'flex',
    color: 'gray',
    marginRight: '.5rem',
    cursor: 'text !important',
  },
  editedText: {
    display: 'flex',
    color: 'gray',
  },
  emptyError: {
    color: 'red',
    margin: '0',
    visibility: 'hidden',
  },
  featuredIcon: {
    cursor: 'pointer',
    '&:hover': {
      color: '#11a250',
    }
  },
  featuredCommentText: {
    fontSize: '.875rem',
    fontWeight: '500', 
    backgroundColor: "green",
    borderRadius: "3px",
    color: "white",
    padding: "0 3px",
    cursor: "text",
    alignSelf: "center",
  },
  seeMore: {
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    }
  },
  actionOnCommentCard: {
    width: "100%",
    display: 'flex',
    marginTop: '.5rem',
    justifyContent: 'flex-end',
    alignItems: 'center',
    '& button:first-child': {
      marginRight: '.5rem',
    },
    '& button': {
      width: '54px',
    }
  }
});

const CommentCard = ({comment}) => {
  const {
    content: {text, likeUsers, dislikeUsers, username},
    id: commentId,
    deal_id: dealId,
    user_id,
    user_info,
    user_username,
    created_at,
    updated_at,
    parent_id,
    is_featured,
    user_point,
    user_role,
  } = comment;
  const userInfo = {
    id: user_id,
    info: user_info,
    username: user_username,
  }
  const classes = useStyles();
  const commonClasses = useCommonStyles();
  const currentUser = useSelector(currentUserSelector);
  const [isShowingDeleteModal, setIsShowingDeleteModal] = useState(false);
  const [isShowingReportCommentModal, setIsShowingReportCommentModal] = useState(false);
  const [isShowingConfirmFeaturedCommentModal, setIsShowingConfirmFeaturedCommentModal] = useState(false);

  const isOwner = currentUser && currentUser.id === userInfo.id;
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(text);
  const [reportContent, setReportContent] = useState('');
  const dispatch = useDispatch();
  const replyCommentId = useSelector(replyCommentIdSelector);
  const likeCurrentUserId = likeUsers.map((item) => item.userId);
  const likeCurrentUserStatus = likeCurrentUserId.includes(currentUser.id);
  const dislikeCurrentUserId = dislikeUsers.map((item) => item.userId);
  const dislikeCurrentUserStatus = dislikeCurrentUserId.includes(currentUser.id);

  const reportedComments = useSelector(selectedDealReportedCommentsSelector(commentId));
  const is_reportedUserId = reportedComments && reportedComments.map((i) => i.user_id);
  const reportedStatus = is_reportedUserId && is_reportedUserId.includes(currentUser.id);

  const [liked, setLiked] = useState(false);
  const [disLiked, setDisLiked] = useState(false);
  const [reported, setReported] = useState(false);
  const likeAmount = likeUsers.length;
  const dislikeAmount = dislikeUsers.length;
  const reportAmount = reportedComments ? reportedComments.length : 0;

  // user reported this comment before
  const oldReportContent = reportedComments.filter((i) => i.user_id === currentUser.id)[0]
  
  const childrenComments = useSelector(childrenCommentsSelector(commentId));

  const isAdminOrMod = hasModeratorPermission(currentUser.role);
  const isAdminOrEditor = hasEditorPermission(currentUser.role);
  const [isShowingScoreModal, setIsShowingScoreModal] = useState(false);

  const displayingContent = text.length < 300 ? text : `${text.substring(0, 300)}... `
  const [seeMoreContent, setSeeMoreContent] = useState(false)
  useEffect(() => {
      setStatus(text)
      setLiked(likeCurrentUserStatus);
      setDisLiked(dislikeCurrentUserStatus);
      setReported(reportedStatus);
  }, [likeCurrentUserStatus, dislikeCurrentUserStatus, reportedStatus, text])
  
  const cancelEdit = () => {
    setIsEditing(false);
    setStatus(text);
  }
  const confirmEdit = () => {
    const newComment = {
      id: commentId,
      content: {text: status, likeUsers, dislikeUsers, username }
    };
    dispatch(editComment(dealId, newComment));
    setIsEditing(false);
  }

  const onCommentKeyDown = (e) => {
    const keyCode = e.which || e.keyCode;
    if (keyCode === 27) {
      setIsEditing(false);
      return;
    }
    if (keyCode === 13 && !e.shiftKey) {
      e.preventDefault();
      confirmEdit()
    }
  };

  const onClickActionOnComment = (type) => {
    if (currentUser.id) {
      if (type === 'like') {
        dispatch(setLikeComment(commentId, liked ? false : true, currentUser.id));  
        setLiked(!liked);
        setDisLiked(false);
      }
      else if (type === 'dislike') {
        dispatch(setDisLikeComment(commentId, disLiked ? false : true, currentUser.id)); 
        setDisLiked(!disLiked);
        setLiked(false);
      }
      else {
        if (currentUser && currentUser.id !== userInfo.id && !isAdminOrMod)
          setIsShowingReportCommentModal(true);
      }
    }
    else {
      window.location.href=`${DEALBEE_PATHS.login}?required=true`;
      //dispatch(openErrorMessageModal(true));
    }
   
  }

  const textInput = useRef(null);
  const onEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (textInput.current) {
        textInput.current.focus();
        textInput.current.selectionStart = textInput.current.value.length;
        textInput.current.selectionEnd = textInput.current.value.length;
      }
    }, 100);
  };

  const renderIcon = (content) => {
    const { icon, type, count, status, tooltipText} = content;
    return(
      <div style={{
        display: 'flex', 
        minWidth: '45px',
        // pointerEvents: type === "report" && currentUser && currentUser.id === userInfo.id 
        //   ? "none" : ""
      }}>
          <Tooltip content={tooltipText}>
            <FontAwesomeIcon
              icon={icon}
              className={classes.formatIcon}
              onClick={() => onClickActionOnComment(type)}
              style={{
                color: status ? ICON_HIGHLIGHTED_COLORS[type] : '',
              }}
            />
          </Tooltip>
          <div style={{color: 'gray'}}>{count}</div>
      </div>
    );
  }

  const tooltipText = currentUser && currentUser.id === userInfo.id 
                    ? reportAmount > 0
                      ? `Bình luận của bạn đã bị báo cáo ${reportAmount} lần`
                      : 'Bình luận của bạn chưa bị báo cáo'
                    : isAdminOrMod 
                      ? `Bình luận này đã bị báo cáo ${reportAmount} lần`
                      : !reported ? 'Báo cáo vi phạm' : 'Bạn đã báo cáo bình luận này'
  const renderCommentText = () => {
    const seeMoreText = seeMoreContent ? "Ẩn chi tiết" : "Xem thêm"
    return(
      <div
        style={{marginTop: "0.5rem"}}
        className={commonClasses.paragraph}
      >
        {seeMoreContent ? `${text} ` : displayingContent}
        {text.length >= 300 && 
          <b className={classes.seeMore} onClick={() => setSeeMoreContent(!seeMoreContent)}>{seeMoreText}</b>
        }
      </div>
    );
  }
  const renderCommentContent = () => (
    <div className={classes.commentLayout}>
      <div style={{display: 'flex'}}>
        <div className={commonClasses.commentContentContainer}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <div>
              <a
                className={commonClasses.commentOwnerName}
                href={getLinkToProfile(username)}
                target="_blank"
                rel="noreferrer"
              >
                {userInfo.info.displayName}
              </a>
             
              <div
                className={`${commonClasses.userLevel} ${commonClasses.nonBgUserLevel}`}
              >
                <UserLevelLabel role={user_role} point={user_point} onClick={() => setIsShowingScoreModal(true)} />
              </div>
            </div>

            {!isAdminOrMod && is_featured && <div className={classes.featuredCommentText}>Bình luận nổi bật</div>}

          </div>
          {renderCommentText()}
        </div>
      </div>
      <div className={classes.action}>
        {renderIcon({icon: faThumbsUp, type: 'like', count: likeAmount, status: liked, tooltipText: 'Thích'})}
        {renderIcon({icon: faThumbsDown, type: 'dislike', count: dislikeAmount, status: disLiked, tooltipText: 'Không thích'})}
        {renderIcon({icon: faFlag, type: 'report', count: reportAmount, status: reported, tooltipText})}
        {renderOwnerOptions()}
        
        <Tooltip content={getTimeLabel(created_at)} className={classes.editedText}>
          <div className={classes.formatHour}>
              {getTimeAgoLabel(created_at)}  
          </div>
        </Tooltip>       
       
        {created_at !== updated_at && <div className={classes.editedText}>Đã chỉnh sửa</div>}
        
      </div>
    </div>
    
  );


  const onDeleteClicked = () => {
    setIsShowingDeleteModal(true);
  };

  const onClickToReplyComment = () => {
    if (currentUser.id) {
      if (childrenComments.length === 0) dispatch(getChildrenCommentByCommentId(commentId))
      dispatch(updateReplyCommentId(commentId === replyCommentId ? null : commentId))
    } else {
      //dispatch(openErrorMessageModal(true));
      window.location.href=`${DEALBEE_PATHS.login}?required=true`;
    }
  }
  const renderOwnerOptions = () => (
    <div style={{display: 'flex'}}>
      {parent_id === null &&
        <div
          className={classes.actionLabel}
          onClick={onClickToReplyComment}
        >
          Trả lời
        </div>
      }
      {(isOwner || isAdminOrMod) &&
        <div
          className={classes.actionLabel}
          onClick={() => onEditing()}
        >
          Sửa
        </div>
      }
      {(isOwner || isAdminOrMod) && 
        <div
          className={classes.actionLabel}
          onClick={() => onDeleteClicked()}
        >
          Xóa
        </div>
      }
      
    </div>
  );

  const renderTextInput = () => (
    <div style={{width: "100%"}}>
      <TextArea
        onChange={(e) => setStatus(e.target.value)}
        onKeyDown={(e) => onCommentKeyDown(e)}
        value={status}
        resize="smart"
        ref={textInput}
        css={TEXT_INPUT_CUSTOM_STYLE}
        maxLength={INPUT_LENGTHS.comment.max}
      />
      <div className={classes.actionOnCommentCard}>
          {/* <i style={{fontSize: "0.75rem", opacity: 0.7}}>Nhấn Esc để hủy</i> */}
          <div>
            <Button spacing="compact" onClick={cancelEdit}>Hủy</Button>
            <Button spacing="compact" appearance="primary" onClick={confirmEdit} isDisabled={status === "" && true}>Gửi</Button>
          </div>
      </div>
    </div>
  );

  const closeConfirmModal = () => {
    if (isShowingReportCommentModal) {
      setIsShowingReportCommentModal(false);
    }
  };

  const confirmReport = () => {
    const content = {
      commentId,
      userId: currentUser.id,
      reportContent,
      dealId,
    }
    dispatch(reportComment(content, comment));
    closeConfirmModal(); 
  }
  const renderOldReportComment = () => {
    return (
      <div style={{paddingBottom: '24px'}}>
        <div style={{paddingBottom: '.5rem'}}>
            <span style={{fontWeight: "500"}}>Vào: </span> 
            {getTimeLabel(oldReportContent.reported_at)}</div>
        <div>
          <span style={{fontWeight: "500"}}>Nội dung báo cáo: </span>
          {oldReportContent.report_content}
        </div>
      </div>
    );
  }
  
  const renderReportCommentModal = () => {
    return (
      <Modal
        width="small"
        actions={!reported && [{ text: 'Hủy', onClick: closeConfirmModal, appearance: "subtle" }, { text: 'Gửi báo cáo', onClick: confirmReport, appearance: "warning", isDisabled: !reportContent || !reportContent.trim() }]}
        onClose={closeConfirmModal}
        heading={reported ? "Bạn đã báo cáo bình luận này " : "Báo cáo bình luận"}
        appearance="warning"
        >
          {reported 
            ? renderOldReportComment()
            : (
              <div>
                Nội dung báo cáo
                <TextArea 
                  minimumRows={3}
                  maxLength={INPUT_LENGTHS.reportContent.max}
                  value={reportContent} 
                  onChange={(e) => setReportContent(e.target.value)} 
                  css={TEXT_INPUT_CUSTOM_STYLE}
                />
              </div>
            )
          }
      </Modal>
    )
  }

  const openFeaturedCommentStatusModal = () => {
    setIsShowingConfirmFeaturedCommentModal(true)
  }

  return (
    <div className={commonClasses.commentCard} style={{marginBottom: isEditing ? '1rem' : ''}}>
      <a className={commonClasses.userAvatar} href={getLinkToProfile(username)} target="_blank" rel="noreferrer">
        <Avatar size={parent_id !== null ? 'medium': 'large'} src={user_info.avatarUrl} target="_blank"/>
      </a>

      {!isEditing ? renderCommentContent() : renderTextInput()}

      {!isEditing && isAdminOrMod && isAdminOrEditor && parent_id === null &&
        <Tooltip content={is_featured ? "Hủy đánh dấu bình luận nổi bật" : 'Đánh dấu bình luận nổi bật'}>
          <FontAwesomeIcon
            icon={faBahai}
            className={classes.featuredIcon}
            style={{color: is_featured && '#11a250'}}
            onClick={openFeaturedCommentStatusModal}
          />
        </Tooltip>
      }
      <ModalTransition>
        {isShowingDeleteModal && 
          <ConfirmDeleteCommentModal
            setIsShowingDeleteModal={setIsShowingDeleteModal}
            commentId={commentId}
            username={userInfo.username}
          />}
        {isShowingReportCommentModal && renderReportCommentModal()}

        {isShowingConfirmFeaturedCommentModal &&
        <ConfirmFeaturedCommentModal
          onClose={setIsShowingConfirmFeaturedCommentModal}
          isFeatured={is_featured}
          commentId={commentId}
          currentUserId={currentUser.id}
        />}

        {isShowingScoreModal && (
          <ScoreInfoModal onClose={() => setIsShowingScoreModal(false)} />
        )}
      </ModalTransition>      
    </div>
  );
};

export default CommentCard;
