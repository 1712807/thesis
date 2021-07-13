import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { editDeal } from "../../../redux/admin/action";
import { LoadingButton } from "@atlaskit/button";

const ButtonSaveEditedInfo = (props) => {
    const {deal, isDisabled, closeEditView} = props;
    const dispatch = useDispatch();
    const saved = useSelector((state) => state.admin.dealEdited);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (saved && isLoading) closeEditView();
        else if (saved === null) setIsLoading(false);
    }, [saved])

    const onBtnSaveClicked = () => {
        if (isDisabled) return;
        setIsLoading(true);
        dispatch(editDeal(deal));
        // closeEditView();
    }

    return (
        <div>
            <LoadingButton appearance="primary" isDisabled={isDisabled} onClick={() => onBtnSaveClicked()}>
                Lưu
            </LoadingButton>
        </div>
    )
}

export default ButtonSaveEditedInfo;