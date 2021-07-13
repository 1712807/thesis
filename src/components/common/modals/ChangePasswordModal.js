import React from 'react';
import { createUseStyles } from 'react-jss';
import Modal from '@atlaskit/modal-dialog';
import { useDispatch, useSelector } from 'react-redux';
import Textfield from '@atlaskit/textfield';
import { useState } from 'react';
import { accountValidationSelector, currentUserSelector } from '../../../selectors/usersSelector';
import { changePassword, stopChangingPassword } from '../../../redux/users/action';
import { useEffect } from 'react';
import { useCommonStyles } from '../../../services/utils/common_classes';
import { INPUT_LENGTHS, TEXT_INPUT_CUSTOM_STYLE } from '../../../services/utils/constant';
import { isInvalidPassword } from '../../../services/utils/common';

const ChangePasswordModal = () => {
    const classes = useStyles();
    const commonClasses = useCommonStyles();
    const dispatch = useDispatch();

    const currentUser = useSelector(currentUserSelector);
    
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordConfirmed, setPasswordConfirmed] = useState('');
    const [passwordValidation, setPasswordValidation] = useState('valid');

    const accountValidation = useSelector(accountValidationSelector);
    let validation = "valid";
    if (accountValidation !== "valid") {
        const index = accountValidation.indexOf(' ');
        const type = accountValidation.slice(0, index);
        const err = accountValidation.slice(index + 1, accountValidation.length);
        if (type === "password") validation = err;
    }

    useEffect(() => {
        setPasswordValidation(validation);
    }, [accountValidation])

    const closeModal = () => {
        dispatch(stopChangingPassword())
    }

    const saveChanges = () => {
        dispatch(changePassword(currentUser.id, password, newPassword))
    }

    const onSubmit = () => {
        if (!password) {
            setPasswordValidation("not_auth");
            return;
        }
        if (!newPassword) {
            setPasswordValidation("new_empty");
            return;
        }
        if (!passwordConfirmed) {
            setPasswordValidation("not_confirmed");
            return;
        }
        if (newPassword !== passwordConfirmed) {
            setPasswordValidation("not_match");
            return;
        }
        if (inputIsInvalid) return;
        saveChanges();
        // closeModal();
    }

    const onTextFieldKeyDown = (e) => {
        const keyCode = e.which || e.keyCode;
        if (keyCode === 13) //enter pressed
            onSubmit();
    }

    const getPasswordValidationMessage = () => {
        switch (passwordValidation) {
            case "not_auth": 
                return "Vui lòng nhập mật khẩu cũ để xác nhận đó là bạn!"
            case "wrong":
                return "Mật khẩu không đúng. Vui lòng xác nhận lại!"
            case "new_empty": 
                return "Vui lòng nhập mật khẩu mới!"
            case "not_changed":
                return "Vui lòng chọn mật khẩu mới khác mật khẩu cũ!"
            case "not_confirmed": 
                return "Vui lòng xác nhận mật khẩu mới!"
            case "not_match": 
                return "Mật khẩu không khớp. Vui lòng xác nhận lại!"
            default: 
                return "";
        }
    }

    const fields = [
        {
            label: "Mật khẩu cũ",
            value: password,
            onChange: (e) => {
                setPassword(e.target.value);
                setPasswordValidation("valid");
            },
            isInvalid: passwordValidation === "not_auth" || passwordValidation === "wrong" 
        },
        {
            label: "Mật khẩu mới",
            value: newPassword,
            onChange: (e) => {
                setNewPassword(e.target.value);
                setPasswordValidation("valid");
            },
            isInvalid: passwordValidation === "new_empty" || passwordValidation === "not_changed"
        },
        {
            label: "Xác nhận mật khẩu mới",
            value: passwordConfirmed,
            onChange: (e) => {
                setPasswordConfirmed(e.target.value);
                setPasswordValidation("valid");
            },
            isInvalid: passwordValidation === "not_confirmed" || passwordValidation === "not_match" 
        }
    ]

    const inputIsInvalid = isInvalidPassword(password) || isInvalidPassword(newPassword) || isInvalidPassword(passwordConfirmed);
    const {password: {min, max}} = INPUT_LENGTHS;

    return (
        <Modal
            width="small"
            onClose={closeModal}
            heading="Đổi mật khẩu"
            actions={[
                { text: 'Hủy', appearance: 'subtle', onClick: closeModal },
                { text: 'Lưu', appearance: 'primary', onClick: onSubmit, isDisabled: inputIsInvalid, isLoading: accountValidation === "processing" },
            ]}
        >
            <div className={classes.registerForm}>
                {fields.map((item, index) => {
                    const {label, value, onChange, isInvalid} = item;
                    return (
                        <div key={index}>
                            {index < 2 ? (
                                <div>{label}:</div>
                            ) : (
                                <div>Xác nhận <br/> mật khẩu mới:</div>
                            )}
                            <div>
                                <Textfield 
                                    placeholder={index === 1 && `(${min} - ${max} ký tự)`}
                                    type="password"
                                    onChange={onChange}
                                    value={value}
                                    css={TEXT_INPUT_CUSTOM_STYLE}
                                    onKeyDown={onTextFieldKeyDown}
                                    maxLength={max}
                                />
                            </div>
                            <div></div>
                            {isInvalid && (
                                <div className={commonClasses.asterisk}>
                                    {getPasswordValidationMessage()}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </Modal>
    );
};


const useStyles = createUseStyles({
    registerForm: {
        "& > div": {
            "&:not(:last-child)": {
                marginBottom: "1rem",
            },
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            "& > div:first-child": {
                textAlign: "right",
                marginRight: "1rem",
                fontSize: "0.9rem",
                alignSelf: "center"
            }
        },
        padding: "1rem 0",
    },
})

export default ChangePasswordModal;