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
                return "Vui l??ng nh???p m???t kh???u c?? ????? x??c nh???n ???? l?? b???n!"
            case "wrong":
                return "M???t kh???u kh??ng ????ng. Vui l??ng x??c nh???n l???i!"
            case "new_empty": 
                return "Vui l??ng nh???p m???t kh???u m???i!"
            case "not_changed":
                return "Vui l??ng ch???n m???t kh???u m???i kh??c m???t kh???u c??!"
            case "not_confirmed": 
                return "Vui l??ng x??c nh???n m???t kh???u m???i!"
            case "not_match": 
                return "M???t kh???u kh??ng kh???p. Vui l??ng x??c nh???n l???i!"
            default: 
                return "";
        }
    }

    const fields = [
        {
            label: "M???t kh???u c??",
            value: password,
            onChange: (e) => {
                setPassword(e.target.value);
                setPasswordValidation("valid");
            },
            isInvalid: passwordValidation === "not_auth" || passwordValidation === "wrong" 
        },
        {
            label: "M???t kh???u m???i",
            value: newPassword,
            onChange: (e) => {
                setNewPassword(e.target.value);
                setPasswordValidation("valid");
            },
            isInvalid: passwordValidation === "new_empty" || passwordValidation === "not_changed"
        },
        {
            label: "X??c nh???n m???t kh???u m???i",
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
            heading="?????i m???t kh???u"
            actions={[
                { text: 'H???y', appearance: 'subtle', onClick: closeModal },
                { text: 'L??u', appearance: 'primary', onClick: onSubmit, isDisabled: inputIsInvalid, isLoading: accountValidation === "processing" },
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
                                <div>X??c nh???n <br/> m???t kh???u m???i:</div>
                            )}
                            <div>
                                <Textfield 
                                    placeholder={index === 1 && `(${min} - ${max} k?? t???)`}
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