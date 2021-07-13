import React, { useState, useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector, useDispatch } from 'react-redux';
import { currentUserSelector } from '../../../../selectors/usersSelector';
import { replyCommentIdSelector, childrenCommentsSelector } from '../../../../selectors/dealsSelectors';
import NewCommentCard from './NewCommentCard';
import CommentCard from './CommentCard';
import { getChildrenCommentByCommentId, hideAllReplyComments } from '../../../../redux/deals/action';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faReply } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from '../../../common/loaders/LoadingSpinner';


const useStyles = createUseStyles({
  numberOfChildren: {
    display: 'flex',
    "& > div:not(:last-child)": {
      marginRight: "0.5rem",
    },
    fontSize: '.8rem',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    }
  },
  viewRepliesIcon: {
    transform: 'rotate(180deg)',
  }
});

const CommentGroup = ({comment}) => {
  const {
    id: parentId,
    deal_id: dealId,
    number_of_children: numberOfChildren,
  } = comment;
  const classes = useStyles();
  const dispatch = useDispatch();
  const currentUser = useSelector(currentUserSelector);
  const replyCommentId = useSelector(replyCommentIdSelector);
  const childrenComments = useSelector(childrenCommentsSelector(parentId))
  const isLoadingChildrenComments = useSelector((state) => state.deals.isLoadingChildrenComments);

  const showViewMoreLabel = numberOfChildren > childrenComments.length && childrenComments.length !== 0;
  const showNumberOfChildren = numberOfChildren > 0 && childrenComments.length === 0;
  const remainingReplies = numberOfChildren - childrenComments.length;
  const showHideCommentLabel = childrenComments.length !== 0 && numberOfChildren == childrenComments.length
  const onClickToSeeReplies = () => {
    dispatch(getChildrenCommentByCommentId(parentId))
  }

  const onClickToHideReplyComments = () => {
    dispatch(hideAllReplyComments(childrenComments))
  }

  const renderNumberOfChildren = () => {
    return (
        <div className={classes.numberOfChildren}>
          {(showNumberOfChildren || showViewMoreLabel) && <div className={classes.viewRepliesIcon}>
            <FontAwesomeIcon icon={faReply} />
          </div>}
          {showNumberOfChildren && <div onClick={onClickToSeeReplies}>{numberOfChildren} trả lời</div>}
          {showViewMoreLabel && <div onClick={onClickToSeeReplies}>Xem thêm {remainingReplies} trả lời</div>}
          {showHideCommentLabel && <div onClick={onClickToHideReplyComments}>Ẩn trả lời</div>}
        </div>
    );
  }

  
  return (
    <div>
      <CommentCard comment={comment} />
      <div style={{marginLeft: '52px'}}>
        {replyCommentId === parentId && <NewCommentCard dealId={dealId} currentUser={currentUser} parentId={parentId} isReply={true} /> }
        {childrenComments && childrenComments.map((item) => <CommentCard key={item.id} comment={item} />)}
        {renderNumberOfChildren()}
        {isLoadingChildrenComments === parentId && <LoadingSpinner />}
      </div>
    </div>
  );
};

export default CommentGroup;
