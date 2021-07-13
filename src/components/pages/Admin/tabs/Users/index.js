import Avatar from "@atlaskit/avatar";
import { faEdit, faIdBadge, faSort } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { useDispatch, useSelector } from "react-redux";
import { getUsers, getUsersCount, startAddUser } from "../../../../../redux/admin/action";
import { isLoadingDataSelector, userListSelector } from "../../../../../selectors/adminSelectors";
import { ROLES } from "../../../../../services/utils/constant";
import DynamicTable from '@atlaskit/dynamic-table';
import { ModalTransition } from "@atlaskit/modal-dialog";
import AddNewBtn from "../../common/AddNewBtn";
import BlockUserModal from "../../../../common/modals/BlockUserModal";
import AddNewUserModal from "./components/AddNewUserModal";
import { useCommonStyles } from "../../../../../services/utils/common_classes";
import { getDateFormatted, getDocumentTitle, getLinkToProfile, setLevel } from "../../../../../services/utils/common";
import { currentUserSelector } from "../../../../../selectors/usersSelector";
import EditUsersInfoForAdminModal from "../../../../common/modals/EditUsersInfoForAdminModal";
import FilterBar from "../../common/FilterBar";
import FilterPopup from "../../common/FilterPopup";
import SearchInput from "../../../../common/text_fields/SearchInput";
import Button from "@atlaskit/button";

let userListTmp = [];

const calcMatching = (user, searchKey) => {
    const key = searchKey.trim().toLowerCase();
    const {username, info} = user;
    const pos1 = username.toLowerCase().indexOf(key);
    const pos3 = info ? info.displayName.toLowerCase().indexOf(key) : -1;
    if (pos1 >= 0) return {type: 1, pos: pos1};
    if (pos3 >= 0) return {type: 3, pos: pos3};
    return {type: -1, pos: -1};
}

