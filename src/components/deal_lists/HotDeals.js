import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { getHotDeals } from "../../redux/deals/action";
import { hotDealsSelector } from "../../selectors/dealsSelectors";
import { useCommonStyles } from "../../services/utils/common_classes";
import ButtonViewMore from "../common/buttons/ButtonViewMore";
import LoadingSpinner from "../common/loaders/LoadingSpinner";
import DealPreviewHorizontal from "../deal_preview/DealPreviewHorizontal";
import SectionLoader from "../common/loaders/SectionLoader";

const HotDeals = () => {
    const dispatch = useDispatch();
    const commonClasses = useCommonStyles();

    const hotDeals = useSelector(hotDealsSelector);
    const {list, offset, isLoading} = hotDeals;

    return isLoading && offset === 0 
        ? <SectionLoader height={400} />
        : (
            <div className={commonClasses.listContainer}>
                {list.map((item) => <DealPreviewHorizontal type="hot" key={item.id} deal={item}/>)}
                {offset >= 0 && (
                    isLoading   
                        ? <LoadingSpinner />
                        : <div onClick={() => dispatch(getHotDeals())}>
                            <ButtonViewMore/>
                        </div>
                )
                }
            </div>
        )
}

export default HotDeals;