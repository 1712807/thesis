import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { faArrowDown, faArrowUp, faIdBadge, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@atlaskit/button";
import { deleteReportsOnDeal, updateExpired, viewDetailUsersReporting } from '../../../../../../redux/admin/action';
import { useDispatch, useSelector } from 'react-redux';
import { getLinkToDeal, getTimeAgoLabel, getTimeLabel, getTimeRemainingLabel, setLevel } from '../../../../../../services/utils/common';
import { useCommonStyles } from "../../../../../../services/utils/common_classes";
import Tooltip from "@atlaskit/tooltip";
import TableOfUsersReporting from '../../../common/TableOfUsersReporting';
import { isShowingUsersReportingSelector } from '../../../../../../selectors/adminSelectors';
import { ModalTransition } from '@atlaskit/modal-dialog';
import IgnoreReportModal from '../../../common/IgnoreReportModal';
import ApproveReportModal from '../../../common/ApproveReportModal';
import ButtonDeleteDeal from '../../../../../common/buttons/ButtonDeleteDeal';
import { getReportedDealApi, getUsersReportedDealApi } from '../../../../../../services/api/admin';
import LoadingSpinner from '../../../../../common/loaders/LoadingSpinner';
import { DEALBEE_PATHS } from '../../../../../../services/utils/constant';

const ReportedExpiredDeal = (props) => {
    const classes = useStyles();
    const commonClasses = useCommonStyles();
    const { isOnly } = props;
    const [deal, setDeal] = useState(props.deal);
    const [isReviewed, setIsReviewed] = useState(false);
    const [isLoading, setIsLoading] = useState(isOnly);
    useEffect(() => {
        const fetchData = async () => {
          const response = await getReportedDealApi({dealId: deal.id});
          if (response.data ) {
            const usersResponse = await(getUsersReportedDealApi({dealId: deal.id}));
            setDeal({
                ...response.data,
                usersReported: usersResponse.data.list,
            })
          } else {
              setIsReviewed(true);
          }
          setIsLoading(false);
        };
        if (isOnly) fetchData();
    }, []);

    const { id, info, user_info, created_at, user_point, expired_at, user_role, times, usersReported, reputation_score } = deal;
    const isLoadingUserList = useSelector((state) => state.admin.isLoadingUsersReported)
    const dispatch = useDispatch();
    const isShowingUsersReporting = useSelector(isShowingUsersReportingSelector);
    const { status, dealId, reportContent } = isShowingUsersReporting;

    const renderUserAndTimePosted = () => {
        return (
            <div className={commonClasses.postedOn}>
                <div>
                    <div>Đăng bởi:&nbsp;</div>
                    <div>
                        {user_info.displayName}&nbsp;&nbsp;&nbsp;
                        <FontAwesomeIcon icon={faStar}/>&nbsp;
                        {user_role === "user" 
                            ? `Thành viên cấp ${setLevel(user_point)}`
                            : `${user_role}`
                        }&nbsp;&nbsp;&nbsp;
                        <FontAwesomeIcon icon={faIdBadge} />&nbsp;{reputation_score} điểm uy tín
                    </div>
                </div>
                <Tooltip content={getTimeLabel(created_at)}>
                    <div>Đăng vào: {getTimeAgoLabel(created_at)}</div>
                </Tooltip>
                {expired_at && 
                    <Tooltip content={`Hết hạn vào ${getTimeLabel(expired_at)}`}>
                        <b style={{color: "tomato"}}>{getTimeRemainingLabel(expired_at)}</b>
                    </Tooltip>
                }
            </div>
        )
    }

    const onViewUserList = () => {
        if (isOnly) return;
        const newStatus = (dealId && dealId !== id && status) ? status : !status;
        dispatch(viewDetailUsersReporting({
            ...isShowingUsersReporting,
            status: newStatus, 
            commentId: '', 
            dealId: id,
            reportContent: [],
        }));
        /* if (newStatus === true && !usersReported) {
            dispatch(getUsersReportedDeal(id))
        } */
    }

    const renderUserReporting = () => {
        const isShowingTable = (status && dealId === id) || isOnly;
        return (
            <div>
                {isOnly ? (
                    <div 
                        className={commonClasses.showUsersReportedLabel}       
                        onClick={onViewUserList}
                    >
                        <div>{`${times} người đã báo cáo`}</div>
                    </div>
                ) : (
                    <Tooltip content={isShowingTable ? "Ẩn danh sách" : "Xem danh sách"}>
                    <div 
                        className={commonClasses.showUsersReportedLabel}       
                        onClick={onViewUserList}
                        style={{display: "flex"}}
                    >
                        <div style={{marginRight: "0.4rem"}}>{`${times} người đã báo cáo`}</div>
                        <span>
                            <FontAwesomeIcon icon={isShowingTable ? faArrowUp : faArrowDown}/>
                        </span>
                    </div>
                </Tooltip>
                )}
                {isShowingTable && (reportContent.length > 0 || isOnly) && <TableOfUsersReporting isLoading={isLoadingUserList} dataRows={isOnly ? usersReported : reportContent} type="reportedDeal" />}
            </div>
        );
    }

    const [isShowingIgnoreModal, setIsShowingIgnoreModal] = useState(false);
    const openIgnoreModal = () => {
        setIsShowingIgnoreModal(true);
    }
    const closeIgnoreModal = () => {
        setIsShowingIgnoreModal(false);
    }

    const onClickIgnoredDealReported = () => {
        deleteReports();
        closeIgnoreModal();
    }

    const [isShowingDeleteModal, setIsShowingDeleteModal] = useState(false);
    const openDeleteModal = () => {
        setIsShowingDeleteModal(true);
    }
    const closeDeleteModal = () => {
        setIsShowingDeleteModal(false);
    }

    const onClickExpiredMark = () => {
        dispatch(updateExpired(true, id))
        deleteReports();
        closeDeleteModal();
    }

    const deleteReports = () => {
        dispatch(deleteReportsOnDeal(id))
    }

    const additionalAction = () => {
        deleteReports();
        if (isOnly) {
            window.location.href=DEALBEE_PATHS.admin;
        }   
    }

    const renderActionButton = () => {
        return(
            <div className={classes.buttonContainer}>
                <Button appearance="subtle" onClick={openIgnoreModal}>
                    Bỏ qua
                </Button>
                <Button appearance="warning" onClick={openDeleteModal}>
                    Đánh dấu deal hết hạn
                </Button>   
                <ButtonDeleteDeal deal={deal} additionalAction={additionalAction}/>     
            </div>
        );
    }
    return isLoading ? <LoadingSpinner /> : isReviewed && isOnly ? (
        <i style={{fontSize: '0.875rem'}}>
            Deal này không bị báo cáo hoặc báo cáo đã được biên tập viên khác phê duyệt.
        </i>
    ) : (
        <div className={classes.container}>
            <a className={classes.title} href={getLinkToDeal(id, info.title)} target='blank'>{info.title}</a>
            {renderUserAndTimePosted()}
            {renderUserReporting()}
            {renderActionButton()}

            <ModalTransition>
                {isShowingIgnoreModal &&
                    <IgnoreReportModal 
                        reportType="deal"
                        onClose={closeIgnoreModal}
                        onConfirm={onClickIgnoredDealReported}
                        additionalAction={additionalAction}
                    />
                }
                {isShowingDeleteModal && 
                    <ApproveReportModal 
                        reportType="deal"
                        onClose={closeDeleteModal}
                        onConfirm={onClickExpiredMark}
                        additionalAction={additionalAction}
                    />
                }
            </ModalTransition>
        </div>
    );
}

const useStyles = createUseStyles({
    container: {
        fontSize: "0.875rem", 
        "& > div:not(:last-child)": {
            marginBottom: "0.5rem"
        },
        "& > a": {
            marginBottom: "0.5rem"
        }
    },
    title: {
        margin: '0',
        fontSize: '1.5rem',
        textDecoration: 'none',
        fontWeight: 'bold',
        width: "100%",
        color: "rgb(52, 52, 52)",
        overflow: "hidden",
        display: "-webkit-box",
        boxOrient: "vertical",
        lineClamp: 3,
        "& div": {
            lineClamp: 3,
        },
        '&:hover': {
            color: 'gray',
        }
    },
    reportInfo: {
        marginBottom: '.5rem',
        display: 'flex',
    },
    buttonContainer: {
        display: "flex",
        justifyContent: 'flex-end',
        fontSize: "1rem",
        "& > button:not(:last-child)": {
            marginRight: "1rem",
        }
    },
    postedUser: {
        display: 'flex',
    }
});

export default ReportedExpiredDeal;