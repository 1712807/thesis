import { LoadingButton } from "@atlaskit/button";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { editPendingDeal } from "../../../redux/deals/action";

const ButtonSaveEditedInfoForOwner = (props) => {
    const dispatch = useDispatch();
    const {deal: {id, info, category, preCategory, expiredDate}, isDisabled, closeEditView} = props;
    const [isLoading, setIsLoading] = useState(false);
    const saved = useSelector((state) => state.users.pendingDealEdited);

    useEffect(() => {
        if (saved && isLoading) closeEditView();
        else if (saved === null) setIsLoading(false);
    }, [saved])

    const onSave = () => {
        if (isDisabled) return;
        setIsLoading(true);
        dispatch(editPendingDeal(id, info, category, preCategory, expiredDate));
    }

    return (
        <div>
            <LoadingButton appearance="primary" isDisabled={isDisabled} isLoading={isLoading} onClick={() => onSave()}>
                Lưu thay đổi
            </LoadingButton>
        </div>
    )
}

export default ButtonSaveEditedInfoForOwner;