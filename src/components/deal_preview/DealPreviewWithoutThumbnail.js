import { faComment, faEye, faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { createUseStyles } from "react-jss";
import { getLinkToDeal, getPriceText } from "../../services/utils/common";
import CategoryTag from "../common/components/CategoryTag";


const DealPreviewWithoutThumbnail = (props) => {
    const {deal} = props;
    const {info, category, interaction} = deal;
    const classes = useStyles();

    return (
        <div className={classes.dealPreview}>
            <a href={getLinkToDeal(deal.id, info.title)}>
                <div className={classes.dealTitleContainer}>
                    <h4>
                        <span className={classes.price}>
                            {getPriceText(info.price)}
                        </span>&nbsp;&nbsp;
                        {info.title}</h4>
                </div>
            </a>
            
            <div className={classes.basicInfo}>
                <div className={classes.basicInfo}>
                    <div style={{fontWeight: "bold"}}><FontAwesomeIcon icon={faThumbsUp}/> {interaction.likes}</div>
                    <div><FontAwesomeIcon icon={faEye}/> {interaction.views}</div>
                    <div style={{marginRight: 0}}><FontAwesomeIcon icon={faComment}/> {interaction.comments}</div>
                </div>
                {category && <CategoryTag category={category}/>}
            </div>
        
        </div>
    )
}

const useStyles = createUseStyles({
    dealPreview: {
        maxWidth: "100%",
        // borderLeft: "3px solid gray",
        padding: "0.75rem 0.5rem",
        "&:not(:last-child)": {
            borderBottom: "thin solid lightgray"
        },
        "&:first-child": {
            borderTopLeftRadius: "5px",
            borderTopRightRadius: "5px"
        },
        "&:last-child": {
            borderBottomLeftRadius: "5px",
            borderBottomRightRadius: "5px"
        },
        "&:hover":{
            backgroundColor: "#f2f2f2",
        }
    },
    dealTitleContainer: {
        width: "100%",
        fontWeight: "500",
        color: "rgb(52, 52, 52)",
        maxHeight: "1.5rem",
        wordBreak: "break-word",
        marginBottom: "0.25rem",

        display: "block",
        // justifyContent: "flex-start",
        overflow: "hidden",

        "& h4": {
            margin: "0 !important",
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxheight: "100%",
            fontSize: "1rem",
            fontWeight: "500",
        }
    },
    price: {
        color: "green",
        fontSize: "1rem",
        fontWeight: "bold",
    },
    basicInfo: {
        color: "gray",
        display: "flex",
        flexWrap: "wrap",
        alignContent: "center",
        alignItems: "center",
        "& > div": {
            marginRight: "1rem"
        }
    },
    category: {
        border: "1px solid rgb(241, 241, 241)",
        borderRadius: "5px",
        marginRight: "1rem",
        padding: "0 5px"
    }
})

export default DealPreviewWithoutThumbnail;