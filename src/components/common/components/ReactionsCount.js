import { faComment, faEye, faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    reactionsCount: {
        fontSize: "0.85rem",
        padding: "0.5rem",
        color: "gray",
        display: "flex",
        "& > div:not(:last-child)": {
            marginRight: "1rem",
        }
    },
    number: {
        // fontWeight: "bold",
        marginLeft: "5px",
        marginTop: "-2px",
    }
})

const ReactionsCount = (props) => {
    const {count: {likes, comments, views}, type} = props;
    const classes = useStyles();
    return (
        <div 
            className={classes.reactionsCount}
            style={{
                fontWeight: type === "popular" ? "500" : "normal",
                color: type === "popular" ? "navy" : "gray",
            }}
        >
            <div>
                <FontAwesomeIcon icon={faEye}/>
                <span className={classes.number}>{views}</span>
            </div>
            
            <div>
                <FontAwesomeIcon icon={faThumbsUp}/>
                <span className={classes.number}>{likes}</span>
            </div>
            
            <div>
                <FontAwesomeIcon icon={faComment}/>
                <span className={classes.number}>{comments}</span>
            </div>
        </div>
    )
} 

export default ReactionsCount;