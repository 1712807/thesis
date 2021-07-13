import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFeaturedDeals } from "../../redux/deals/action";
import { featuredDealsSelector } from "../../selectors/dealsSelectors";
import { useCommonStyles } from "../../services/utils/common_classes";
import ButtonViewMore from "../common/buttons/ButtonViewMore";
import LoadingSpinner from "../common/loaders/LoadingSpinner";
import DealPreviewHorizontal from "../deal_preview/DealPreviewHorizontal";
import SectionLoader from "../common/loaders/SectionLoader";

const FeaturedDeals = () => {
    const dispatch = useDispatch();
    const commonClasses = useCommonStyles();

    const featuredDeals = useSelector(featuredDealsSelector);
    const {list, offset} = featuredDeals;
    const isLoading = useSelector((state) => state.deals.isLoadingFeaturedDeals);

    return isLoading //&& offset === 0 
        ? <SectionLoader height={400} />
        : (
            <div className={commonClasses.listContainer}>
                {list.map((item) => <DealPreviewHorizontal key={item.id} deal={item}/>)}
                {offset > 0 && (
                    isLoading 
                        ? <LoadingSpinner />
                        : <div onClick={() => dispatch(getFeaturedDeals())}>
                            <ButtonViewMore />
                        </div>
                )
                }
            </div>
        )
}

export default FeaturedDeals;