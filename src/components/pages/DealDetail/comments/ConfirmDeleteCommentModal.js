import React from 'react';
import { useDispatch } from 'react-redux'
import Modal from '@atlaskit/modal-dialog';
import { deleteComment } from '../../../../redux/deals/action';

const ConfirmDeleteCommentModal = (props) => {
  const { setIsShowingDeleteModal, commentId, username } = props;
  const dispatch = useDispatch();
  const closeConfirmModal = () => {
    setIsShowingDeleteModal(false);
  };

  const confirmDelete = () => {
    dispatch(deleteComment(commentId, username));
    closeConfirmModal();
  };
  return (
    <Modal
      width="small"
      actions={[
        { text: 'Hủy', onClick: closeConfirmModal, appearance: "subtle" },
        { text: 'Xác nhận', onClick: confirmDelete, appearance: "warning" } 
      ]}
      onClose={closeConfirmModal}
      heading="Xóa bình luận?"
      appearance="warning"
      >
      Bạn sẽ không thể hoàn tác hành động này.
    </Modal>
  )
};

export default ConfirmDeleteCommentModal;