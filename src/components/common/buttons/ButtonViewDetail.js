import Button from "@atlaskit/button";
import React from "react";
import { useSelector } from "react-redux";
import { currentUserSelector } from "../../../selectors/usersSelector";
import { getLinkToDeal, getLinkToDealPreview } from "../../../services/utils/common";

const ButtonViewDetail = (props) => {
    const {id, title, deal, preview} = props;
    const currentUser = useSelector(currentUserSelector);
    const linkToDeal = preview 
        ? `${getLinkToDealPreview(id, title)}` 
        : getLinkToDeal(id, title);

    const onPreview = () => {
        if (!preview) return;
        localStorage.setItem('dealForPreview', JSON.stringify({
            ...deal,
            user_info: currentUser
        }));
    }

    return (
        <div>
            <a href={linkToDeal} target="_blank" style={{textDecoration: "none"}}>
                <div onClick={() => onPreview()}>
                    <Button appearance="subtle">
                        {preview ? "Xem trước" : "Xem deal"}
                    </Button>
                </div>
            </a>
        </div>
    )
}

export default ButtonViewDetail;