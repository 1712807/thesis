import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDeal } from "../../../redux/deals/action";
import { selectedDealSelector } from "../../../selectors/dealsSelectors";
import { currentUserSelector } from "../../../selectors/usersSelector";
import { getDocumentTitle, hasEditorPermission } from "../../../services/utils/common";
import DealPreviewWithInlineEdit from "../../deal_preview/DealPreviewWithInlineEdit";
import ReportedExpiredDeal from "./tabs/Deals/components/ReportedDeals";
import ReportedCommentCard from "./tabs/Comments/ReportedCommentCard";
import { getReportedComment, getReportedCommentByUserIdApi } from "../../../services/api/admin";
import { useCommonStyles } from "../../../services/utils/common_classes";
import LoadingSpinner from "../../common/loaders/LoadingSpinner";

const AdminDealPage = (props) => {
    const {dealId, commentId} = props;
    const commonClasses = useCommonStyles()
    const dispatch = useDispatch();
    const selectedDeal = useSelector(selectedDealSelector);
    const currentUser = useSelector(currentUserSelector);
    const searchParams = new URLSearchParams(window.location.search);
    const isReportedDeal = searchParams.get("isReportedDeal");
    const isReportedComment = searchParams.get("isReportedComment");
    useEffect(() => {
        if (currentUser.role) {
            if (dealId && hasEditorPermission(currentUser.role)) 
                dispatch(getDeal(dealId));
        }
    }, [currentUser])

    const [reportedComment, setReportedComment] = useState(null);
    const [isReviewed, setIsReviewed] = useState(false);
    useEffect(() => {
        const fetchData = async() => {
            const res = await getReportedComment(commentId);
            if (res.data.comment) {
                const comment = res.data.comment;
                const countOwnerRes = await getReportedCommentByUserIdApi(comment.user_id);
                comment.numberOfReported = countOwnerRes.data.count
                setReportedComment(comment)
            } else {
                setIsReviewed(true)
            }
        };
        if (isReportedComment) fetchData()
    },[]);

    const ownerInfo = selectedDeal ? selectedDeal.user_info || {user_action: {}} : {user_action: {}};
    if (selectedDeal.info && selectedDeal.info.title) {
        document.title = getDocumentTitle(selectedDeal.info.title, 50)
    }

    const renderReportedComment = () => {
        return (
            (isReportedComment && (
                <div className={commonClasses.listContainer} style={{padding: reportedComment === null && isReviewed && '1rem', width: 'auto'}}>
                    {reportedComment === null ? (isReviewed
                    ? <i style={{fontSize: '0.875rem'}}>
                        Bình luận này không bị báo cáo hoặc báo cáo đã được điều hành viên khác phê duyệt.
                     </i>
                    : <LoadingSpinner />) :
                        <ReportedCommentCard comment={reportedComment} isOnly={true} />
                    }
                </div>
            ))
        );
    }
    return !selectedDeal.id
        ? !isReportedComment
            ? <div style={{
                backgroundColor: "white",
                padding: "1rem",
                borderRadius: "5px",
                flex: 1,
            }}><LoadingSpinner /></div>
            : renderReportedComment()
        : (
            <div style={{
                backgroundColor: "white",
                padding: "1rem",
                borderRadius: "5px",
                flex: 1,
            }}>
                {isReportedDeal ? (
                    <ReportedExpiredDeal isOnly={true} deal={selectedDeal}/>
                ) : (
                    <DealPreviewWithInlineEdit 
                        deal={{
                            ...selectedDeal,
                            user_info: ownerInfo.info,
                            user_role: ownerInfo.role,
                            user_reputation_score: ownerInfo.user_action.reputation_score,
                        }} 
                        isEditor={true}
                        type="full-page"
                    />
                )}
            </div>
    )
}

export default AdminDealPage;