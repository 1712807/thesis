import React, { useEffect, useState } from "react";
import Modal from "@atlaskit/modal-dialog";
import { useDispatch, useSelector } from "react-redux";
import { createUserAccount, stopAddUser } from "../../../../../../redux/admin/action";
import { accountValidationSelector } from "../../../../../../selectors/usersSelector";
import RoleSelector from "../../../../../common/components/RoleSelector";
import RegisterFields from "../../../../../common/text_fields/RegisterFields";
import { isInvalidUserInfo } from "../../../../../../services/utils/common";

const AddNewUserModal = () => {
    const dispatch = useDispatch();
    const isAddingNewUser = useSelector((state) => state.admin.isAddingNewUser);

    useEffect(() => {
        if (!isAddingNewUser) onClose();
    }, [isAddingNewUser])

    const onAddUserClicked = () => {
        dispatch(createUserAccount(user));
    }

    const onClose = () => {
        dispatch(stopAddUser())
    }

    const [user, setUser] = useState({
        username: "",
        email: "",
        displayName: "",
        password: "",
        role: "user",
        categoriesList: [],
    })

    const accountValidation = useSelector(accountValidationSelector);

    let validation = {
        username: "valid",
        password: "valid",
        email: "valid",
    }

    if (accountValidation !== "valid") {
        const index = accountValidation.indexOf(' ');
        const type = accountValidation.slice(0, index);
        const err = accountValidation.slice(index + 1, accountValidation.length);
        validation[`${type}`] = err;
    }
    
    const renderModalBody = () => {
        return (
            <div>
                <RegisterFields 
                    tab="dang-ky"
                    user={user}
                    onChange={(value) => setUser(value)}
                    validation={validation}
                    onSubmit={() => {}}
                    isForAdmin={true}
                />
                <div style={{margin: "1rem 0"}}>
                    <div style={{fontWeight: "500"}}>Vai trò</div>
                    <RoleSelector 
                        role={user.role} 
                        categoriesList={user.categoriesList} 
                        setRole={(value) => setUser({...user, role: value})} 
                        setCategoriesList={(value) => setUser({...user, categoriesList: value})}
                    />
                </div>
            </div>
        )
    }

    return (
        <Modal
            width="medium"
            actions={[
                { text: 'Hủy', appearance: "subtle", onClick: onClose },
                { 
                    text: 'Thêm', 
                    appearance: "primary", 
                    onClick: onAddUserClicked,
                    isDisabled: isInvalidUserInfo(user, { isSignUp: true, isForAdmin: true }),
                }, 
            ]}
            onClose={onClose}
            heading="Thêm người dùng mới"
        >
            {renderModalBody()}
        </Modal>
    )
}

export default AddNewUserModal;