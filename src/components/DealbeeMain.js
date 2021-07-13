import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentUserProfile } from "../redux/users/action";
import Header from "./header/index";
import Homepage from "./pages/Homepage";
import CategoriesBar from "./header/components/categories/CategoriesBar";
import UserProfile from "./pages/UserProfile";
import EditProfileModal from "./common/modals/EditProfileModal";
import DealDetail from "./pages/DealDetail";
import { isEditingInfoSelector, isChangingPasswordSelector, isGettingCurrentUserSelector } from "../selectors/usersSelector";
import { ModalTransition } from "@atlaskit/modal-dialog";
import RegisterPage from "./pages/Register";
import { createUseStyles } from "react-jss";
import ChangePasswordModal from "./common/modals/ChangePasswordModal";
import SearchKeyDeals from './deal_lists/SearchKeyDeals';
import AdminMain from "./pages/Admin";
import FlagNotification from "./common/components/FlagNotification";
import NewDealForm from "./pages/NewDeal";
import { isEmptyPageSelector } from "../selectors/appSelectors";
import EmptyPageMessage from "./common/components/EmptyPageNotification";
import { setDetailDealPage } from "../redux/app/action";
import Footer from "./footer";
import { changeCategory, getCategories } from "../redux/deals/action";
import FeedbackForm from "./pages/Feedback";
import { DEALBEE_PATHS } from "../services/utils/constant";

const useStyles = createUseStyles({
    dealbeeMain: {
        minHeight: "560px",
        position: "relative",
        paddingBottom: "3rem",
    },
    mainContent: {
        marginTop: "3rem",
    },
    pageContainer: {
        padding: "0 4rem",
        maxWidth: "100%",
        display: "flex",
        justifyContent: "center",
        "@media screen and (max-width: 576px)": {
            padding: "0 1rem",
            display: "block",
        }
    },
})

const DealbeeMain = () => {
    const classes = useStyles();
    const dispatch = useDispatch();

    const isEditingInfo = useSelector(isEditingInfoSelector);
    const isChangingPassword = useSelector(isChangingPasswordSelector);
    const isEmptyPage = useSelector(isEmptyPageSelector);
    const isGettingCurrentUser = useSelector(isGettingCurrentUserSelector);
    const [isRouting, setIsRouting] = useState(true);

    useEffect(() => {
        dispatch(getCurrentUserProfile());
        dispatch(getCategories())
    }, [])

    const category = localStorage.getItem('category');
    if (category) {
        dispatch(changeCategory(category));
        localStorage.removeItem('category');
    }

    const pathName = window.location.pathname;
    const slashIndex = pathName.indexOf("/", 2);
    const page = slashIndex < 0
        ? pathName
        : pathName.slice(0, slashIndex);
    const lastSlashIndex = pathName.lastIndexOf("/");
    const isPreview = lastSlashIndex === slashIndex 
        ? false
        : pathName.slice(slashIndex+1, lastSlashIndex) === "xem-truoc"
    const seperatorIndex = pathName.lastIndexOf("-");
    const dealId = pathName.slice(seperatorIndex+1, pathName.length);
    
    useEffect(() => {
        if (!isGettingCurrentUser) {
            if (page === DEALBEE_PATHS.deal) {
                dispatch(setDetailDealPage({
                    id: dealId,
                    slug: pathName.slice(slashIndex + 1, seperatorIndex),
                    isPreview,
                }))
            }
            if (page === DEALBEE_PATHS.userProfile) {
                dispatch(setDetailDealPage({
                    username: pathName.slice(lastSlashIndex+1, pathName.length),
                }))
            }
            setIsRouting(false);
        }
    }, [isGettingCurrentUser])

    const renderMainContent = () => {
        switch(page) {
            case DEALBEE_PATHS.homepage: 
                return <Homepage />
            case DEALBEE_PATHS.deal: 
                return <DealDetail />
            case DEALBEE_PATHS.newDeal: 
                return <NewDealForm />
            case DEALBEE_PATHS.userProfile: 
                return <UserProfile />
            case DEALBEE_PATHS.login:
            case DEALBEE_PATHS.signup:
            case `${DEALBEE_PATHS.login}?required=true`: 
                return <RegisterPage tab={page.slice(1,page.length)}/>
            case DEALBEE_PATHS.admin: 
                return <AdminMain />
            case DEALBEE_PATHS.searchDeal: 
                return <SearchKeyDeals />
            case DEALBEE_PATHS.feedback:
                return <FeedbackForm />
            default: return <EmptyPageMessage />
        }
    }

    return (
        <div 
            className={classes.dealbeeMain}
            style={{
                backgroundColor: "rgb(233, 235, 238)"
            }}
        >
            <Header/>
            {isEmptyPage 
                ? <div className={classes.mainContent}>
                    <EmptyPageMessage />
                </div>
                : <div className={classes.mainContent}>
                    {page === "/" && <CategoriesBar/>}
                    <div className={classes.pageContainer}>
                        {!isRouting && renderMainContent()}
                    </div>
                </div>
            }
            <Footer />
                
            <ModalTransition>
                {isEditingInfo && <EditProfileModal />}
                {isChangingPassword && <ChangePasswordModal />}
            </ModalTransition>
            <FlagNotification />
        </div>
    )
}

export default DealbeeMain; 