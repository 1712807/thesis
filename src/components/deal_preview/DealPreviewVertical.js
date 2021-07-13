import React from "react";
import { createUseStyles } from "react-jss";
import { getLinkToDeal, getOriginalPrice } from "../../services/utils/common";
import CategoryTag from "../common/components/CategoryTag";
import DealPrices from "../common/components/DealPrices";
import TimeTag from "../common/components/TimeTag";

const useStyles = createUseStyles({
    dealPreview: {
        /* width: "25%", */
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        margin: "0.25rem 0",
        padding: "0.5rem",
        cursor: "pointer",
        textDecoration: "none",
        "&:hover": {
            backgroundColor: "rgb(246, 251, 255)",
            "& h4": {
                color: "rgb(0, 112, 243)",
            }
        },
        "& img": {
            width: "100%",
            color: "transparent",
            objectFit: "contain",
            objectPosition: "center top",
        }
    },
    dealTitleContainer: {
        width: "100%",
        height: "fit-content",
        fontSize: "1.25rem",
        // minHeight: "3.5rem",
        fontWeight: "500",
        color: "rgb(52, 52, 52)",
        margin: "0",
        overflow: "hidden",
        wordBreak: "break-word",
        display: "-webkit-box",
        boxOrient: "vertical",
        lineClamp: 2,
        "& div": {
            lineClamp: 2,
        }
    },
})

const DealPreviewVertical = (props) => {
    const {deal, type} = props;
    const {info, category} = deal;
    const classes = useStyles();

    const forMe = type === "forMe";

    return (
        <a
            href={getLinkToDeal(deal.id, info.title)}
            className={classes.dealPreview}
            style={{
                "&:not(:lastChild)": {
                    borderRight: "1px solid rgb(232, 232, 232)",
                },
            }}
        >
            <div>
                {type === "flash" && <TimeTag time={deal.expired_at} type="remaining" />}
                <div style={{position: "relative", display: "flex", justifyContent: "center", height: "12rem", padding: "0.25rem"}}>
                    <img src={info.imageUrl ? info.imageUrl : '/images/defaultImg.jpg'}/>
                </div>
                {forMe && <CategoryTag forMe={forMe} category={category} />}
                <h4 className={classes.dealTitleContainer}>
                    <div style={{color: forMe && "green"}}>{info.title}</div>
                </h4>
            </div>
            <div>
                <DealPrices forMe={forMe} newPrice={info.price} originalPrice={info.originalPrice || getOriginalPrice(info.price, info.discount)} />
                {!forMe && <CategoryTag forMe={forMe} category={category} />}
            </div>
        </a>
    )
}

export default DealPreviewVertical;