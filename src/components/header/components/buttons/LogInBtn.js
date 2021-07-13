import Button from "@atlaskit/button";
import React from "react";
import { createUseStyles } from "react-jss";
import { saveLocation } from "../../../../services/utils/common";
import { DEALBEE_PATHS } from "../../../../services/utils/constant";

const LogInBtn = () => {
  const classes = useStyles();

  const onClick = () => {
    saveLocation(window.location.href);
    window.location.href=DEALBEE_PATHS.login;
  }
  
  return (
    <div className={classes.logInBtn}>
      <Button appearance="subtle" onClick={onClick}>
        Đăng nhập
      </Button>
    </div>
  )
}

const useStyles = createUseStyles({
  logInBtn: {
    "& span": {
      color: "lightgray !important",
    },
    "@media screen and (max-width: 992px)": {
      display: "none !important"
    }
  }
})

export default LogInBtn;