import React, { useState } from "react";
import Modal from "@atlaskit/modal-dialog";
import Textfield from "@atlaskit/textfield";
import { useCommonStyles } from "../../../../../../services/utils/common_classes";
import { useDispatch, useSelector } from "react-redux";
import { categoriesSelector } from "../../../../../../selectors/dealsSelectors";
import { addCategory } from "../../../../../../redux/deals/action";
import { getSlug } from "../../../../../../services/utils/common";

const AddNewCategoryModal = ({ onClose }) => {
  const commonClasses = useCommonStyles();
  const dispatch = useDispatch();

  const [value, setValue] = useState('');
  const [label, setLabel] = useState('');
  const [valueDuplicated, setValueDuplicated] = useState(false);
  const [labelDuplicated, setLabelDuplicated] = useState(false);
  const categories = useSelector(categoriesSelector);

  const onAddCategoryClicked = () => {
    if (categories.filter((item) => item.value.toLowerCase() === value.toLowerCase())[0]) {
      setValueDuplicated(true);
      return;
    }
    if (categories.filter((item) => item.label.toLowerCase() === label.toLowerCase())[0]) {
      setLabelDuplicated(true);
      return;
    }
    dispatch(addCategory(value, label));
    onClose();
  }

  const onLabelChange = (label) => {
    setLabel(label);
    setValue(getSlug(label, "_"))
  }
  
  const renderModalBody = () => {
    return (
      <div className={commonClasses.inputForm}>
        <div>
          <div>Tên ngành hàng <span className={commonClasses.asterisk}>*</span></div>
          <Textfield
            value={label}
            onChange={(e) => onLabelChange(e.target.value)}
            maxLength={50}
            placeholder="5 - 20 ký tự"
          />
          {labelDuplicated && <div className={commonClasses.asterisk}>Ngành hàng đã tồn tại!</div>}
        </div>
        <div>
          <div>Khóa <span className={commonClasses.asterisk}>*</span></div>
          <Textfield
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (valueDuplicated) setValueDuplicated(false);
            }}
            maxLength={50}
            placeholder="Dùng để phân biệt các ngành hàng, không bao gồm khoảng trắng, tối đa 50 ký tự"
          />
          {valueDuplicated && <div className={commonClasses.asterisk}>Giá trị khóa đã được sử dụng!</div>}
        </div>
        <div>
          <div>
            <span style={{ color: "tomato" }}>Lưu ý: </span>
            Bạn không thể trực tiếp xóa ngành hàng sau khi đã tạo. Vui lòng kiểm tra thật kỹ thông tin!
          </div>
        </div>
      </div>
    )
  }

  return (
    <Modal
          actions={[
              { text: 'Hủy', appearance: "subtle", onClick: onClose },
              { 
                  text: 'Thêm', 
                  appearance: "primary", 
                  onClick: onAddCategoryClicked,
                  isDisabled: !value || !value.trim() || value.indexOf(' ') >= 0 || !label || !label.trim() || label.length < 5 || valueDuplicated || labelDuplicated
              }, 
          ]}
          onClose={onClose}
          heading="Thêm ngành hàng mới"
      >
          {renderModalBody()}
      </Modal>
  )
}

export default AddNewCategoryModal;