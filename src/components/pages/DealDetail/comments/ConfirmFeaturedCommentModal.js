import React from 'react';
import { useDispatch } from 'react-redux';
import Modal from '@atlaskit/modal-dialog';
import { updateFeaturedCommentStatus } from '../../../../redux/deals/action';

const ConfirmFeaturedCommentModal = (props) => {
  const {
    onClose,
    isFeatured,
    commentId,
    currentUserId,
  } = props;
  const dispatch = useDispatch()

  const closeConfirmModal = () => {
    onClose();
  }

  const confirmFeatured = () => {
    dispatch(updateFeaturedCommentStatus(commentId, currentUserId, isFeatured ? false : true))
    closeConfirmModal();
  }
  return (
    <Modal
      width="small"
      actions={[
        { text: 'Hủy', onClick: closeConfirmModal, appearance: "subtle" },
        { text: 'Xác nhận', onClick: confirmFeatured, appearance: isFeatured ? 'warning' : "primary" } 
      ]}
      onClose={closeConfirmModal}
      heading={isFeatured ?  'Hủy đánh dấu bình luận nổi bật?' : 'Đánh dấu đây là bình luận nổi bật?'}
      appearance={isFeatured && 'warning'}
      >
    </Modal>
  )
};

export default ConfirmFeaturedCommentModal;