const UsersManagement = () => {
    const classes = useStyles();
    const commonClasses = useCommonStyles();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getUsersCount())
        dispatch(getUsers())
        document.title = getDocumentTitle("Quản lý người dùng");
    }, []);

    const [userList, setUserList] = useState([]);
    const [userListUpdated, setUserListUpdated] = useState([]);
    const userListFromState = useSelector(userListSelector);
    const isLoadingData = useSelector(isLoadingDataSelector);
    const currentUser = useSelector(currentUserSelector);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKey, setSearchKey] = useState('');

    const getUsersBy = (statusFilter, roleFilter) => {
        const status = allStatusFilters[statusFilter].key;
        const role = allRoleFilters[roleFilter].key;

        const list = role === "all" 
            ? userListFromState.filter((item) => item.status === status)
            : userListFromState.filter((item) => item.status === status && item.role === role);

        if (searchKey && searchKey.trim()) {
            const res = [];
            for (let i=0; i<list.length; i++) {
                const item=list[i];
                const matching=calcMatching(item,searchKey);
                if (matching.pos >= 0) res.push({...item, matching})
            }
            return res.sort((a,b) => {
                const {matching: {type: type_a, pos: pos_a}} = a;
                const {matching: {type: type_b, pos: pos_b}} = b;
                return type_a < type_b || (type_a === type_b && pos_a < pos_b) ? -1 : 1
            })
        }

        return list;
    }

    useEffect(() => {
        if (!isLoadingData) setUserList(getUsersBy(statusFilter, roleFilter));
    }, [isLoadingData])

    useEffect(() => {
        setUserList(getUsersBy(statusFilter, roleFilter));
        setCurrentPage(1);
    }, [searchKey])

    useEffect(() => {
        if (userListUpdated) {
            setUserList(userListTmp);
            setUserListUpdated(false);
        }
    }, [userListUpdated]);

    const [isShowingEditRoleModal, setIsShowingEditRoleModal] = useState(false);
    const [isShowingBlockModal, setIsShowingBlockModal] = useState(false);
    const isAddingNewUser = useSelector((state) => state.admin.isAddingNewUser);
    const [selectedUser, setSelectedUser] = useState(null);

    const renderHead = () => {
        return {
            cells: [
              {
                key: "userInfo",
                content: "Người dùng",
                colSpan: 2,
                },
                {
                    key: "emal",
                    content: "Email",
                    colSpan: 2,
                    shouldTruncate: true,
                },
              {
                  isSortable: true,
                  key: "role",
                  content: "Vai trò",
              },
              {
                  isSortable: true,
                  key: "joinedAt",
                  content: "Tham gia từ",
                  shouldTruncate: true,
              },
              {
                  isSortable: true,
                  key: "level",
                  content: "Cấp độ",
                  shouldTruncate: true,
              },
              {
                key: "actions",
                content: "Hành động",
                shouldTruncate: true,
            },
            ],
          }
    };

    const renderUserInfo = (user) => {
        const {username, info} = user;
        return (
            <div className={classes.userCard}>
                <Avatar
                    appearance="circle"
                    size="medium"
                    src={info && info.avatarUrl}
                />
                <div style={{marginLeft: "0.5rem"}}>
                    <a 
                        href={getLinkToProfile(username)}
                        target="_blank" 
                        rel="noreferrer"
                        style={{pointerEvents: statusFilter === 1 && "none"}}
                    >
                        {info ? info.displayName : username}
                    </a>
                    <div>@{username}</div>
                </div>
            </div>
        )
    }

    const onEditIconClicked = (user) => {
        setIsShowingEditRoleModal(true);
        setSelectedUser(user);
    }

    const renderUserRole = (user) => {
        return (
            <div style={{display: "flex"}}>
                {user.role}&nbsp;
                {(currentUser.role === "admin" && (user.role !== "admin" || currentUser.username === "admin") && statusFilter === 0) && 
                    <span style={{cursor: "pointer"}}>
                        <div onClick={() => onEditIconClicked(user)}>
                            <FontAwesomeIcon icon={faEdit}/>
                        </div>
                    </span>
                }    
            </div>
        )
    }

    const onBlockBtnClicked = (user) => {
        setIsShowingBlockModal(true);
        setSelectedUser(user);
    }

    const closeBlockModal = () => {
        setIsShowingBlockModal(false);
        setSelectedUser(null);
    }

    const renderActions = (user) => {
        const isDisabled = (user.role === "admin" && currentUser.username !== "admin") || user.username === currentUser.username
        return (
            <div className={classes.blockAction}>
                <Button
                    isDisabled={isDisabled}
                    onClick={() => onBlockBtnClicked(user)}
                    appearance={statusFilter === 0 ? "warning" : "primary"}
                >
                    {statusFilter === 0 ? "Khóa" : "Mở khóa"}
                </Button>
            </div>
        )
    }

    const renderUserRows = () => {
        return userList.map((user) => ({
            style: {
                padding: "0.5rem",
                fontSize: "0.875rem",
            },
            key: user.id,
            cells: [
              {
                content: renderUserInfo(user),
                colSpan: 2,
                },
                {
                    content: <div>{user.email}</div>,
                    colSpan: 2,
                },
              {
                  key: user.role,
                  content: renderUserRole(user),
              },
              {
                  key: user.joinedAt,
                  content: (<div>{getDateFormatted(user.joinedAt)}</div>)
              },
              {
                  key: user.point,
                  content: (<div>{`${setLevel(user.point)} (${user.point || 0} điểm)`}</div>)
              },
              {
                content: renderActions(user),
              },
            ],
          }));
    }
    
    const [statusFilter, setStatusFilter] = useState(0);
    const [roleFilter, setRoleFilter] = useState(0);
    const [roleFilterPopupIsOpen, setRoleFilterPopupIsOpen] = useState(false);

    const onStatusFilterChanged = (index) => {
        if (index === statusFilter) return;
        userListTmp = getUsersBy(index, roleFilter);
        setUserListUpdated(true);
        setStatusFilter(index);
    }

    const onRoleFilterChanged = (index) => {
        setRoleFilterPopupIsOpen(false);
        if (index === roleFilter) return;

        userListTmp = getUsersBy(statusFilter, index)
        setUserListUpdated(true);
        setRoleFilter(index);
    }

    const renderStatusFilter = () => {
        return (
            <FilterBar 
                options={allStatusFilters}
                icon={faSort}
                onClick={(value) => onStatusFilterChanged(value)}
                currentValue={statusFilter}
            />
        )
    }

    const renderRoleFilter = () => {
        return (
            <FilterPopup 
                icon={faIdBadge}
                options={allRoleFilters}
                currentValue={roleFilter}
                isOpen={roleFilterPopupIsOpen}
                onClose={() => setRoleFilterPopupIsOpen(false)}
                onOpen={() => setRoleFilterPopupIsOpen(true)}
                onOptionSelected={(value) => onRoleFilterChanged(value)}
            />
        )
    }

    const renderFilters = () => {
        return (
            <div className={commonClasses.filters}>
                {renderStatusFilter()}
                {renderRoleFilter()}
            </div>
        )
    }

    const renderTable = () => {
        return (
            <DynamicTable
                head={renderHead()}
                rows={renderUserRows()}
                rowsPerPage={10}
                loadingSpinnerSize="large"
                isLoading={isLoadingData}
                isFixedSize
                page={currentPage}
                onSetPage={(p) => setCurrentPage(p)}
                emptyView={<div style={{fontSize: "0.875rem", color: "#5E6C84"}}>{!isLoadingData ? "Không tìm thấy người dùng nào" : ""}</div>}
            />
        )
    }

    const renderBlockModal = () => {
        const isBlocking = statusFilter === 0;
        return (
            <ModalTransition>
                {isShowingBlockModal && 
                    <BlockUserModal 
                        onClose={closeBlockModal}
                        user={selectedUser}
                        isBlocking={isBlocking}
                    />
                }
                {isAddingNewUser && <AddNewUserModal />}
                {isShowingEditRoleModal && 
                    <EditUsersInfoForAdminModal user={selectedUser} onClose={() => setIsShowingEditRoleModal(false)}/>
                }
            </ModalTransition>
        )
    }

    return (
        <div className={classes.userManagePage}>
            <div className={commonClasses.adminManagementTitle}>Tất cả người dùng</div>
            <div className={classes.filtersAndBtn}>
                {renderFilters()}
                {currentUser.role === "admin" && 
                    <AddNewBtn type="người dùng" onClick={() => dispatch(startAddUser())} />
                }
            </div>
            <SearchInput type="người dùng" value={searchKey} onChange={(value) => setSearchKey(value)} onKeyDown={() => {}}/>
            <div className={commonClasses.dynamicTableContainer}>
                {renderTable()}
            </div>
            {renderBlockModal()}
        </div>
    )
}

