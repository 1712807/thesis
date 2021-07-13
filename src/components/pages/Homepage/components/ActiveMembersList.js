import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import { useSelector } from "react-redux";
import { activeMembersSelector } from "../../../../selectors/usersSelector";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import Avatar from '@atlaskit/avatar';
import { getLinkToProfile } from "../../../../services/utils/common";
import { useCommonStyles } from '../../../../services/utils/common_classes';
import UserLevelLabel from "../../../common/components/UserLevelLabel";
import { ModalTransition } from "@atlaskit/modal-dialog";
import ScoreInfoModal from "../../../common/modals/ScoreInfoModal";

const useStyle = createUseStyles ({
    activeMembersList: {
        display: "flex",
        flexDirection: "column",
        margin: "5px 0px 0px",
        padding: "0px 10px",
        borderRadius: "5px",
        border: "1px solid rgb(232, 232, 232)",
        backgroundColor: "white",
    },
    activeMemberContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 0px",
        margin: "0px 5px",
        fontSize: '.875rem',
        "&:not(:last-child)":{
            borderBottom: "1px solid rgb(232, 232, 232)",
        },
        "& img": {
            width: "3rem",
            height: "3rem",
            objectFit: "contain",
        },
    },
    username: {
        marginLeft: "0.5rem",
        "& > a": {
            color: "black",
            textDecoration: "none",
            "&:hover": {
                color: "rgb(4, 135, 229)"
            },
        },
        "& > div": {
            marginTop: "0.15rem",
        }
    },
    postsCount: {
        color: "rgb(71, 71, 71)",
        fontSize: "0.9rem",
    },
})

const ActiveMembersList = () => {
    const activeMembers = useSelector(activeMembersSelector);
    const classes = useStyle();
    const commonClasses = useCommonStyles();
    const [isShowingScoreModal, setIsShowingScoreModal] = useState(false);
    return (
        <div className={classes.activeMembersList}>
            {activeMembers.map((member, index) => (
                <div key={index} className={classes.activeMemberContainer}>
                    <div style={{display: "flex", alignItems: "center", flexWrap: "wrap"}}>
                        <div style={{ minWidth: "1rem" }}>{index + 1}</div>
                        <a href={getLinkToProfile(member.username)} className={commonClasses.userAvatar}>
                            <Avatar
                                appearance="circle"
                                size="medium"
                                src={member.info && member.info.avatarUrl}
                            />
                        </a>
                        <div className={classes.username}>
                            <a 
                                href={getLinkToProfile(member.username)}
                            >
                                {member.info ? member.info.displayName : member.username}
                            </a>
                            <div className={commonClasses.userLevel}>
                                <div style={{marginTop: "-1px", marginRight: "4px"}}><FontAwesomeIcon icon={faStar} /></div>
                                {/* <div>{getLevelName(member.point)}</div> */}
                                <div style={{marginTop: "0.5px"}}>
                                    <UserLevelLabel role="user" point={member.point} onClick={() => setIsShowingScoreModal(true)}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={classes.postsCount}>{member.postsCount} bài đăng</div>
                </div>
            ))}
            <ModalTransition>
                {isShowingScoreModal && <ScoreInfoModal onClose={() => setIsShowingScoreModal(false)}/>}
            </ModalTransition>
        </div>
    )
}

export default ActiveMembersList;