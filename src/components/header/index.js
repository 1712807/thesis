import React,  { useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { createUseStyles } from 'react-jss';
import { isShowingErrorMessageModalSelector } from '../../selectors/dealsSelectors';
import { currentUserSelector, isGettingCurrentUserSelector } from '../../selectors/usersSelector';
import {ModalTransition} from '@atlaskit/modal-dialog';
import { logOut, startChangingPassword } from '../../redux/users/action';
import Avatar from '@atlaskit/avatar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import Popup from '@atlaskit/popup';
import Logo from './components/Logo';
import { DEALBEE_PATHS, MAX_PAGE_WIDTH } from '../../services/utils/constant';
import LoginRequiredModal from '../common/modals/LoginRequiredModal';
import { useCommonStyles } from '../../services/utils/common_classes';
import { getLinkToProfile } from '../../services/utils/common';
import UsersNotification from './components/notification/UsersNotification';
import SearchDealForm from './components/SearchDealForm';
import LogInBtn from './components/buttons/LogInBtn';
import SignUpBtn from './components/buttons/SignUpBtn';
import NewDealBtn from './components/buttons/NewDealBtn';
import CategoriesMenu from './components/categories/CategoriesMenu';

const Header = () => {
    const classes = useStyles();
    const commonClasses = useCommonStyles();
    const dispatch = useDispatch();
    
    const currentUser = useSelector(currentUserSelector);
    const isGettingCurrentUser = useSelector(isGettingCurrentUserSelector);
    const isShowingErrorMessageModal = useSelector(isShowingErrorMessageModalSelector);
    const [optPopupIsOpen, setOptPopupIsOpen] = useState(false);
    const pathName = window.location.pathname;

    const closePopup = () => {
        setOptPopupIsOpen(false);
    }

    const onLogOutClicked = () => {
        dispatch(logOut());
        closePopup();
    }

    const onChangingPasswordClicked = () => {
        dispatch(startChangingPassword());
        closePopup();
    }

    const renderPopupContent = () => {
        return (
            <div className={`${commonClasses.popupContent} ${classes.userActionsPopup}`} >
                {currentUser.role !== "user" && 
                    <div>
                        <a 
                            role="presentation"
                            href={DEALBEE_PATHS.admin}  
                        >
                            <div>Trang quản trị</div>
                        </a>
                    </div>
                }

                <div>
                    <a 
                        role="presentation"
                        href={getLinkToProfile(currentUser.username)}  
                    >
                        <div>Xem hồ sơ</div>
                    </a>
                </div>
                
                <div 
                    role="presentation"
                    onClick={() => onChangingPasswordClicked()}
                >
                    <div>Đổi mật khẩu</div>
                </div>

                <div 
                    role="presentation"
                    onClick={() => window.location.href=DEALBEE_PATHS.feedback}
                >
                    <div>Đóng góp ý kiến</div>
                </div>

                <div
                    role="presentation"
                    onClick={() => onLogOutClicked()}
                >
                    <div>Đăng xuất</div>
                </div>
            </div>
        )
    }

    const renderUsersSpace = () => {
        return (
            <div style={{display: "flex", alignItems: "center"}}>
                <a
                    href={getLinkToProfile(currentUser.username)}
                    className={commonClasses.userAvatar}
                    style={{marginRight: "0.25rem"}}
                >
                    <Avatar
                        appearance="circle"
                        size="medium"
                        src={currentUser.info ? currentUser.info.avatarUrl : ''}
                    />
                </a>
                <a 
                    style={{marginRight: "0.5rem"}}
                    href={getLinkToProfile(currentUser.username)}  
                    className={`${classes.flexColCenterWhite} ${classes.username}`}
                >
                    {currentUser.info ? currentUser.info.displayName : currentUser.username}
                </a>
                <UsersNotification />
                <div className={classes.flexColCenterWhite} style={{marginLeft: "0.5rem"}}>
                    <Popup 
                        isOpen={optPopupIsOpen}
                        onClose={() => setOptPopupIsOpen(false)}
                        placement='bottom-end'
                        content={renderPopupContent}
                        trigger={(triggerProps) => (
                            <div 
                                {...triggerProps}
                                role="presentation"
                                className={commonClasses.expandOptionsIcon}
                                onClick={() => setOptPopupIsOpen(!optPopupIsOpen)}
                            >
                                <FontAwesomeIcon icon={faChevronDown}/>
                            </div>
                        )}
                    />
                </div>
            </div>
        )
    }

    const renderButtons = () => (
        <div className={classes.accountBtns}>
            <LogInBtn />
            <SignUpBtn />
        </div>
    )

    const renderLogoOnly = () => {
        return (
            <div className={classes.header} style={{justifyContent: "center"}}>
                <Logo />
            </div>
        )
    }

    const renderFullHeader = () => {
        return (
            <div className={classes.header} id="dealbee-header">
                <div>
                    <Logo />
                    <CategoriesMenu/>
                    <span className={classes.searchContainer}>
                        <SearchDealForm />
                    </span>
                </div>
                    
                <div className={classes.headerOptions}>
                    <div style={{ marginRight: "1rem"}}>
                        <NewDealBtn />
                    </div>
                    {isGettingCurrentUser 
                        ? <div style={{width: "6.5rem"}}></div>
                        : currentUser && currentUser.id
                            ? renderUsersSpace()
                            : renderButtons()
                    }
                        
                </div>
                <ModalTransition>
                    {isShowingErrorMessageModal && <LoginRequiredModal />}
                </ModalTransition>
            </div>
        )
    }

    return (
        <div>
            <div className={classes.headerContainer}>
                {pathName === DEALBEE_PATHS.login || pathName === DEALBEE_PATHS.signup 
                    ? renderLogoOnly()
                    : renderFullHeader()
                }
            </div>
        </div>
    );
};


const useStyles = createUseStyles({
    headerContainer: {
        position: "fixed",
        top: "0px",
        backgroundColor: "rgb(19, 58, 106)",
        display: "flex",
        justifyContent: "center",
        width: "100%",
        zIndex: "100",
        height: "55px",
        alignItems: "center",
    },
    header: {
        display: "grid",
        gridTemplateColumns: "66% auto",
        padding: '0.5rem 4rem',
        width: "100%",
        maxWidth: MAX_PAGE_WIDTH,
        "& > div": {
            "&:first-child": { //logo + search deal form
                display: "flex",
                marginRight: "2rem"
            },
        },
        "@media screen and (max-width: 768px)": {
            display: "flex",
            justifyContent: "space-between",
            gridTemplateColumns: "1fr",
        },
        "@media screen and (max-width: 576px)": {
            padding: "0.5rem 1rem"
        }
    },
    headerOptions: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    flexColCenterWhite: {
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "center",
        color: "white",
        textDecoration: "none",
    },
    userActionsPopup: {
        fontSize: "0.9rem",
        "& > div": {
            padding: "0.75rem !important",
        }
    },
    accountBtns: {
        display: "flex",
        "& > div:not(:last-child)": {
            marginRight: "0.5rem",
        }
    },
    username: {
        "@media screen and (max-width: 400px)": {
            display: "none"
        }
    },
    categoriesList: {
        "& > div": {
            width: "fit-content",
            padding: "0.5rem 0",
        }
    },
    searchContainer: {
        width: "100%",
        "@media screen and (max-width: 768px)": {
            display: "none"
        }
    },
    categoryMenuContainer: {
        backgroundColor: "white",
        margin: "0 4rem",
        borderBottomLeftRadius: "5px",
        borderBottomRightRadius: "5px",
        position: "fixed",
        top: "53px",
        zIndex: "1000",
        boxShadow: '1px 2px 5px rgb(9 30 66 / 13%)',
        "@media screen and (max-width: 576px)": {
            margin: "0 1rem",
            display: "block",
            width: "calc(100% - 2rem)",
        }
    },
    categoriesMenuIcon: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        marginLeft: "0.5rem",
        cursor: "pointer",
        "@media screen and (min-width: 992px)": {
            display: "none"
        },
    },
    slideUp: {
        maxHeight: 0,
        overflowY: "hidden",
        transition: "max-height 0.5s ease-in-out"
    },
    slideDown: {
        maxHeight: "500px",
        overflowY: "hidden",
        transition: "max-height 0.5s ease-in-out"
    },
    searchBarOnMenuContent: {
        marginLeft: "-1.5rem",
        marginBottom: "1rem",
        "@media screen and (min-width: 768px)": {
            display: "none"
        },
    }
});

export default Header;