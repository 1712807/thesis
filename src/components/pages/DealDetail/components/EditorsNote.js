import Modal, { ModalTransition } from "@atlaskit/modal-dialog";
import TextArea from "@atlaskit/textarea";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { useDispatch, useSelector } from "react-redux";
import { deleteEditorsNote, updateEditorsNote } from "../../../../redux/admin/action";
import { selectedDealSelector } from "../../../../selectors/dealsSelectors";
import { currentUserSelector } from "../../../../selectors/usersSelector";
import { hasEditorPermissionOnCategory } from "../../../../services/utils/common";
import Tooltip from "@atlaskit/tooltip";
import { useCommonStyles } from "../../../../services/utils/common_classes";
import { INPUT_LENGTHS, TEXT_INPUT_CUSTOM_STYLE } from "../../../../services/utils/constant";

const EditorsNote = (props) => {
    const {type} = props;
    const classes = useStyles();
    const commonClasses = useCommonStyles();
    const dispatch = useDispatch();

    const currentUser = useSelector(currentUserSelector);
    const selectedDeal = useSelector(selectedDealSelector);
    const {editors_note: editorsNote, category} = selectedDeal;

    const [isShowingDeleteModal, setIsShowingDeleteModal] = useState();
    const [isShowingEditModal, setIsShowingEditModal] = useState();
    const [newNote, setNewNote] = useState();

    useEffect(() => {
        if (editorsNote) setNewNote(editorsNote.content);
        else setNewNote('')
    }, [editorsNote])
    
    const textInput = useRef(null);
    const onEditModalOpen = () => {
        setIsShowingEditModal(true);
        setTimeout(() => {
            if (textInput.current) {
              textInput.current.focus();
              textInput.current.selectionStart = textInput.current.value.length;
              textInput.current.selectionEnd = textInput.current.value.length;
            }
        }, 500);
    }

    const onEditModalClose = () => {
        setNewNote(editorsNote.content)
        setIsShowingEditModal(false)
    }

    const onChangeSaved = () => {
        dispatch(updateEditorsNote(newNote));
        setIsShowingEditModal(false)
    }

    const onDeleteModalClose = () => {
        setIsShowingDeleteModal(false);
    }

    const onDelete = () => {
        dispatch(deleteEditorsNote());
        setNewNote(null);
        setIsShowingDeleteModal(false);
    }

    const renderAdminActions = () => {
        return (
            <div className={commonClasses.dealActionsForEditor}>
                <div style={{color: "darkgreen"}} onClick={() => onEditModalOpen()}>
                    <Tooltip content="Ch???nh s???a ghi ch??">
                        <FontAwesomeIcon icon={faEdit} />
                    </Tooltip>
                </div>
                <div style={{color: "tomato"}} onClick={() => setIsShowingDeleteModal(true)}>
                    <Tooltip content="X??a ghi ch??">
                        <FontAwesomeIcon icon={faTrash} />
                    </Tooltip>
                </div>
            </div>
        
        )
    }

    const renderEditModal = () => {
        return (
            <Modal
                actions={[
                    { text: 'H???y', onClick: onEditModalClose, appearance: "subtle" },
                    { text: 'L??u', onClick: onChangeSaved, appearance: "primary", isDisabled: isShowingEditModal && (!newNote || !newNote.trim() || newNote === editorsNote.content) },
                ]}
                onClose={onEditModalClose}
                heading={type === "add" ? "Th??m ghi ch??" : "Ch???nh s???a ghi ch??"}
                width="medium"
            >
                <TextArea 
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    ref={textInput}
                    css={TEXT_INPUT_CUSTOM_STYLE}
                    minimumRows={5}
                    maxLength={INPUT_LENGTHS.note.length}
                />
            </Modal>
        )
    }

    const renderDeleteModal = () => {
        return (
            <Modal
                actions={[
                    { text: 'H???y', onClick: onDeleteModalClose, appearance: "subtle" },
                    { text: 'X??c nh???n', onClick: onDelete, appearance: "warning" },
                ]}
                onClose={onDeleteModalClose}
                heading="X??a ghi ch???"
                appearance="warning"
                width="small"
            >
                B???n s??? kh??ng th??? ho??n t??c h??nh ?????ng n??y.
            </Modal>
        )
    }

    return (!editorsNote || !editorsNote.content) ? '' : (
        <div className={classes.editorsNote}>
            <div style={{ fontSize: "1rem", display: "flex" }}>
                <span style={{marginRight: "0.5rem"}}>Ghi ch?? c???a bi??n t???p vi??n</span>
                {hasEditorPermissionOnCategory(currentUser, category) && renderAdminActions() }
            </div>
            <div className={commonClasses.paragraph}>{isShowingEditModal ? editorsNote.content : newNote}</div>
            
            <ModalTransition>
                {isShowingEditModal && renderEditModal()}
                {isShowingDeleteModal && renderDeleteModal()}
            </ModalTransition>
        </div>
    )
}

const useStyles = createUseStyles({
    editorsNote: {
        borderTop: 'thin solid lightgray',
        padding: "1rem 0",
        fontSize: "0.875rem",
        "& > div": {
            margin: "0 !important",
        },
        "& > div:first-child": {
            fontWeight: '500', 
            marginBottom: "0.5rem !important",
            textTransform: "uppercase",
            alignItems: "center",
            width: "fit-content"
        },
    },
})
export default EditorsNote;