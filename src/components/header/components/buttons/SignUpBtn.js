import Button from "@atlaskit/button";
import React from "react";
import { saveLocation } from "../../../../services/utils/common";
import PersonIcon from '@atlaskit/icon/glyph/person';
import { createUseStyles } from "react-jss";
import { DEALBEE_PATHS } from "../../../../services/utils/constant";

const SignUpBtn = () => {
  const classes = useStyles();

  const onClick = () => {
    saveLocation(window.location.href);
    window.location.href=DEALBEE_PATHS.signup;
  }
  
  return (
    <div style={{minWidth: "32px"}}>
      <div className={classes.iconBtn}>
        <Button
          iconBefore={<PersonIcon />}
          appearance="primary"
          onClick={onClick}
        >
        </Button>
      </div>
      <div className={classes.btnWithText}>
        <Button
          appearance="primary"
          onClick={onClick}
        >
          Đăng ký
        </Button>
      </div>
    </div>
  )
}

const useStyles = createUseStyles({
  iconBtn: {
    "@media screen and (min-width: 576px)": {
      display: "none",
    }
  },
  btnWithText: {
    "@media screen and (max-width: 576px)": {
      display: "none"
    }
  }
})

export default SignUpBtn;