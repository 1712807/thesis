import React from 'react';
import { createUseStyles } from 'react-jss';
import { logIn, signUp, resetValidation } from '../../../redux/users/action';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import LoadingButton from '@atlaskit/button/loading-button';   
import { accountValidationSelector, currentUserSelector, isGettingCurrentUserSelector } from '../../../selectors/usersSelector';
import { useCommonStyles } from '../../../services/utils/common_classes';
import RegisterFields from '../../common/text_fields/RegisterFields';
import { isInvalidUserInfo, validateAccount } from '../../../services/utils/common';
import { ModalTransition } from '@atlaskit/modal-dialog';
import ResetPasswordModal from './ResetPasswordModal';
import { DEALBEE_PATHS } from '../../../services/utils/constant';

const RegisterPage = (props) => {
    const { tab } = props;
    const isSignup = tab === "dang-ky";
    const classes = useStyles();
    const commonClasses = useCommonStyles();
    const dispatch = useDispatch();

    const [isShowingResetPwdModal, setIsShowingResetPwdModal] = useState(false);
    const [user, setUser] = useState({
        displayName: "",
        username: "",
        email: "",
        password: "",
    })
    const {username, password, email, displayName} = user;

    const isSigning = useSelector((state) => state.users.isSigning);
    const accountValidation = useSelector(accountValidationSelector);
    const validation = validateAccount(accountValidation);
    const searchParams = new URLSearchParams(window.location.search);
    const isRequired = searchParams.get("required");

    const currentUser = useSelector(currentUserSelector);
    const isGettingCurrentUser = useSelector(isGettingCurrentUserSelector);
    if (!isSigning && !isGettingCurrentUser && currentUser && currentUser.id && (window.location.pathname === DEALBEE_PATHS.login || window.location.pathname === DEALBEE_PATHS.signup)) {
        window.location.href = "/";
        return ''
    }

    const onTabChanged = (tab) => {
        window.location.href = `/${tab}`
    }

    const onSignUpClicked = () => {
        const newUser = {
            username,
            password,
            email,
            info: {displayName: displayName || username}
        }
        dispatch(signUp(newUser));
    }

    const onLogInClicked = () => {
        const userInfo = {
            username,
            password,
        }
        dispatch(logIn(userInfo));
    }

    const onSubmit = () => {
        if (isInvalidUserInfo(user, { isSignup })) return;
        if (isSignup) onSignUpClicked();
        else onLogInClicked();
    }

    const renderHeader = () => (
        <div className={commonClasses.formHeader}>
            <h3>
                {isSignup 
                    ? "Gia nhập Dealbee"
                    : "Đăng nhập"
                }
            </h3>
            {isRequired &&
                <p 
                    className={commonClasses.asterisk}
                    style={{margin: 'auto', textAlign: 'center', fontSize: "0.875rem"}}
                >
                    Bạn cần đăng nhập để tương tác trên Dealbee!
                </p>
            }
        </div>
    );

    const renderBody = () => (
        <div>
            <RegisterFields 
                tab={tab}
                user={user}
                onChange={(value) => {
                    setUser(value);
                    if (validation !== "valid") dispatch(resetValidation())
                }}
                validation={validation}
                onSubmit={onSubmit}
            />
            {!isSignup && (
                <div 
                    className={classes.passwordForgotLabel} 
                    onClick={() => {
                        setIsShowingResetPwdModal(true);
                        dispatch(resetValidation())
                    }}
                >
                    Quên mật khẩu
                </div>
            )}
        </div>
    );

    const renderFooter = () => (
        <div className={classes.formFooter}>
            <LoadingButton
                appearance="primary" 
                onClick={onSubmit}
                className={classes.submitBtn}
                isLoading={isSigning}
                isDisabled={isInvalidUserInfo(user, {isSignup})}
            >
                {!isSignup ? "Đăng nhập" : "Đăng ký"}
            </LoadingButton>
            <div className={classes.alternativeOption}>
                {isSignup 
                    ? "Bạn đã có tài khoản?"
                    : "Bạn chưa có tài khoản?"                     
                }
                &nbsp;
                {isSignup 
                    ? <span onClick={() => onTabChanged("dang-nhap")}>Đăng nhập</span>
                    : <span onClick={() => onTabChanged("dang-ky")}>Đăng ký</span>
                }
            </div>
        </div>
    )

    return (
        <div style={{display: "flex", justifyContent: "center"}}>
            <div className={commonClasses.formContainer}>
                {renderHeader()}
                {renderBody()}
                {renderFooter()}
            </div>
            <ModalTransition>
                {isShowingResetPwdModal && <ResetPasswordModal onClose={() => setIsShowingResetPwdModal(false)}/>}
            </ModalTransition>
        </div>
    );
};

const useStyles = createUseStyles({
    formFooter: {
        width: "100%",
        marginTop: "0.5rem",
        textAlign: "center",
    },
    submitBtn: {
        width: "100% !important",
    },
    alternativeOption: {
        marginTop: "0.5rem",
        fontSize: "0.9rem",
        "& span": {
            cursor: "pointer",
            color: "rgb(4, 135, 229)",
            "&:hover": {
                textDecoration: "underline",
            }
        }
    },
    passwordForgotLabel: {
        // display: "flex", 
        // justifyContent: "flex-end", 
        float: "right",
        marginTop: 0,
        marginBottom: "0.75rem",
        fontSize: "0.8rem",
        cursor: "pointer",
        color: "rgb(4, 135, 229)",
        "&:hover": {
            color: "rgb(3 121 206)",
        }
    }
})

export default RegisterPage;