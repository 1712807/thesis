import React from "react";
import { createUseStyles } from "react-jss";
import { getTimeAgoLabel, getTimeLabel, getTimeRemainingLabel } from "../../../services/utils/common";
import Tooltip from "@atlaskit/tooltip";

const TimeTag = (props) => {
    const {time, type} = props;
    const classes = useStyles();

    const getTimeTooltip = () => {
        const label = getTimeLabel(time);
        switch (type) {
            case "remaining": return `Hết hạn vào ${label}`;
            case "ago": return label;
            default: return ""
        }
    }

    return (
        <Tooltip content={getTimeTooltip()}>
            <div 
                onClick={(e) => e.preventDefault()}
                className={classes.container}
                style={{...STYLES[type]}}
            >
                {type === "remaining" && getTimeRemainingLabel(time)}
                {type === "ago" && getTimeAgoLabel(time)}
            </div>
        </Tooltip>
    )
}

const STYLES = {
    remaining: {
        fontWeight: "500",
        backgroundColor: "tomato"
    },
    ago: {
        backgroundColor: "#DFE1E6",
        color: "#42526E",
        fontWeight: "normal",
    }
}

const useStyles = createUseStyles({
    container: {
        backgroundColor: "tomato",
        width: "fit-content",
        color: "white",
        borderRadius: "3px",
        padding: "2px 4px",
        fontSize: "0.8rem",
        fontWeight: "bold",
        marginBottom: '.25rem',
        cursor: "text !important",
    }
})

export default TimeTag;