import React, { useState } from "react";
import Modal from "@atlaskit/modal-dialog";
import { useDispatch } from "react-redux";
import { changeUsersRole } from "../../../redux/admin/action";
import RoleSelector from "../components/RoleSelector";

const EditUsersInfoForAdminModal = (props) => {
  const dispatch = useDispatch();

  const {user, onClose} = props;
  const [role, setRole] = useState(user.role);
  const [categoriesList, setCategoriesList] = useState(user.editorsCategories || []);

  const onSave = () => {
    dispatch(changeUsersRole(user.id, role, role === "editor" ? categoriesList : []));
    onClose();
  }

  const renderRoleField = () => {
    return (
      <div>
        <RoleSelector 
          role={role} 
          categoriesList={categoriesList}
          setRole={(value) => setRole(value)}
          setCategoriesList={(value) => setCategoriesList(value)}
        />
      </div>
    )
  }

  return (
    <Modal
      actions={[
        {text: "Hủy", appearance: "subtle", onClick: onClose},
        {text: "Lưu", appearance: "primary", onClick: onSave, isDisabled: role === "editor" && categoriesList.length === 0}
      ]}
      heading="Thay đổi vai trò người dùng"
      onClose={onClose}
    >
      {renderRoleField()}
    </Modal>
  )
}

export default EditUsersInfoForAdminModal;