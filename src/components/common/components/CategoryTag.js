import React from "react";
import { createUseStyles } from "react-jss";
import { useSelector } from "react-redux";
import { categoriesSelector } from "../../../selectors/dealsSelectors";

const useStyles = createUseStyles({
    dealCategory: {
        fontSize: "0.6rem",
        fontWeight: "500",
        padding: "5px 8px",
        borderRadius: "3px",
        textTransform: "uppercase",
        color: "rgb(91, 91, 91)",
        border: "1px solid rgb(241, 241, 241)",
        width: "fit-content",
    },
})

const CategoryTag = (props) => {
    const {category, forMe} = props;
    const classes = useStyles();
    const categories = useSelector(categoriesSelector);
    const categoryItem = categories.filter((item) => item.value === category)[0]

    return category ? (
        <div>
            {categoryItem && 
                <div className={classes.dealCategory} style={{backgroundColor: forMe && categoryItem.color, color: forMe && "white"}}>
                    {categoryItem.label}
                </div>
            }
        </div>
    ) : <div></div>
} 

export default CategoryTag;