import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDealsByUser } from "../../redux/users/action";
import { usersDealsSelector } from "../../selectors/usersSelector";
import { useCommonStyles } from "../../services/utils/common_classes";
import ButtonViewMore from "../common/buttons/ButtonViewMore";
import LoadingSpinner from "../common/loaders/LoadingSpinner";
import DealPreviewHorizontal from "../deal_preview/DealPreviewHorizontal";

const UsersDeals = (props) => {
    const {name, isMine} = props;
    const commonClasses = useCommonStyles();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getDealsByUser())
    }, [])

    const usersDeals = useSelector(usersDealsSelector);
    const {list, currentPage, isLoading} = usersDeals;

    return isLoading && list.length === 0 
        ? <LoadingSpinner />
        : (
            <div className={commonClasses.listContainer}>
                {(!isLoading && list.length === 0)
                    ? <div className={commonClasses.emptyDealMsg}>Không có deal nào để hiển thị.</div>
                    : list.map((item) => <DealPreviewHorizontal key={item.id} deal={item}/>)
                }
                {currentPage > 0 && list.length > 0 && (
                    isLoading ? <LoadingSpinner />
                    : <div onClick={() => dispatch(getDealsByUser())}>
                        <ButtonViewMore />
                    </div>
                )}
            </div>
        )
}

export default UsersDeals;