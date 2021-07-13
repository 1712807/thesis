import { faEye, faFileAlt, faSort, faTag } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import { useDispatch, useSelector } from "react-redux";
import { changeDealsFilters, changeMenuTab, getDeals, getDealsCount, getReportedDeals, getReportedDealsCount } from "../../../../../redux/admin/action";
import { currentDealListSelector, dealsCountSelector, currentMenuTabSelector, isLoadingDataSelector } from "../../../../../selectors/adminSelectors";
import { currentUserSelector } from "../../../../../selectors/usersSelector";
import { DEALS_PER_PAGE_OPTIONS, DEALS_SORT_OPTIONS, DEALS_VIEW_OPTIONS, REPORTED_DEALS_SORT_OPTIONS } from "../../../../../services/utils/constant";
import DealPreviewWithInlineEdit from "../../../../deal_preview/DealPreviewWithInlineEdit";
import Tabs from '@atlaskit/tabs';
import Pagination from '@atlaskit/pagination';
import ReportedExpiredDeal from './components/ReportedDeals';
import { useCommonStyles } from "../../../../../services/utils/common_classes";
import LoadingSpinner from "../../../../common/loaders/LoadingSpinner";
import { categoriesSelector } from "../../../../../selectors/dealsSelectors";
import { getDocumentTitle, hasEditorPermissionOnCategory } from "../../../../../services/utils/common";
import FilterBar from "../../common/FilterBar";
import FilterPopup from "../../common/FilterPopup";

const useStyles = createUseStyles({
    dealsToReview: {
        "& > div:not(:last-child)": {
            marginBottom: "1rem"
        },
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
    },
    tabContent: {
        width: "100%",
        marginTop: "1rem",
    },
    pagination: {
        display: "flex", 
        justifyContent: "center",
        marginTop: "1rem",
    }
})

