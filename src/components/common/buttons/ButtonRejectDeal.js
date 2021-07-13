import Button from "@atlaskit/button";
import Modal, { ModalTransition } from "@atlaskit/modal-dialog";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { reviewDeal } from "../../../redux/admin/action";

const ButtonRejectDeal = (props) => {
    const {deal, isDisabled} = props;
    const dispatch = useDispatch();
    const [isShowingConfirmModal, setIsShowingConfirmModal] = useState(false);

    const onRejectBtnClicked = () => {
        setIsShowingConfirmModal(true);        
    }

    const onConfirm = () => {
        dispatch(reviewDeal(deal, "rejected"))
        onClose();
    }

    const onClose = () => {
        setIsShowingConfirmModal(false);
    }

    return (
        <div>
            <Button appearance="warning" isDisabled={isDisabled} onClick={() => onRejectBtnClicked()}>
                Từ chối
            </Button>
            <ModalTransition>
            {isShowingConfirmModal && 
                <Modal 
                    actions={[
                        { text: 'Hủy', onClick: onClose, appearance: "subtle" },
                        { text: 'OK', onClick: onConfirm, appearance: "warning" },
                    ]}
                    onClose={onClose}
                    heading="Xác nhận từ chối deal"
                    width="small"
                    appearance="warning"
                >
                    Deal <span style={{fontWeight: "500"}}>{deal.info.title}</span> sẽ bị từ chối.
                    <br/><br/>
                    Các thay đổi của bạn (nếu có) sẽ được lưu khi thực hiện hành động này.
                </Modal>
            }
        </ModalTransition>

        </div>
    )
}

export default ButtonRejectDeal;