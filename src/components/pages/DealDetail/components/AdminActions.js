import React, { useEffect, useState } from "react";
import { useCommonStyles } from "../../../../services/utils/common_classes";
import { useDispatch, useSelector } from "react-redux";
import { selectedDealSelector } from "../../../../selectors/dealsSelectors";
import Modal, { ModalTransition } from "@atlaskit/modal-dialog";
import ModalConfirmDelete from "./ModalConfirmDelete";
import { markDealAsFeatured, updateEditorsNote, updateExpired } from "../../../../redux/admin/action";
import TextArea from "@atlaskit/textarea";
import { hasEditorPermissionOnCategory, isPastDate } from "../../../../services/utils/common";
import Tooltip from "@atlaskit/tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faEdit, faExclamationTriangle, faMinusCircle, faStickyNote } from "@fortawesome/free-solid-svg-icons";
import ApproveReportModal from "../../Admin/common/ApproveReportModal";
import { detailPageParamsSelector } from "../../../../selectors/appSelectors";
import { currentUserSelector } from "../../../../selectors/usersSelector";
import { DEALBEE_PATHS, INPUT_LENGTHS, TEXT_INPUT_CUSTOM_STYLE } from "../../../../services/utils/constant";

const AdminActions = () => {
    const commonClasses = useCommonStyles();
    const dispatch = useDispatch();
    
    const deal = useSelector(selectedDealSelector);
    const {id, status, featured, editors_note, expired_at, expired, category} = deal;
    const isExpired = expired || isPastDate(expired_at);
    const editorsNote = editors_note ? editors_note.content : '';

    const detailPageParams = useSelector(detailPageParamsSelector);
    const {isPreview} = detailPageParams;
    const currentUser = useSelector(currentUserSelector);
    
    useEffect(() => {
       if (status !== "approved" && !isPreview) directToAdminPage()
    }, [status])

    const [isDeleting, setIsDeleting] = useState(false);
    const onStopDeleting = () => {
        setIsDeleting(false);
    }

    const directToAdminPage = () => {
        if (hasEditorPermissionOnCategory(currentUser, category)) {
            window.location.href = `${DEALBEE_PATHS.admin}?dealId=${id}`
        }
    }

    const renderDeleteDealAction = () => (
        <div style={{color: "tomato"}} onClick={() => setIsDeleting(true)}>
            <Tooltip content="G??? deal">
                <FontAwesomeIcon icon={faMinusCircle}/>
            </Tooltip>
        </div>
    )

    const [isAddingNote, setIsAddingNote] = useState(false);
    const [newNote, setNewNote] = useState('');
    const onStopAddingNote = () => {
        setIsAddingNote(false);
    }

    const addNote = () => {
        dispatch(updateEditorsNote(newNote));
        setIsAddingNote(false);
    }

    const renderAddNoteAction = () => (
        <div style={{color: "darkorange"}} onClick={() => setIsAddingNote(true)}>
            <Tooltip content="Th??m ghi ch??">
                <FontAwesomeIcon icon={faStickyNote}/>
            </Tooltip>
        </div>
    )

    const renderMarkAsFeaturedAction = () => (
        <div 
            style={{color: featured ? "green" : ""}}
            onClick={() => dispatch(markDealAsFeatured(!featured))}
        >
            {featured 
                ? <Tooltip content="B??? ????nh d???u deal ch???n l???c">
                    <FontAwesomeIcon icon={faCheckCircle}/>
                </Tooltip>
                : <Tooltip content="????nh d???u l?? deal ch???n l???c">
                    <FontAwesomeIcon icon={faCheckCircle}/>
                </Tooltip>
            }
        </div>
    )

    const renderEditDealAction = () => (
        <div style={{color: "darkgreen"}} onClick={() => directToAdminPage()}>
            <Tooltip content="Ch???nh s???a deal">
                <FontAwesomeIcon icon={faEdit}/>
            </Tooltip>
        </div>
    )

    const [isShowingConfirmExpiredModal, setIsShowingConfirmExpiredModal] = useState(false);
    const openConfirmExpiredModal = () => {
        setIsShowingConfirmExpiredModal(true)
    }
    const closeConfirmExpiredModal = () => {
        setIsShowingConfirmExpiredModal(false);
    }
    const onExpiredConfirmed = () => {
        dispatch(updateExpired(true, id));
        closeConfirmExpiredModal();
    }

    const renderMarkDealAsExpiredAction = () => (
        <div style={{color: "darkslategray"}} onClick={openConfirmExpiredModal}>
            <Tooltip content="????nh d???u deal h???t h???n">
                <FontAwesomeIcon icon={faExclamationTriangle}/>
            </Tooltip>
        </div>
    )

    const renderActions = () => {
        return status === "approved" ? (
            <div className={commonClasses.dealActionsForEditor} style={{flexDirection: "column"}}>
                {renderEditDealAction()}
                {renderMarkAsFeaturedAction()}
                {!editorsNote && renderAddNoteAction()}
                {!isExpired && renderMarkDealAsExpiredAction()}
                {renderDeleteDealAction()}
            </div>
        ) : ''
    }

    return (
        <div>
            {renderActions()}
            <ModalTransition>
                {isDeleting && <ModalConfirmDelete 
                    deal={{...deal, editorsNote}} 
                    onClose={onStopDeleting} 
                />}
                {isAddingNote && 
                    <Modal
                        width="medium"
                        actions={[
                            { text: 'H???y', onClick: onStopAddingNote, appearance: "subtle" },
                            { text: 'L??u', onClick: addNote, appearance: "primary", isDisabled: !newNote || !newNote.trim() }, 
                        ]}
                        onClose={onStopAddingNote}
                        heading="Th??m ghi ch??"
                    >
                        <TextArea 
                            minimumRows={5} 
                            placeholder="Nh???p n???i dung ghi ch??..." 
                            value={newNote} 
                            onChange={(e) => setNewNote(e.target.value)} 
                            css={TEXT_INPUT_CUSTOM_STYLE}
                            maxLength={INPUT_LENGTHS.note.max}
                        />
                    </Modal>
                }
                {isShowingConfirmExpiredModal && 
                    <ApproveReportModal 
                        reportType="deal"
                        onClose={closeConfirmExpiredModal}
                        onConfirm={onExpiredConfirmed}
                        expiredAt={expired_at}
                    />
                }
            </ModalTransition>
        </div>
    )
}

export default AdminActions;