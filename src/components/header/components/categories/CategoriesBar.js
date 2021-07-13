import React from "react";
import { createUseStyles } from "react-jss";
import { useSelector } from "react-redux";
import { categoriesSelector } from "../../../../selectors/dealsSelectors";
import { MAX_PAGE_WIDTH } from "../../../../services/utils/constant";
import CategoryItem from "./CategoryItem";

const useStyle = createUseStyles({
    barContainer: {
        display: "flex",
        justifyContent: "center",
        backgroundColor: "white",
        marginTop: "3.5rem",
        boxShadow: "rgb(0 0 0 / 5%) 0px 1px",
        "@media screen and (max-width: 992px)": {
            display: "none"
        }
    },
    categoriesBar: {
        padding: "0 4rem",
        width: "100%",
        maxWidth: MAX_PAGE_WIDTH,
        display: "flex",
        // flexWrap: "wrap",
        justifyContent: "space-between",
    },
    
})

const CategoriesBar = () => {
    const classes = useStyle();
    const categories = useSelector(categoriesSelector);
    return (
        <div className={classes.barContainer}>
            <div className={classes.categoriesBar}>
                {categories.map((item) => <CategoryItem key={item.value} item={item} /> )}
            </div>
        </div>
    )
}

export default CategoriesBar;