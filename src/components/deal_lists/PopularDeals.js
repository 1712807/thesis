import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPopularDeals } from "../../redux/deals/action";
import { popularDealsSelector } from "../../selectors/dealsSelectors";
import { useCommonStyles } from "../../services/utils/common_classes";
import ButtonViewMore from "../common/buttons/ButtonViewMore";
import DealPreviewHorizontal from "../deal_preview/DealPreviewHorizontal";
import SectionLoader from "../common/loaders/SectionLoader";

const PopularDeals = () => {
    const dispatch = useDispatch();
    const commonClasses = useCommonStyles();

    const popularDeals = useSelector(popularDealsSelector);
    const {list, offset, isLoading} = popularDeals;

    return isLoading && offset === 0 
        ? <SectionLoader height={500}/> : (
        <div className={commonClasses.listContainer}>
            {list.map((item) => <DealPreviewHorizontal key={item.id} deal={item} type="popular"/>)}
            {offset > 0 && 
                <div onClick={() => dispatch(getPopularDeals())}>
                    <ButtonViewMore />
                </div>
            }
        </div>
    )
}

export default PopularDeals;