const DealsManagement = () => {
    const classes = useStyles();
    const commonClasses = useCommonStyles();
    const dispatch = useDispatch();

    const list = useSelector(currentDealListSelector);
    const currentUser = useSelector(currentUserSelector);
    const allDealsLoaded = useSelector((state) => state.admin.allDealsLoaded);
    const dealsCount = parseInt(useSelector(dealsCountSelector));
    const isLoadingData = useSelector(isLoadingDataSelector);

    useEffect(() => {
        if (!allDealsLoaded && !isLoadingData && currentUser.id) {
            dispatch(getDealsCount());
            dispatch(getDeals());
        }
        document.title = getDocumentTitle("Quản lý deal");
    }, [currentUser.id])

    const [deals, setDeals] = useState([]);
    useEffect(() => {
        setDeals(list);
    }, [list]);

    useEffect(() => {
        if (deals.length === 0 && dealsCount > 0) {
            dispatch(getDeals())
        }
    }, [deals.length])

    const currentTab = useSelector(currentMenuTabSelector);

    const dealsFilters = useSelector((state) => state.admin.dealsFilters);
    const {sortKey, category, viewed, limit, page} = dealsFilters;
    const [categoryPopupIsOpen, setCategoryPopupIsOpen] = useState(false);
    const [limitPopupIsOpen, setLimitPopupIsOpen] = useState(false);

    const categories = useSelector(categoriesSelector);

    const pages = [];
    const maxPage = dealsCount === 0 ? 0 : Math.ceil(dealsCount/limit);
    for (let i = 0; i < maxPage; i++) pages.push(i + 1);

    const onViewChanged = (newViewed) => {
        if (newViewed === viewed) return;
        dispatch(changeDealsFilters({
            viewed: newViewed,
            page: 1,
        }))
        dispatch(getDealsCount())
    }

    const onDealsPerPageChanged = (index) => {
        const newLimit = DEALS_PER_PAGE_OPTIONS[index];
        const newPage = Math.min(pages.length, Math.ceil((limit*page) / newLimit));
        dispatch(changeDealsFilters({
            limit: newLimit,
            page: newPage,
        }))
        setLimitPopupIsOpen(false);
    }

    const onCurrentPageChanged = (index) => {
        dispatch(changeDealsFilters({page: index}))
    }

    const onCategoryChanged = (value) => {
        dispatch(changeDealsFilters({category: value, page: 1}))
        dispatch(getDealsCount());
        setCategoryPopupIsOpen(false);
    }

    const renderSortOptions = (sortOptions) => {
        return (
            <FilterBar 
                options={sortOptions}
                icon={faSort}
                onClick={(value) => dispatch(changeDealsFilters({sortKey: value, page: 1}))}
                currentValue={sortKey}
            />
        )
    }

    const renderViewOptions = () => {
        return (
            <FilterBar 
                options={DEALS_VIEW_OPTIONS}
                icon={faEye}
                onClick={(value) => onViewChanged(value)}
                currentValue={viewed}
            />
        )
    }

    const renderLimitOptions = () => {
        return (
            <FilterPopup 
                icon={faFileAlt}
                label="Số deal mỗi trang:"
                options={DEALS_PER_PAGE_OPTIONS}
                currentValue={limit}
                isNumber={true}
                isOpen={limitPopupIsOpen}
                onClose={() => setLimitPopupIsOpen(false)}
                onOpen={() => setLimitPopupIsOpen(true)}
                onOptionSelected={(index) => onDealsPerPageChanged(index)}
            />
        )
    }

    const renderCategoryOptions = () => {
        const availableCategories = categories.filter((item) => item.value === "all" || hasEditorPermissionOnCategory(currentUser, item.value)) || [];
        return (
            <FilterPopup 
                icon={faTag}
                options={availableCategories}
                currentValue={category}
                isOpen={categoryPopupIsOpen}
                onClose={() => setCategoryPopupIsOpen(false)}
                onOpen={() => setCategoryPopupIsOpen(true)}
                onOptionSelected={(value) => onCategoryChanged(value)}
            />
        )
    }

    const renderFilters = () => {
        return (
            <div className={commonClasses.filters}>
                {renderSortOptions(currentTab !== 3 ? DEALS_SORT_OPTIONS : REPORTED_DEALS_SORT_OPTIONS)}
                {currentTab !== 3 && renderViewOptions()}
                {renderLimitOptions()}
                {renderCategoryOptions()}
            </div>
        )
    }

    const renderDealList = () => {
        if (!isLoadingData && dealsCount === 0) return <div style={{marginTop: "1rem", fontSize: "0.85rem", fontStyle: "italic"}}>Không có deal nào.</div>
        return (
            <div className={commonClasses.dealsPreviewWithInlineEditContainer}>
                {deals.map((item) => (
                    <div key={item.id}>
                        {currentTab !== 3 
                            ? <DealPreviewWithInlineEdit deal={item} isEditor={true}/> 
                            : <ReportedExpiredDeal deal={item}/>
                        }
                    </div>
                ))}
            </div>
        )
    }

    const renderPagination = () => {
        if (pages.length === 0) return "";
        return (
            <div className={classes.pagination}>
                <Pagination 
                    pages={pages} 
                    onChange={(e, index) => onCurrentPageChanged(index)}
                    selectedIndex={page - 1}
                />
            </div>
        )
    }

    const renderTabContent = () => {
        return (
            <div className={classes.tabContent}>
                {renderFilters()}
                {isLoadingData ? <LoadingSpinner /> : renderDealList()}
                {renderPagination()}
            </div>
        )
    }

    const tabsLabel = [
        "Deal chờ duyệt",
        "Deal đã được duyệt",
        "Deal đã bị từ chối",
        "Deal bị báo cáo",
    ]

    const tabs = tabsLabel.map((item, index) => ({
        label: item,
        content: renderTabContent(),
    }));

    const onTabChange = (index) => {
        dispatch(changeMenuTab(index));
        if (index === 3) {
            dispatch(getReportedDealsCount());
            dispatch(getReportedDeals());
            // dispatch(getIsReportedExpiredDealsCount());
            // dispatch(getIsReportedExpiredDeals());
        }
    }

    return (
        <div className={classes.dealsToReview}>
            <Tabs
                tabs={tabs} 
                onSelect={(tab, index) => onTabChange(index)}
                selected={tabs[currentTab]}
            />
        </div>
    );
}

export default DealsManagement;