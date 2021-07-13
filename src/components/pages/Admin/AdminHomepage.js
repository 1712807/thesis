import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import ReportedComments from './tabs/Comments';
import DealsManagement from "./tabs/Deals";
import UserManagement from "./tabs/Users";
import { useDispatch, useSelector } from "react-redux";
import { currentPageSelector } from "../../../selectors/adminSelectors";
import { changePage } from "../../../redux/admin/action";
import AdminDealPage from "./AdminDealPage";
import { currentUserSelector } from "../../../selectors/usersSelector";
import { hasEditorPermission, hasModeratorPermission } from "../../../services/utils/common";
import { DEALBEE_PATHS, MAX_PAGE_WIDTH } from "../../../services/utils/constant";
import UsersFeedback from "./tabs/Feedback";
import CategoriesManagement from "./tabs/Categories";

const AdminHomepage = (props) => {
    const {dealId, commentId} = props;
    const classes = useStyles();
    const dispatch = useDispatch();
    const [isDealPage, setIsDealPage] = useState((dealId || commentId) ? true : false);
    const currentUser = useSelector(currentUserSelector);
    const {role} = currentUser;

    const pageFromState = useSelector(currentPageSelector);
    const page = !hasEditorPermission(role) && pageFromState === 0 
        ? 2 //moderator after login
        : pageFromState;

    const renderTab = (item, index) => {
        return (
            <div
                key={index}
                className={page === index && !isDealPage ? classes.tabSelected : ''}
                onClick={() => {
                    if (isDealPage) window.history.pushState({}, null, DEALBEE_PATHS.admin);
                    dispatch(changePage(index));
                    if (isDealPage) setIsDealPage(false);
                }}
            >
                {item}
            </div>
        )
    }

    const renderTabContent = () => {
        switch (page) {
            case 0: return <DealsManagement />
            case 1: return <CategoriesManagement />
            case 2: return <UserManagement />
            case 3: return <ReportedComments />
            case 4: return <UsersFeedback />
            default: return ""
        }
    }

    return (
        <div className={classes.adminPage}>
            <div className={classes.tabList}>
                {hasEditorPermission(role) && renderTab("Quản lý deal", 0)}
                {role === "admin" && renderTab("Quản lý ngành hàng", 1)}
                {hasModeratorPermission(role) && renderTab("Quản lý người dùng", 2)}
                {hasModeratorPermission(role) && renderTab("Quản lý bình luận", 3)}
                {renderTab("Phản hồi từ người dùng", 4)}
            </div>
            {isDealPage 
                ? <AdminDealPage dealId={dealId} commentId={commentId} />   
                : renderTabContent()
            }
        </div>
    )
}

const useStyles = createUseStyles({
    adminPage: {
        display: "grid",
        gridTemplateColumns: "1fr 4fr",
        margin: "3rem 0",
        width: "100%",
        maxWidth: MAX_PAGE_WIDTH,
    },
    tabList: {
        backgroundColor: "white",
        borderRadius: "5px",
        minWidth: "10rem",
        height: 'fit-content',
        marginRight: "2rem",
        "& div": {
            cursor: "pointer",
            padding: "0.5rem 1rem",
            fontSize: "0.8rem",
            fontWeight: "500",
            borderBottom: "medium solid lightgray",
            "&:first-child": {
                borderTop: "medium solid lightgray"
            },
            "&:hover": {
                backgroundColor: "#f2f2f2"
            }
        }
    },
    tabSelected: {
        cursor: "pointer",
        padding: "0.5rem 1rem",
        fontSize: "0.8rem",
        fontWeight: "500",
        backgroundColor: "#f2f2f2"
    }
})

export default AdminHomepage;