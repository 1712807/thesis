import React from "react";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { useDispatch, useSelector } from "react-redux";
import { getReportedComments, getReportedCommentsCount, changeCommentsFilters } from "../../../../../redux/admin/action";
import { currentCommentListSelector, commentsCountSelector, isLoadingDataSelector, isShowingConfirmActionOnReportedCommentModalSelector } from "../../../../../selectors/adminSelectors";
import { DEALS_PER_PAGE_OPTIONS, REPORTED_DEALS_SORT_OPTIONS } from "../../../../../services/utils/constant";
import Pagination from '@atlaskit/pagination';
import ReportedCommentCard from './ReportedCommentCard';
import LoadingSpinner from "../../../../common/loaders/LoadingSpinner";
import { useCommonStyles } from '../../../../../services/utils/common_classes';
import { faFileAlt, faSort } from "@fortawesome/free-solid-svg-icons";
import FilterBar from "../../common/FilterBar";
import FilterPopup from "../../common/FilterPopup";
import { getDocumentTitle } from "../../../../../services/utils/common";

const useStyles = createUseStyles({
    dealsToReview: {
        "& > div:not(:last-child)": {
            marginBottom: "0.25rem",
        },
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        padding: "0 8px",
    },
    pagination: {
        display: "flex", 
        justifyContent: "center",
        marginTop: "1rem",
    },
})

const ReportedComments = () => {
    const classes = useStyles();
    const commonClasses = useCommonStyles();
    const dispatch = useDispatch();

    const dealsFilters = useSelector((state) => state.admin.dealsFilters);
    const {sortKey, limit, page} = dealsFilters;
    const [limitPopupIsOpen, setLimitPopupIsOpen] = useState(false);

    const isLoadingData = useSelector(isLoadingDataSelector);
    const list = useSelector(currentCommentListSelector);
    const commentsCount = useSelector(commentsCountSelector);
    const pages = [];
    const maxPage = commentsCount === 0 ? 0 : Math.ceil(commentsCount/limit);
    for (let i=0; i<maxPage; i++) pages.push(i+1);

    useEffect(() => {
        dispatch(getReportedCommentsCount());
        dispatch(getReportedComments());
        document.title = getDocumentTitle("Quản lý bình luận");
    },[])

    const onCurrentPageChanged = (index) => {
        dispatch(changeCommentsFilters({page: index}))
    }

    const onDealsPerPageChanged = (index) => {
        const newLimit = DEALS_PER_PAGE_OPTIONS[index];
        const newPage = Math.min(pages.length, Math.ceil((limit*page) / newLimit));
        dispatch(changeCommentsFilters({
            limit: newLimit,
            page: newPage,
        }))
        setLimitPopupIsOpen(false);
    }

    const renderFilters = () => {
        return (
            <div className={commonClasses.filters} style={{marginTop: '1rem'}}>
                <FilterBar 
                    icon={faSort}
                    options={REPORTED_DEALS_SORT_OPTIONS}
                    currentValue={sortKey}
                    onClick={(value) => dispatch(changeCommentsFilters({sortKey: value}))}
                />
                <FilterPopup 
                    icon={faFileAlt}
                    label="Số bình luận mỗi trang:"
                    isNumber={true}
                    options={DEALS_PER_PAGE_OPTIONS}
                    currentValue={limit}
                    isOpen={limitPopupIsOpen}
                    onClose={() => setLimitPopupIsOpen(false)}
                    onOpen={() => setLimitPopupIsOpen(true)}
                    onOptionSelected={(index) => onDealsPerPageChanged(index)}
                />
            </div>
        )
    }

    return (
        <div className={classes.dealsToReview}>
            <div className={commonClasses.adminManagementTitle}>Bình luận bị báo cáo</div>
            {renderFilters()}
            {isLoadingData 
                ? <LoadingSpinner />
                : list.length === 0 
                    ? <div style={{fontSize: "0.85rem", marginTop: "1rem", fontStyle: "italic"}}>Hiện tại không có bình luận nào bị báo cáo.</div>
                    : <div className={commonClasses.listContainer}>
                        {list.map((item) => <ReportedCommentCard comment={item} />)}
                    </div>
            }
            {(pages.length > 0 && !isLoadingData) && 
                <div className={classes.pagination}>
                    <Pagination 
                        pages={pages} 
                        onChange={(e, index) => onCurrentPageChanged(index)}
                        selectedIndex={page - 1}
                    />
                </div>
            }
        </div>
    );
}

export default ReportedComments;