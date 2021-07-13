import React from "react";
import { createUseStyles } from "react-jss";
import { useSelector } from "react-redux";
import { bestDealsSelector, selectedDealSelector } from "../../selectors/dealsSelectors";
import { useCommonStyles } from "../../services/utils/common_classes";
import DealPreviewWithoutThumbnail from "../deal_preview/DealPreviewWithoutThumbnail";
import SectionLoader from "../common/loaders/SectionLoader";

const useStyles = createUseStyles({
    bestDealsContainer: {
        "& a": {
            textDecoration: "none",
        },
        fontSize: "0.75rem",
        width: "100%",
        maxWidth: "100%"
    },
})

const BestDeals = () => {
    const classes = useStyles();
    const commonClasses = useCommonStyles();
    
    const bestDeals = useSelector(bestDealsSelector);
    const selectedDeal = useSelector(selectedDealSelector);
    const {list: listFromState, isLoading} = bestDeals;
    const list = selectedDeal.id 
        ? listFromState.filter((item) => item.id !== selectedDeal.id)
        : listFromState

    return isLoading ? <SectionLoader height={700}/> : (
        <div className={`${commonClasses.listContainer} ${classes.bestDealsContainer}`}>
            {list.map((item) => <DealPreviewWithoutThumbnail key={item.id} deal={item}/>)}
        </div>
    )
}

export default BestDeals;