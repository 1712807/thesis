import React, { useState } from "react";
import RegisterFields from "../../common/text_fields/RegisterFields";
import Modal, { ModalFooter } from "@atlaskit/modal-dialog";
import { useDispatch, useSelector } from "react-redux";
import Button, { LoadingButton } from "@atlaskit/button";
import { resetPassword } from "../../../redux/users/action";
import { useCommonStyles } from "../../../services/utils/common_classes";
import { createUseStyles } from "react-jss";
import UserBlockedMessage from "../../common/components/UserBlockedMessage";

const ResetPasswordModal = (props) => {
  const {onClose} = props;
  const [user, setUser] = useState({
      displayName: "",
      username: "",
      email: "",
      password: "",
  })
  const { username, email } = user;
  const isDisabled = !(username && username.trim() && email && email.trim());

  const state = useSelector((state) => state.users.resetRequestState);
  const isDone = state === "success";

  const dispatch = useDispatch();
  const classes = useStyles();
  const commonClasses = useCommonStyles();

  const onSubmit = () => {
    if (isDisabled) return;
    dispatch(resetPassword(username, email))
  }

  const CustomFooter = (props) => (
    <ModalFooter {...props}>
      <div className={classes.footer}>
        <div className={classes.cancelBtn}>
          <Button appearance="subtle" onClick={onClose}>Hủy</Button>
        </div>
        <LoadingButton
          isLoading={state === "reseting"}
          appearance="primary"
          onClick={() => {
            if (isDone) onClose();
            else onSubmit();
          }}
          isDisabled={isDisabled}
        >
          {isDone ? "Đóng" : "Nhận mật khẩu mới qua email"}
        </LoadingButton>
      </div>
    </ModalFooter>
  )
  return (
    <Modal
      width="small"
      heading="Làm mới mật khẩu"
      onClose={onClose}
      components={{
        Footer: CustomFooter,
      }}
    >
      {isDone 
        ? <div>Mật khẩu của bạn đã được làm mới! <br/>Vui lòng kiểm tra email <span style={{fontWeight: "500"}}>{email}</span> để xác nhận mật khẩu mới.</div>
        : <div>
            <div style={{marginBottom: "0.25rem"}}>
              Vui lòng nhập tên đăng nhập và email của bạn:
            </div>
            <RegisterFields 
              tab="doi-mat-khau"
              user={user}
              validation="valid"
              onChange={(value) => setUser(value)}
              onSubmit={onSubmit}
            />
            
            {state === "user_not_found" && (
              <div className={commonClasses.asterisk}>Không tìm thấy tài khoản tương ứng. Vui lòng thử lại!</div>
            )}
            {state.indexOf("user_blocked") >= 0 && <UserBlockedMessage reason={state.slice(12, state.length)}/>}
          </div>
      }
    </Modal>
  )
}

const useStyles = createUseStyles({
  footer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    "@media screen and (max-width: 480px)": {
      justifyContent: "flex-end",
    }
  },
  cancelBtn: {
    display: "none",
    "@media screen and (max-width: 480px)": {
      display: "block",
      marginRight: "1rem",
    },
  }
})

export default ResetPasswordModal;