import React from 'react';
import { useDispatch } from 'react-redux';
import { openErrorMessageModal } from '../../../redux/deals/action';
import Modal, { ModalFooter,} from '@atlaskit/modal-dialog';
import { createUseStyles } from 'react-jss';
import { DEALBEE_PATHS } from '../../../services/utils/constant';

const useStyles = createUseStyles({
    loginButton: {
        borderRadius: '3px',
        padding: '7px 10px',
        cursor: 'pointer',
        background: '#0052CC',
        border: 'thin solid',
        fontWeight: '500',
        color: 'white',
        '&:hover' : {
            background: '#0065FF',
        }
    },
    cancelButton: {
        borderRadius: '3px',
        padding: '7px 10px',
        cursor: 'pointer',
        background: 'rgba(9, 30, 66, 0.04)',
        fontWeight: '500',
        '&:hover' : {
            background: 'rgba(9, 30, 66, 0.08)',
        }
    }
})
const LoginRequiredModal = () => {
    const dispatch = useDispatch();
    const classes = useStyles();
    const closeConfirmModal = () => {
        dispatch(openErrorMessageModal(false));
    }

    const confirmLogin = () => {
        window.location.href=DEALBEE_PATHS.login;
        closeConfirmModal();
    }

    const CustomFooter = (props) => {
        return (
          <ModalFooter {...props}>
                <div style={{display: 'flex', justifyContent: 'flex-end', width: '100%'}}>
                    <div style={{marginRight: "0.5rem"}} className={classes.cancelButton} onClick={closeConfirmModal}>
                        Hủy
                    </div>
                    <div onClick={confirmLogin} className={classes.loginButton}>
                        Đăng nhập
                    </div>
                </div>
          </ModalFooter>
        );
    };
    return (
        <Modal
              width="small"
              /* actions={[
                    { text: 'Hủy', onClick: closeConfirmModal, appearance: "subtle" },
                    { text: 'Đăng nhập', onClick: confirmLogin, appearance: "primary" }, 
                ]} */
              onClose={closeConfirmModal}
              heading="Thông báo"
              components={{
                Footer: CustomFooter,
              }}
              >
              Bạn cần đăng nhập để thực hiện chức năng này!
        </Modal>
    );
}

export default LoginRequiredModal;