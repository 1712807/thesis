import React, { useState } from "react";
import Modal from "@atlaskit/modal-dialog";
import TextArea from "@atlaskit/textarea";
import { useDispatch } from "react-redux";
import { blockUser } from "../../../redux/admin/action";
import { TEXT_INPUT_CUSTOM_STYLE } from "../../../services/utils/constant";

const BlockUserModal = (props) => {
    const {onClose, user, isBlocking, additionalAction, additionalLabel} = props;
    const { id, info, username, blockedReason } = user;

    const displayName = (info && info.displayName)
        ? info.displayName 
        : username;
    const [reason, setReason] = useState('')

    const dispatch = useDispatch();
    const onUserBlocked = () => {
        dispatch(blockUser(id, isBlocking, reason));
        if (additionalAction) additionalAction();
        onClose();
    }

    return (
        <Modal
            onClose={onClose}
            actions={[
                { text: 'Hủy', appearance: "subtle", onClick: onClose },
                { 
                    text: isBlocking ? "Khóa" : "Mở khóa", 
                    appearance: isBlocking ? "warning" : "primary", 
                    onClick: onUserBlocked,
                    isDisabled: isBlocking && !(reason && reason.length >= 25)
                }
            ]}
            heading={`${isBlocking ? 'Khóa' : 'Mở khóa'} tài khoản @${username}?`}
            appearance={`${isBlocking ? 'warning' : ''}`}
        >
            <div style={{ marginBottom: "0.25rem" }}>
                <span style={{ fontWeight: "500" }}>
                    {isBlocking ? "Lý do:" : `Người dùng này đã bị khóa vì lý do: `}
                </span>
                {isBlocking ? (
                    <TextArea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="(25 - 500 ký tự)"
                        maxLength={500}
                        minimumRows={3}
                        isReadOnly={!isBlocking}
                        css={{...TEXT_INPUT_CUSTOM_STYLE, marginTop:"0.25rem"}}
                    />
                ) : (
                    <span>
                        {blockedReason}
                    </span>
                )}
            </div>
            {isBlocking && <span>
                {additionalLabel ? `${additionalLabel} và ` : ''}{`${displayName} ${isBlocking ? 'sẽ không thể đăng nhập vào Dealbee bằng tài khoản này nữa.' : ''}`}
            </span>}
        </Modal>
    )
}

export default BlockUserModal;