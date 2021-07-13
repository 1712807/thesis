import DynamicTable from "@atlaskit/dynamic-table";
import { ModalTransition } from "@atlaskit/modal-dialog";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { categoriesSelector } from "../../../../../selectors/dealsSelectors";
import { useCommonStyles } from "../../../../../services/utils/common_classes";
import AddNewBtn from "../../common/AddNewBtn";
import AddNewCategoryModal from "./components/AddNewCategoryModal";
import { getDocumentTitle } from "../../../../../services/utils/common";

const CategoriesManagement = () => {
  const commonClasses = useCommonStyles();
  const categories = useSelector(categoriesSelector);
  const [isShowingModal, setIsShowingModal] = useState(false);
  document.title = getDocumentTitle("Quản lý ngành hàng")

  const renderHead = () => {
    return {
      cells: [
        {
          key: "key",
          content: "Khóa",
          width: 1,
        },
        {
          key: "name",
          content: "Tên ngành hàng",
          isSortable: true,
          shouldTruncate: true,
          width: 3
        },
      ],
    }
  }

  const renderRows = () => {
    return categories
      .filter((item) => item.value !== "others" && item.value !== "all")
      .map((item) => ({
        style: {
            padding: "0.5rem",
            fontSize: "0.875rem",
        },
        key: item.value,
        cells: [
          {
            content: <div style={{marginLeft: "0.5rem"}}>{item.value}</div>,
          },
          {
            key: item.label,
            content: <div>{item.label}</div>,
          },
        ],
    }));
  }

  return (
    <div style={{padding: "0 8px"}}>
      <div className={commonClasses.adminManagementTitle}>
          Tất cả ngành hàng
      </div>
        <AddNewBtn type="ngành hàng" onClick={() => setIsShowingModal(true)}/>
      <div className={commonClasses.dynamicTableContainer}>
        <DynamicTable
          head={renderHead()}
          rows={renderRows()}
          rowsPerPage={10}
          isFixedSize
        />
      </div>
      <ModalTransition>
        {isShowingModal && <AddNewCategoryModal onClose={() => setIsShowingModal(false)} />}
      </ModalTransition>
    </div>
  )
}

export default CategoriesManagement;