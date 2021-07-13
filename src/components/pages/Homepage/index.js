import React, { useEffect } from "react";
import { createUseStyles } from "react-jss";
import ActiveMembersList from "./components/ActiveMembersList";
import FeaturedDeals from "../../deal_lists/FeaturedDeals";
import FlashDeals from "../../deal_lists/FlashDeals";
import BestDeals from "../../deal_lists/BestDeals";
import HotDeals from "../../deal_lists/HotDeals";
import PopularDeals from "../../deal_lists/PopularDeals";
import RecentDeals from "../../deal_lists/RecentDeals";
import { useDispatch, useSelector } from "react-redux";
import { getAllDeals } from "../../../redux/deals/action";
import { getActiveMembers } from "../../../redux/users/action";
import { MAX_PAGE_WIDTH } from "../../../services/utils/constant";
import { currentCategorySelector, dealsForUserSelector, featuredDealsSelector, flashDealsSelector } from "../../../selectors/dealsSelectors";
import { currentUserSelector } from "../../../selectors/usersSelector";
import SuggestedDeals from "../../deal_lists/SuggestedDeals";

const useStyle = createUseStyles({
    mainContent: {
        display: "grid",
        gridTemplateColumns: "66% 34%",
        width: "100%",
        maxWidth: MAX_PAGE_WIDTH,
        "@media screen and (max-width: 768px)": {
            gridTemplateColumns: "100%",
        }
    },
    leftCol: {
        marginRight: "2rem",
        "@media screen and (max-width: 768px)": {
            marginRight: "0",
        }
    },
    rightCol: {
        "@media screen and (max-width: 768px)": {
            display: "none"
        }
    },
    rightColResponsive: {
        "@media screen and (min-width: 768px)": {
            display: "none"
        }
    },
    section: {
        padding: "1rem 0",
    },
    sectionTitle: {
        fontWeight: "bold",
        marginBottom: "1rem",
        textTransform: "uppercase",
    }
})

const Homepage = () => {
    const classes = useStyle();
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getAllDeals());
        dispatch(getActiveMembers());
    }, [])

    const featuredDeals = useSelector(featuredDealsSelector);
    const flashDeals = useSelector(flashDealsSelector);
    const currentUser = useSelector(currentUserSelector);
    const dealsForUser = useSelector(dealsForUserSelector);
    const currentCategory = useSelector(currentCategorySelector);

    const renderSectionTitle = (title) => {
        return (
            <h3 className={classes.sectionTitle}>{title}</h3>
        )
    }
    
    const renderLeftCol = () => {
        return (
            <div className={classes.leftCol}>
                {currentUser.id
                    && currentUser.followingCategories
                    && currentCategory === "all"
                    && !(!dealsForUser.isLoading && dealsForUser.list.length === 0)
                    && (
                    <div className={classes.section}>
                        {renderSectionTitle("Dành cho bạn")}
                        <SuggestedDeals forMe={true}/>
                    </div>
                )}
                
                {featuredDeals.list.length > 0 &&
                    <div className={classes.section}>
                        {renderSectionTitle("Deal chọn lọc")}
                        <FeaturedDeals />
                    </div>
                }

                <div className={classes.section}>
                    {renderSectionTitle("Deal nóng")}
                    <HotDeals />
                </div>
                
                {(flashDeals.isLoading || flashDeals.list.length > 0) &&
                    <div className={classes.section}>
                        {renderSectionTitle("Deal nhanh")}
                        <FlashDeals />
                    </div>
                }

                <div className={classes.rightColResponsive}>
                    {renderRightCol()}
                </div>

                
                <div className={classes.section}>
                    {renderSectionTitle("Deal phổ biến")}
                    <PopularDeals />
                </div>

                <div className={classes.section}>
                    {renderSectionTitle("Deal mới")}
                    <RecentDeals />
                </div>
            </div>
        )
    };

    const renderRightCol = () => {
        return (
            <div>
                <div className={classes.section}>
                    {renderSectionTitle("Deal tốt nhất")}
                    <BestDeals />
                </div>
                <div className={classes.section}>
                    {renderSectionTitle("Thành viên tích cực")}
                    <ActiveMembersList />
                </div>
            </div>
        )
    }

    return (
        <div className={classes.mainContent}>
            {renderLeftCol()}
            <div className={classes.rightCol}>
                {renderRightCol()}
            </div>
        </div>
    )
}

export default Homepage;