import { faBell } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import Popup from "@atlaskit/popup";
import { useDispatch, useSelector } from "react-redux";
import { getMyNotifications, markAllNotiAsRead, updateNewNotiSuccess } from "../../../../redux/users/action";
import NotiContent from "./NotiContent";
import LoadingSpinner from "../../../common/loaders/LoadingSpinner";

const UsersNotification = () => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);

    const notifications = useSelector((state) => state.users.notifications);
    const {newNotiCount, updated, list: listFromState, allNotiLoaded, isLoading} = notifications;
    const [list, setList] = useState([]);

    useEffect(() => {
        dispatch(getMyNotifications(false));
    }, [])

    useEffect(() => {
        if (updated) {
            setList(listFromState);
            dispatch(updateNewNotiSuccess());
        };
    }, [updated]);

    useEffect(() => {
        const autoGetNewNotifications = setInterval(() => {
            if (isOpen) return;
            dispatch(getMyNotifications(false))
        }, 30000);

        return () => {
            clearInterval(autoGetNewNotifications);
        }
    }, [])

    const onIconClicked = () => {
        if (!isOpen) {
            dispatch(getMyNotifications(true));
        }
        setIsOpen(!isOpen)
    }

    const onListScroll = () => {
        const {
            scrollHeight,
            scrollTop,
            clientHeight,
          } = document.getElementById("noti-list");
        const isBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;
        if (isBottom && !allNotiLoaded && !isLoading) {
            dispatch(getMyNotifications(true));
        }
    }

    const renderNotifications = () => {
        return (
            <div className={classes.notificationPopup} style={{height: list.length === 0 && "fit-content"}}>
                <div className={classes.titleContainer}>
                    <h4>Thông báo</h4>
                    <div onClick={() => dispatch(markAllNotiAsRead())}>
                        Đánh dấu đã đọc tất cả
                    </div>
                </div>
                <div 
                    id="noti-list"
                    className={classes.listContainer}
                    onScroll={onListScroll}
                >
                    {list.map((item) => 
                        <NotiContent noti={item}/>  
                    )}
                    {isLoading && <LoadingSpinner />}
                    {list.length === 0 && !isLoading && (
                        <i style={{margin: "1rem", display: "block", fontSize: "0.875rem"}}>Bạn chưa có thông báo nào. Hãy tương tác nhiều hơn trên Dealbee nhé!</i>
                    )}
                </div>
            </div>
        )
    }

    return (
        <Popup 
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            placement='bottom-end'
            offset={[0, -1]}
            content={renderNotifications}
            trigger={(triggerProps) => (
                <div 
                    {...triggerProps}
                    role="presentation"
                    className={classes.notificationIcon}
                    onClick={onIconClicked}
                >
                    <FontAwesomeIcon icon={faBell}/>
                    {newNotiCount > 0 && 
                        <div className={classes.notificationCount}>
                            <div>{newNotiCount < 9 ? `${newNotiCount}` : '9+'}</div>
                        </div>
                    }
                </div>
            )}
        />
    )
}

const useStyles = createUseStyles({
    notificationIcon: {
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        cursor: "pointer",
        position: "relative",
    },
    notificationCount: {
        position: "absolute",
        top: "-3px",
        right: "-2px",
        backgroundColor: "red",
        textAlign: "center",
        color: "white",
        borderRadius: "50%",
        width: "0.75rem",
        height: "0.75rem",
        zIndex: 2,
        fontSize: "0.5rem",
        fontWeight: "bold",
        /* "& div": {
            marginTop: "-1px",
        } */
    },
    notificationPopup: {
        width: "calc(min(450px, 90vw))",
        // height: "500px",
    },
    titleContainer: {
        borderBottom: "1px solid gray",
        display: "flex",
        justifyContent: "space-between",
        flexWrap: "wrap",
        padding: "1rem",
        "& h4": {
            margin: "0",
            fontSize: "1.25rem",
            fontWeight: "500",
        },
        "& div": {
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            fontSize: "0.75rem",
            cursor: "pointer",
            color: "gray",
        }
    },
    listContainer: {
        maxHeight: "70vh",
        overflowY: "scroll",
    }
})

export default UsersNotification;