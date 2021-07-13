import React from "react";
import Modal from "@atlaskit/modal-dialog";

const IgnoreReportModal = (props) => {
  const {reportType, onClose, onConfirm, additionalAction} = props;
  const onActionConfirmed = () => {
    onConfirm();
    if (additionalAction) additionalAction();
  }
  
  return (
    <Modal
      actions={[
          { text: 'Hủy', onClick: onClose, appearance: "subtle" },
          { text: 'Xác nhận', onClick: onActionConfirmed, appearance: "warning" },
      ]}
      onClose={onClose}
      heading="Bỏ qua báo cáo này?"
      width="small"
    >
      {reportType === "comment" 
        ? "Bình luận sẽ được giữ lại."
        : "Deal sẽ không bị thay đổi."
      }
    </Modal>
  )
}

export default IgnoreReportModal;