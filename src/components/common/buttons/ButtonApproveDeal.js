import Button from "@atlaskit/button";
import Modal, { ModalTransition } from "@atlaskit/modal-dialog";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { reviewDeal } from "../../../redux/admin/action";
import { currentUserSelector } from "../../../selectors/usersSelector";
import { hasEditorPermissionOnCategory } from "../../../services/utils/common";

const ButtonApproveDeal = (props) => {
    const {deal, isDisabled} = props;
    const dispatch = useDispatch();

    const [isShowingConfirmModal, setIsShowingConfirmModal] = useState(false);
    const currentUser = useSelector(currentUserSelector);
    const hasPermission = hasEditorPermissionOnCategory(currentUser, deal.category);

    const onApproveBtnClicked = () => {
        setIsShowingConfirmModal(true);        
    }

    const onConfirm = () => {
        dispatch(reviewDeal(deal, "approved"));
        onClose();
    }

    const onClose = () => {
        setIsShowingConfirmModal(false);
    }

    return (
        <div>
            <Button 
                appearance="primary" 
                isDisabled={isDisabled}
                onClick={() => onApproveBtnClicked()}
            >
                Đăng
            </Button>
            <ModalTransition>
                {isShowingConfirmModal && 
                    <Modal 
                        actions={[
                            { text: 'Hủy', onClick: onClose, appearance: "subtle" },
                            { text: 'OK', onClick: onConfirm, appearance: hasPermission ? "primary" : "warning" },
                        ]}
                        onClose={onClose}
                        heading="Xác nhận đăng deal"
                        width="small"
                        appearance={hasPermission ? "" : "warning"}
                    >
                        {!hasPermission && <span>Bạn <b style={{color: "tomato"}}>không thể</b> đăng deal trong ngành hàng đã chọn! </span>}
                        Deal <span style={{fontWeight: "500"}}>{deal.info.title}</span> sẽ {hasPermission ? "được đăng." : "tiếp tục phải đợi biên tập viên khác duyệt."}
                        <br/><br/>
                        Các thay đổi của bạn (nếu có) sẽ được lưu khi thực hiện hành động này.
                    </Modal>
                }
            </ModalTransition>
        </div>
    )
}

export default ButtonApproveDeal;