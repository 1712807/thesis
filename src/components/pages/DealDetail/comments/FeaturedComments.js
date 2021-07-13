import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useCommonStyles } from '../../../../services/utils/common_classes';
import { getLinkToProfile, hasModeratorPermission } from '../../../../services/utils/common';
import Avatar from '@atlaskit/avatar';
import Tooltip from '@atlaskit/tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBahai } from '@fortawesome/free-solid-svg-icons';
import ConfirmFeaturedCommentModal from './ConfirmFeaturedCommentModal';
import { currentUserSelector } from '../../../../selectors/usersSelector';
import UserLevelLabel from '../../../common/components/UserLevelLabel';
import ScoreInfoModal from '../../../common/modals/ScoreInfoModal';

const FeaturedComments = (props) => {
  const { list } = props;
  const commonClasses = useCommonStyles();
  const [isShowingConfirmFeaturedCommentModal, setIsShowingConfirmFeaturedCommentModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const currentUser = useSelector(currentUserSelector);
  const isAdminOrMod = hasModeratorPermission(currentUser.role);
  const [isShowingScoreModal, setIsShowingScoreModal] = useState(false)
  const renderCommentContent = (comment) => {
    const {
      id,
      user_info,
      content: {text, username},
      user_role,
      user_point,
    } = comment
    return (
      <div key={id} className={commonClasses.commentCard}>

        <a className={commonClasses.userAvatar} href={getLinkToProfile(username)} target="_blank" rel="noreferrer">
          <Avatar size='large' src={user_info.avatarUrl} />
        </a>
        
        <div className={commonClasses.commentContentContainer}>
          <a className={commonClasses.commentOwnerName} href={getLinkToProfile(username)} target="_blank" rel="noreferrer">{user_info.displayName}</a>
          <div className={`${commonClasses.userLevel} ${commonClasses.nonBgUserLevel}`}>
            <UserLevelLabel role={user_role} point={user_point} onClick={() => setIsShowingScoreModal(true)} />
          </div>
          <div>{text}</div>
        </div>

        {isAdminOrMod && 
        <Tooltip content={"Hủy đánh dấu bình luận nổi bật"}>
          <FontAwesomeIcon
            icon={faBahai}
            style={{color: '#11a250', cursor: 'pointer'}}
            onClick={() => {
              setSelectedComment(comment.id)
              setIsShowingConfirmFeaturedCommentModal(true)
            }}
          />
        </Tooltip>}

        
      </div>
    );
  }
  return (
    <div>
      <h3 style={{marginTop: '1rem', marginBottom: '.5rem'}}>Bình luận nổi bật</h3>
      {list.map((item) => renderCommentContent(item))}
      {isShowingConfirmFeaturedCommentModal &&
          <ConfirmFeaturedCommentModal
            onClose={() => {
              setIsShowingConfirmFeaturedCommentModal(false)
              setSelectedComment(null)
            }}
            isFeatured={true}
            commentId={selectedComment}
            currentUserId={currentUser.id}
          />}
      {isShowingScoreModal && (
        <ScoreInfoModal onClose={() => setIsShowingScoreModal(false)} />
      )}
    </div>
  );
}

export default FeaturedComments;