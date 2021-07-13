import React from "react";
import { createUseStyles } from "react-jss";
import { DEALBEE_PATHS } from "../../../services/utils/constant";

const useStyles = createUseStyles({
    logo: {
        fontWeight: "bold",
        color: "white",
        fontSize: "1.25rem",
        cursor: "pointer",
        alignSelf: "center",
        textDecoration: "none",
        textAlign: "center",
    }
})

const Logo = () => {
    const classes = useStyles();

    return (
        <a href={DEALBEE_PATHS.homepage} className={classes.logo}>
            <div>Dealbee</div>
        </a>
    )
}

export default Logo;