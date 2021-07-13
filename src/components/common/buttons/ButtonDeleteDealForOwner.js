import Button from "@atlaskit/button";
import Modal, { ModalTransition } from "@atlaskit/modal-dialog";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { deletePendingDeal } from "../../../redux/deals/action";

const ButtonDeleteDealForOwner = (props) => {
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);

    const {dealId} = props;
    const onDeleteConfirmed = () => {
        dispatch(deletePendingDeal(dealId));
        closeModal();
    }

    const closeModal = () => {
        setIsOpen(false);
    }

    return (
        <div>
            <Button appearance="warning" onClick={() => setIsOpen(true)}>
                Xóa
            </Button>

            <ModalTransition>
                {isOpen && 
                    <Modal
                        width="small"
                        actions={[
                            { text: 'Hủy', appearance: "subtle", onClick: closeModal },
                            { text: 'Xác nhận', appearance: "warning", onClick: onDeleteConfirmed }, 
                        ]}
                        onClose={closeModal}
                        heading="Xóa deal đã chọn?"
                        appearance="warning"
                    >
                        Bạn sẽ không thể hoàn tác hành động này.
                    </Modal>
                }
            </ModalTransition>
        </div>
    )
}

export default ButtonDeleteDealForOwner;