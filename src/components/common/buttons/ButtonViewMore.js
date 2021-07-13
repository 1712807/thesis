import React from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    viewMoreBtn: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px 0px",
        cursor: "pointer",
        borderBottomLeftRadius: "5px",
        borderBottomRightRadius: "5px",
        "& div": {
            fontSize: "0.75rem",
            fontWeight: "500",
            marginBotton: "2px",
            color: "rgb(91, 91, 91)",
        },
        "&:hover": {
            backgroundColor: "rgb(246, 251, 255)",
        }
    },  
})

const ButtonViewMore = () => {
    const classes = useStyles();
    return (
        <div className={classes.viewMoreBtn}>
            <div>Xem thêm</div>
        </div>
    )
}

export default ButtonViewMore;