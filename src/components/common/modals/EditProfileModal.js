import React, { useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import Modal from '@atlaskit/modal-dialog';
import { useDispatch, useSelector } from 'react-redux';
import Textfield from '@atlaskit/textfield';
import { useState } from 'react';
import { accountValidationSelector, currentUserSelector } from '../../../selectors/usersSelector';
import { editInfo, stopEditingProfile } from '../../../redux/users/action';
import TextArea from '@atlaskit/textarea';
import { INPUT_LENGTHS, TEXT_INPUT_CUSTOM_STYLE } from '../../../services/utils/constant';
import CategoriesCheckboxes from '../components/CategoriesCheckboxes';
import ToggleStateless from "@atlaskit/toggle";
import { getRegisterValidationMessage, isInvalidUserInfo, validateAccount } from '../../../services/utils/common';
import { useCommonStyles } from '../../../services/utils/common_classes';

const EditProfileModal = () => {
    const classes = useStyles();
    const commonClasses = useCommonStyles();
    const dispatch = useDispatch();

    const currentUser = useSelector(currentUserSelector);
    const {username, info} = currentUser;
    const [displayName, setDisplayName] = useState(info ? info.displayName || '' : '');
    const [email, setEmail] = useState(currentUser.email || "");
    const [emailNoti, setEmailNoti] = useState(currentUser.emailNotifications || {});
    const [introduction, setIntroduction] = useState(info ? info.introduction || '' : '');
    const [followingCategories, setFollowingCategories] = useState(currentUser.followingCategories || [])

    const isSigning = useSelector((state) => state.users.isSigning);
    const accountValidation = useSelector(accountValidationSelector);
    const validation = validateAccount(accountValidation);
    const [emailValidation, setEmailValidation] = useState("valid");

    useEffect(() => {
        setEmailValidation(validation.email);
    }, [accountValidation])

    const closeModal = () => {
        dispatch(stopEditingProfile())
    }

    const saveChanges = () => {
        const newInfo = {
            ...info,
            displayName: displayName || username,
            introduction
        }
        dispatch(editInfo(currentUser.id, newInfo, email, emailNoti, followingCategories, false))
    }

    const onSubmit = () => {
        saveChanges();
        // closeModal();
    }

    return (
        <Modal
            width="large"
            onClose={closeModal}
            heading="Chỉnh sửa thông tin"
            actions={[
                { text: 'Hủy', appearance: 'subtle', onClick: closeModal },
                { text: 'Lưu', appearance: 'primary', onClick: onSubmit, isLoading: isSigning, isDisabled: isInvalidUserInfo({displayName, email}, {isEditing: true})},
            ]}
        >
            <div className={classes.bodyContainer}>
                <div className={commonClasses.inputForm}>
                    <div>
                        <div>Tên của bạn <span className={commonClasses.asterisk}>*</span></div>
                        <Textfield 
                            onChange={(e) => setDisplayName(e.target.value)}
                            value={displayName}
                            css={TEXT_INPUT_CUSTOM_STYLE}
                            maxLength={INPUT_LENGTHS.displayName.max}
                        />
                    </div>

                    <div>
                        <div>Email <span className={commonClasses.asterisk}>*</span></div>
                        <Textfield 
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setEmailValidation("valid");
                            }}
                            value={email}
                            maxLength={INPUT_LENGTHS.email.max}
                            css={TEXT_INPUT_CUSTOM_STYLE}
                            placeholder={`(${INPUT_LENGTHS.email.min} - ${INPUT_LENGTHS.email.max} ký tự)`}
                        />
                        {emailValidation !== "valid" && (
                            <div className={commonClasses.asterisk}>
                                {getRegisterValidationMessage("email", emailValidation)}
                            </div>
                        )}
                    </div>

                    <div>
                        <div>Giới thiệu</div>
                        <TextArea
                            value={introduction}
                            maxLength={INPUT_LENGTHS.usersIntroduction.max}
                            onChange={(e) => setIntroduction(e.target.value)}
                            css={TEXT_INPUT_CUSTOM_STYLE}
                            minimumRows={4}
                            resize="none"
                        />
                    </div>
                </div>
                <div  className={commonClasses.inputForm}>
                    <div>
                        <div>Ngành hàng đang theo dõi</div>
                        <CategoriesCheckboxes 
                            currentList={followingCategories}
                            onChange={(value) => setFollowingCategories(value)}
                            styles={{gridTemplateColumns: "1fr"}}
                        />
                        <div style={{display: "flex"}}>
                            <i style={{fontSize: "0.875rem", alignSelf: "center", fontWeight: "500"}}>Nhận thông báo qua email</i>  
                            <ToggleStateless 
                                isChecked={emailNoti.followingCategories}
                                onChange={(e) => setEmailNoti({...emailNoti, followingCategories: e.target.checked})}
                            />  
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

const useStyles = createUseStyles({
    bodyContainer: {
        display: "grid",
        gridTemplateColumns: "3fr 2fr",
        "& > div:first-child": {
            marginRight: "1rem",
        },
        "@media screen and (max-width: 768px)": {
            gridTemplateColumns: "1fr",
            "& > div:first-child": {
                marginRight: "0",
            }
        }
    },
})

export default EditProfileModal;