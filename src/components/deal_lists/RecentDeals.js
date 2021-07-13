                    
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRecentDeals } from "../../redux/deals/action";
import { recentDealsSelector } from "../../selectors/dealsSelectors";
import { useCommonStyles } from "../../services/utils/common_classes";
import ButtonViewMore from "../common/buttons/ButtonViewMore";
import LoadingSpinner from "../common/loaders/LoadingSpinner";
import DealPreviewHorizontal from "../deal_preview/DealPreviewHorizontal";
import SectionLoader from "../common/loaders/SectionLoader";

const RecentDeals = () => {
    const dispatch = useDispatch();
    const commonClasses = useCommonStyles();

    const recentDeals = useSelector(recentDealsSelector);
    const {list, offset, isLoading} = recentDeals;

    return isLoading && offset === 0 ? <SectionLoader height={600}/> : (
        <div className={commonClasses.listContainer}>
            {list.map((item) => <DealPreviewHorizontal type="recent" key={item.id} deal={item}/>)}
            {offset >= 0 && (
                isLoading   
                    ? <LoadingSpinner />
                    : <div onClick={() => dispatch(getRecentDeals())}>
                        <ButtonViewMore />
                    </div>
            )
            }
        </div>
    )
}

export default RecentDeals;