const allStatusFilters = [
    {
        key: "active",
        value: 0,
        label: "Đang hoạt động",
    },
    {
        key: "blocked",
        value: 1,
        label: "Đã bị khóa",
    }
];

const allRoleFilters = [
    {
        key: "all",
        value: 0,
        label: "Tất cả thành viên"
    },
    ...ROLES.map((item, index) => ({...item, value: index+1})),
]

const useStyles = createUseStyles({
    userManagePage: {
        // width: "100%",
        padding: "0 8px",
    },
    filtersAndBtn: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: "0.25rem",
        paddingTop: "0.25rem"
    },
    userList: {
        display: "flex",
        flexDirection: "column",
        borderRadius: "5px",
        marginTop: "1rem",
    },
    userCard: {
        display: "flex",
        padding: "0.5rem",

        //avatar
        "& div:first-child": {
            display: "flex !important",
            flexDirection: "column",
            justifyContent: "center",
        },

        //display name & username
        "& div:nth-child(2)": {
            "& a": {
                textDecoration: "none",
                color: "black",
                fontWeight: "500",
            }
        }
    },
    actions: {
        display: "flex",
        justifyContent: "flex-end",
        cursor: "pointer",
    },
    blockAction: {
        fontWeight: "500",
        cursor: "pointer",
        textTransform: "uppercase",
        color: "tomato",
        fontSize: "0.8rem",
    },
})

export default UsersManagement;