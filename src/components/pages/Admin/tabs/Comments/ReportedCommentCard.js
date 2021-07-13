import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import { useDispatch, useSelector } from "react-redux";
import { ignoreReportedComment, updateReportedComment, viewDetailUsersReporting } from "../../../../../redux/admin/action";
import Avatar from '@atlaskit/avatar';
import Button from "@atlaskit/button";
import moment from 'moment';
import { getLinkToDeal, getLinkToProfile, getTimeAgoLabel } from "../../../../../services/utils/common";
import Tooltip from "@atlaskit/tooltip";
import { faArrowDown, faArrowUp, faFlag, faIdBadge, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { setLevel } from '../../../../../services/utils/common';
import TableOfUsersReporting from '../../common/TableOfUsersReporting';
import { isShowingUsersReportingSelector } from '../../../../../selectors/adminSelectors';
import { useCommonStyles } from "../../../../../services/utils/common_classes";
import { ModalTransition } from "@atlaskit/modal-dialog";
import BlockUserModal from "../../../../common/modals/BlockUserModal";
import IgnoreReportModal from "../../common/IgnoreReportModal";
import ApproveReportModal from "../../common/ApproveReportModal";

const ReportedComments = (props) => {
    const classes = useStyles();
    const commonClasses = useCommonStyles();
    const dispatch = useDispatch();

    const { comment, isOnly } = props;
    const {
        id,
        info,
        content,
        owner_info,
       /*  reportContent, */
        created_at,
        deal_id,
        owner_role,
        owner_action,
        owner_point,
        owner_username,
        numberOfReported,
        user_id,
        is_reported,
    } = comment;

    const user = {
        id: user_id,
        username: owner_username,
        info: owner_info,
    }

    const isShowingUsersReporting = useSelector(isShowingUsersReportingSelector);
    const isLoading = useSelector((state) => state.admin.isLoading)
    const { status, commentId, reportContent } = isShowingUsersReporting;
    const createdAt = getTimeAgoLabel(created_at);

    const [isShowingBlockModal, setIsShowingBlockModal] = useState(false);
    const openBlockModal = () => {
        setIsShowingBlockModal(true);
    };
    const closeBlockModal = () => {
        setIsShowingBlockModal(false);
    }
    const onClickDeletedMark = () => {
        dispatch(updateReportedComment(true, id, isOnly));
        closeDeleteModal();
    };

    const [isShowingIgnoreModal, setIsShowingIgnoreModal] = useState(false);
    const openIgnoreModal = () => {
        setIsShowingIgnoreModal(true);
    }
    const closeIgnoreModal = () => {
        setIsShowingIgnoreModal(false);
    }

    const onClickIgnoredReport = () => {
        dispatch(ignoreReportedComment(id, isOnly));
        closeIgnoreModal()
    };

    const [isShowingDeleteModal, setIsShowingDeleteModal] = useState(false);
    const openDeleteModal = () => {
        setIsShowingDeleteModal(true);
    }
    const closeDeleteModal = () => {
        setIsShowingDeleteModal(false);
    }
    const displayingContent = content.text < 200 ? content.text : `${content.text.substring(0, 200)}... `
    const [seeMoreContent, setSeeMoreContent] = useState(false)

    const renderCommentContent = () => {   
        const seeMoreText = seeMoreContent ? "Ẩn chi tiết" : "Xem thêm"    
        return (
            <div className={classes.comment}>
                
                <div className={classes.commentOn}>
                    <div className={classes.cmtOnTime}>
                        {createdAt} •&nbsp;
                    </div>
                    <a
                        href={getLinkToDeal(deal_id, info.title)}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {info.title}
                    </a>
                </div>
            
                <div className={classes.contentContainer}>
                    <div className={classes.userAvatar}>
                        <Avatar size="medium" src={owner_info.avatarUrl} />
                    </div>
                    <div>
                        <a 
                            target="_blank"
                            rel="noreferrer"
                            className={classes.name} 
                            href={getLinkToProfile(owner_username)}
                        >
                            {owner_info.displayName}
                        </a>
                        <div style={{fontSize: "1rem"}}>
                            {seeMoreContent ? `${content.text} ` : displayingContent}
                            {content.text.length >= 200 && 
                                <b
                                    className={classes.seeMore}
                                    onClick={() => setSeeMoreContent(!seeMoreContent)}
                                >
                                    {seeMoreText}
                                </b>
                            }
                        </div>
                    </div>
                </div>   
            </div>
        )
    }

    const renderUserReporting = () => {
        const numberOfPeopleReporting = is_reported && is_reported.length;
        const newStatus = (commentId && commentId !== id && status) ? status : !status;
        const isShowingTable = status && commentId === id;
        return (
            <div>
                <Tooltip content={isShowingTable ? "Ẩn danh sách" : "Xem danh sách"}>
                    <div 
                        style={{display: "flex"}}
                        className={commonClasses.showUsersReportedLabel}
                        onClick={() => dispatch(viewDetailUsersReporting({status: newStatus, commentId: id, dealId: '', reportContent: []}))}
                    >
                        <span style={{marginRight: "0.4rem"}}>{`${numberOfPeopleReporting} người đã báo cáo`}</span>
                        <FontAwesomeIcon icon={isShowingTable ? faArrowUp : faArrowDown}/>
                    </div>
                </Tooltip>
                {isShowingTable && reportContent.length > 0 && <TableOfUsersReporting dataRows={reportContent} type="reportedComment" isLoading={isLoading} />}
            </div>
        );
    }
    
    const renderActionButton = () => {
        return(
            <div className={classes.buttonContainer}>
                {/* {owner_role !== 'admin' && <div className={classes.blockAction} onClick={openBlockModal}>KHÓA TÀI KHOẢN</div>} */}
                <div>
                    <Button appearance="subtle" onClick={openIgnoreModal}>
                        Bỏ qua
                    </Button>
                    <Button appearance="warning" onClick={openBlockModal}>
                        Khóa tài khoản
                    </Button>
                    <Button appearance="danger" onClick={openDeleteModal}>
                        Xóa bình luận
                    </Button> 
                </div>
            </div>
        );
    }

    const renderCommentOwnerInfo = () => {
        return(
            <div>
                <div className={classes.reportedLabel}>
                    <FontAwesomeIcon icon={faFlag}/>Người dùng đã bị báo cáo <b>{numberOfReported} lần</b>
                </div>
                <div className={classes.ownerInfoContainer}>
                    <div>
                        <FontAwesomeIcon icon={faStar}/>
                        {owner_role === "user" 
                            ? `Thành viên cấp ${setLevel(owner_point)}`
                            : `${owner_role}`}
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faIdBadge} />{owner_action.reputation_score || 0} điểm uy tín
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={classes.commentCard}>  
            {renderCommentContent()}
            {renderCommentOwnerInfo()}
            {renderUserReporting()}
            {renderActionButton()}

            <ModalTransition>
                {isShowingBlockModal && 
                    <BlockUserModal 
                        onClose={closeBlockModal} 
                        user={user} 
                        isBlocking={true}
                        additionalAction={onClickDeletedMark}
                        additionalLabel="Bình luận này sẽ bị xóa"
                    />
                }
                {isShowingIgnoreModal &&
                    <IgnoreReportModal 
                        reportType="comment"
                        onClose={closeIgnoreModal}
                        onConfirm={onClickIgnoredReport}
                    />
                }
                {isShowingDeleteModal && 
                    <ApproveReportModal 
                        reportType="comment"
                        onClose={closeDeleteModal}
                        onConfirm={onClickDeletedMark}
                    />
                }
            </ModalTransition>
        </div>
    );
}


const useStyles = createUseStyles({
    commentCard: {
        padding: '1rem',
        fontSize: "0.875rem",
        "& > div:not(:last-child)": {
            marginBottom: "1rem",
        },
        borderBottom: "medium solid rgb(232, 232, 232)",
        "&:last-child": {
            borderBottomLeftRadius: "5px",
            borderBottomRightRadius: "5px",
        }
    },
    comment: {
        padding: "0.5rem",
        border: "thin solid gray",
        borderRadius: "5px",
    },
    commentOn: {
        display: "flex",
        fontSize: "0.8rem",
        "& div":{
            color: "gray",
            minWidth: "fit-content",
        },
        "& a": {
            textDecoration: "none",
            color: '#680fa0',
            fontWeight: '500',
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
        },
        marginBottom: "0.5rem",
    },
    contentContainer: {
        "& > div": {
            whiteSpace: 'pre-wrap',
            overflowWrap: 'anywhere',
        },
        display: "flex",
    },
    userAvatar: {
        marginRight: '0.75rem',
        cursor: 'pointer',
        '&:hover': {
          filter: 'grayscale(.4)',
        },
    },
    name: {
        cursor: 'pointer',
        fontWeight: 'bold',
        color: 'black',
        textDecoration: 'none',
        '&:hover': {
          textDecoration: 'underline',
        },
    },
    reportInfo: {
        marginBottom: '.5rem',
        display: 'flex',
        fontSize: '.8rem',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        fontSize: '1rem !important',
        "& > div": {
            display: "flex",
            "& > button:not(:last-child)": {
                marginRight: "1rem"
            } 
        }
    },
    ownerInfoContainer: {
        display: "flex",
        "& > div:not(:last-child)": {
            marginRight: "1rem"
        },
        width: "fit-content",
        '& svg': {
            color: "rgb(252, 166, 9)",
            marginTop: "0.2rem",
            marginRight: "0.5rem",
        },
    },
    blockAction: {
        fontWeight: "500",
        cursor: "pointer",
        textTransform: "uppercase",
        color: "tomato",
        fontSize: "0.8rem",
        marginRight: '1rem',
        '&:hover': {
            textDecoration: 'underline',
        }
    },
    styleForHead: {
        '& th:first-child': {
            paddingLeft: '.5rem',
        }
    },
    reportedLabel: {
        color: "tomato !important",
        "& svg": {
            color: "tomato !important",
            marginTop: "0.2rem",
            marginRight: "0.5rem",
        }
    },
    seeMore: {
        cursor: 'pointer',
        '&:hover': {
          textDecoration: 'underline',
        }
    }
})

export default ReportedComments;