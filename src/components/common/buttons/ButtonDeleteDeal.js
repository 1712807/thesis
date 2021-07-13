import Button from "@atlaskit/button";
import Modal, { ModalTransition } from "@atlaskit/modal-dialog";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { reviewDeal } from "../../../redux/admin/action";

const ButtonDeleteDeal = (props) => {
    const {deal, additionalAction} = props;
    const dispatch = useDispatch();
    const [isShowingConfirmModal, setIsShowingConfirmModal] = useState(false);

    const onDeleteBtnClicked = () => {
        setIsShowingConfirmModal(true);        
    }

    const onConfirm = () => {
        dispatch(reviewDeal(deal, "rejected"));
        if (additionalAction) additionalAction();
        onClose();
    }

    const onClose = () => {
        setIsShowingConfirmModal(false);
    }

    return (
        <div>
            <Button appearance="danger" onClick={() => onDeleteBtnClicked()}>
            Gỡ deal
        </Button>
        <ModalTransition>
            {isShowingConfirmModal && 
                <Modal 
                    actions={[
                        { text: 'Hủy', onClick: onClose, appearance: "subtle" },
                        { text: 'Xác nhận', onClick: onConfirm, appearance: "danger" },
                    ]}
                    onClose={onClose}
                    heading="Xác nhận gỡ deal"
                    width="small"
                    appearance="danger"
                >
                    Deal <span style={{fontWeight: "500"}}>{deal.info.title}</span> sẽ bị gỡ.
                    <br/><br/>
                    Các thay đổi của bạn (nếu có) sẽ được lưu khi thực hiện hành động này.
                </Modal>
            }
        </ModalTransition>
        </div>
    )
}

export default ButtonDeleteDeal;