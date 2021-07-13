import React from "react";
import { useDispatch } from "react-redux";
import { reviewDeal } from "../../../../redux/admin/action";
import Modal from "@atlaskit/modal-dialog";

const ModalConfirmDelete = (props) => {
    const {deal, onClose} = props;
    const dispatch = useDispatch();

    const onConfirm = () => {
        dispatch(reviewDeal(deal, "rejected"));
        onClose();
    }

    return (
        <Modal
            actions={[
                { text: 'Hủy', onClick: onClose, appearance: "subtle" },
                { text: 'Xác nhận', onClick: onConfirm, appearance: "danger" },
            ]}
            onClose={onClose}
            heading={`Xác nhận gỡ deal`}
            appearance="danger"
            width="small"
        >
              Bạn chắc chắn muốn gỡ deal <span style={{fontWeight: "500"}}>{deal.info.title}</span>?
        </Modal>
    )
}

export default ModalConfirmDelete;