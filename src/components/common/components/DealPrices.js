import React from "react";
import { createUseStyles } from "react-jss";
import { getPriceText } from "../../../services/utils/common";

const useStyles = createUseStyles({
    newPrice: {
        color: "green",
        // color: "rgb(49, 174, 76)",
        fontWeight: "500",
    },
    originalPrice: {
        fontWeight: "400",
        fontSize: "0.85rem",
        color: "rgb(165, 165, 165)",
        // margin: "0px",
        // lineHeight: "1.41",
        textDecorationLine: "line-through"
    },
})

const DealPrices = (props) => {
    const {newPrice, originalPrice, style, forMe} = props;
    const classes = useStyles();
    return (
        <div style={{
            ...style,
            fontSize: "1.25rem",
            marginBottom: "0.75rem"
        }}>
            <div className={classes.newPrice} style={{color: forMe && "rgb(52, 52, 52)"}}>
                {getPriceText(newPrice)}
            </div>
            <div style={{ lineHeight: "1" }}>
                <span 
                    className={classes.originalPrice}
                    style={{
                        marginTop: style ? "0.3rem" : 0
                    }}
                >
                    {getPriceText(originalPrice)}
                </span>
                {forMe && <span style={{fontSize: "0.875rem", color: "tomato", textDecoration: "none"}}>&nbsp;-{getPriceText(originalPrice - newPrice)}</span>}
            </div>
        </div>
    )
}

export default DealPrices;