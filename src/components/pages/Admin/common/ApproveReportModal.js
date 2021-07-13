import React from "react";
import Modal from "@atlaskit/modal-dialog";
import { getTimeRemainingLabel } from '../../../../services/utils/common';

const ApproveReportModal = (props) => {
  const {reportType: type, onClose, onConfirm, expiredAt, additionalAction} = props;

  const onActionConfirmed = () => {
    onConfirm();
    if (additionalAction) additionalAction()
  }

  return (
    <Modal
      actions={[
          { text: 'Hủy', onClick: onClose, appearance: "subtle" },
          { text: 'Xác nhận', onClick: onActionConfirmed, appearance: "warning" },
      ]}
      onClose={onClose}
      heading={type === "comment" 
        ? "Xác nhận bình luận vi phạm"
        : "Xác nhận deal hết hạn"
      }
      width="small"
      appearance={type === "comment" ? "danger" : "warning"}
    >
      {type === "comment" 
        ? "Bình luận sẽ bị xóa. Bạn không thể hoàn tác hành động này."
        : (expiredAt === null ? "Deal sẽ bị đánh dấu hết hạn."
          : <div>
              <p style={{margin: '0', color: 'tomato', fontWeight: '500'}}>Deal {getTimeRemainingLabel(expiredAt)}. </p>
              <p style={{margin: '0'}}>Bạn có muốn đánh dấu hết hạn không?</p>
            </div>
        )
      }
    </Modal>
  )
}

export default ApproveReportModal;