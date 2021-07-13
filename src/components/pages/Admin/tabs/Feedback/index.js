import DynamicTable from "@atlaskit/dynamic-table";
import { faCheck, faSort } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { useDispatch, useSelector } from "react-redux";
import { getFeedback, markFeedbackAsSolved } from "../../../../../redux/admin/action";
import { getDateFormatted, getDocumentTitle } from "../../../../../services/utils/common";
import { useCommonStyles } from "../../../../../services/utils/common_classes";
import { FEEDBACK_TYPES } from "../../../../../services/utils/constant";
import FilterBar from "../../common/FilterBar";
import Modal, { ModalTransition } from "@atlaskit/modal-dialog";
import Button from "@atlaskit/button";

const UsersFeedback = () => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const commonClasses = useCommonStyles();

  const feedback = useSelector((state) => state.admin.feedback);
  const [list, setList] = useState([]);
  const { isLoading } = feedback;
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    document.title = getDocumentTitle("Phản hồi từ người dùng");
    dispatch(getFeedback());
  }, [])

  useEffect(() => {
    if (!isLoading) setList(filterList())
  }, [isLoading])

  const TYPES = [
    { value: 0, key: "all", label: "Tất cả" },
    ...FEEDBACK_TYPES.map((item, index) => ({ ...item, value: index+1 }))
  ]
  const SOLVED_STATUS = [
    { value: 0, key: "all", label: "Tất cả" },
    { value: 1, key: "solved", label: "Đã giải quyết" },
    { value: 2, key: "not_solved", label: "Chưa giải quyết" }
  ]

  const [typeFilter, setTypeFilter] = useState(0);
  const [solvedStatus, setSolvedStatus] = useState(0);

  const filterList = () => {
    if (typeFilter === 0 && solvedStatus === 0) return feedback.list;
    const listTmp = feedback.list.filter((item) => item.type === TYPES[typeFilter].key);
    if (solvedStatus === 0) return listTmp;
    return listTmp.filter((item) => (solvedStatus === 1 ? item.solved : !item.solved));
  }

  const onFilterChanged = (value) => {
    if (value === typeFilter) return;
    setTypeFilter(value);
    setSolvedStatus(0);
    if (value === 0) setList(feedback.list);
    else setList (feedback.list.filter((item) => item.type === TYPES[value].key))
  }

  const onSolvedStatusChanged = (value) => {
    if (value === solvedStatus) return;
    setSolvedStatus(value);
    if (value === 0) setList(feedback.list.filter((item) => item.type === "khieu_nai"));
    else setList(feedback.list.filter((item) => item.type === "khieu_nai" && (value === 1 ? item.solved : !item.solved)))
  }

  const onCloseModal = () => {
    setSelectedItem(null);
  }

  const onConfirmSolved = () => {
    dispatch(markFeedbackAsSolved(selectedItem.id));
    onCloseModal();
  }

  const renderFilters = () => {
    return (
      <div className={commonClasses.filters}>
        <FilterBar 
            options={TYPES}
            icon={faSort}
            onClick={(value) => onFilterChanged(value)}
            currentValue={typeFilter}
        />
        {typeFilter === 2 && (
          <FilterBar
            options={SOLVED_STATUS}
            icon={faCheck}
            onClick={(value) => onSolvedStatusChanged(value)}
            currentValue={solvedStatus}
          />
        )}
      </div>
    )
  }

  const renderHead = () => {
    return {
      cells: [
        {
            isSortable: true,
            key: "type",
            content: "Loại",
          shouldTruncate: true,
            width: 1, 
        },
        {
            isSortable: true,
            key: "at",
            content: "Thời gian gửi",
          shouldTruncate: true,
            width: 1,
        },
        {
          key: "user",
          content: "Người gửi",
          width: 1,
        },
        {
          key: "content",
          content: "Nội dung",
          shouldTruncate: true,
          width: 4,
        },
        {
          key: "action",
          content: "Hành động",
          width: 1,
        }
      ],
    }
  };

  const renderFeedbackRows = () => {
    return list.map((item) => ({
        style: {
          padding: "0.5rem",
          fontSize: "0.875rem",
        },
        key: item.id,
        cells: [
          {
            key: item.type,
            content: (<div style={{paddingLeft: "0.5rem"}}>{TYPES.filter((type) => type.key === item.type)[0].label}</div>)
          },
          {
            key: item.created_at,
            content: (<div>{getDateFormatted(item.created_at)}</div>)
          },
          {
            content: (<div>{item.name}</div>)
          },
          {
            content: (<div>{item.content}</div>)
          },
          {
            content: item.type === "khieu_nai" ? (
                <Button
                  isDisabled={item.solved}
                  onClick={() => setSelectedItem(item)}
                >
                  {item.solved ? "Đã giải quyết" : "Giải quyết"}
                </Button>
            ) : <div></div>
          }
        ],
      }));
  }
        console.log("🚀 ~ file: UsersFeedback.js ~ line 159 ~ UsersFeedback ~ selectedItem", selectedItem)
  
  return (
    <div style={{padding: "0 8px"}}>
      <div className={commonClasses.adminManagementTitle}>Phản hồi từ người dùng</div>
      <div className={classes.filtersAndBtn}>
          {renderFilters()}
      </div>
      <div className={commonClasses.dynamicTableContainer}>
        <DynamicTable
          head={renderHead()}
          rows={renderFeedbackRows()}
          rowsPerPage={10}
          loadingSpinnerSize="large"
          isLoading={isLoading}
          emptyView={<div style={{fontSize: "0.875rem", color: "#5E6C84"}}>{!isLoading ? "Hiện không có feedback nào." : ""}</div>}
        />
      </div>
      <ModalTransition>
        {selectedItem && (
          <Modal
            actions={[
              { text: "Hủy", appearance: "subtle", onClick: onCloseModal },
              {text: "Xác nhận", appearance: "primary", onClick: onConfirmSolved}
            ]}
            onClose={onCloseModal}
            heading={`Xác nhận giải quyết khiếu nại từ ${selectedItem.name}?`}
          >
          </Modal>
        )}
      </ModalTransition>
    </div>
  )
}

const useStyles = createUseStyles({
  filtersAndBtn: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: "0.25rem",
        paddingTop: "0.25rem"
    },
})

export default UsersFeedback;