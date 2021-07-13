import React from "react";
import PersonIcon from '@atlaskit/icon/glyph/person';
import LockFilledIcon from '@atlaskit/icon/glyph/lock-filled';
import CreditcardFilledIcon from '@atlaskit/icon/glyph/creditcard-filled';
import EmailIcon from '@atlaskit/icon/glyph/email';
import { useCommonStyles } from "../../../services/utils/common_classes";
import TextfieldWithIcon from "./TextfieldWithIcon";
import { getRegisterValidationMessage } from "../../../services/utils/common";
import { INPUT_LENGTHS } from "../../../services/utils/constant";
import { createUseStyles } from "react-jss";
import UserBlockedMessage from "../components/UserBlockedMessage";

const RegisterFields = (props) => {
  const {tab, user, validation, onChange, onSubmit, isForAdmin} = props;
  const {displayName, username, password, email} = user;
  const commonClasses = useCommonStyles();

  const onTextfieldKeyDown = (e) => {
    const keyCode = e.which || e.keyCode;
    if (keyCode === 13) //enter pressed
        onSubmit();
}
  
  const formFields = [
    {
        key: "displayname",
        value: displayName,
        tabs: ["dang-ky"],
        placeholder: "Họ và tên",
        icon: <CreditcardFilledIcon />,
        onChange: (value) => onChange({...user, displayName: value}),
        minLength: INPUT_LENGTHS.displayName.min,
        maxLength: INPUT_LENGTHS.displayName.max,
    },
    {
        key: "username",
        type: "username",
        value: username,
        tabs: ["dang-nhap", "dang-ky", "doi-mat-khau"],
        placeholder: "Tên đăng nhập",
        icon: <PersonIcon />,
        onChange: (value) => onChange({...user, username: value}),
        minLength: INPUT_LENGTHS.username.min,
        maxLength: INPUT_LENGTHS.username.max,
    },
    {
        key: "email",
        value: email,
        tabs: ["dang-ky", "doi-mat-khau"],
        placeholder: "Email",
        icon: <EmailIcon />,
        onChange: (value) => onChange({...user, email: value}),
        minLength: INPUT_LENGTHS.email.min,
        maxLength: INPUT_LENGTHS.email.max,
    },
    {
        key: "password",
        type: "password",
        value: password,
        tabs: ["dang-nhap", "dang-ky"],
        placeholder: "Mật khẩu",
        icon: <LockFilledIcon />,
        onChange: (value) => onChange({...user, password: value}),
        minLength: INPUT_LENGTHS.password.min,
        maxLength: INPUT_LENGTHS.password.max,
    }
  ]

    const classes = useStyles();
  return (
    <div className={classes.formBody}>
      {formFields.map((item) => {
          const {key, value, placeholder, type, icon, onChange, tabs, minLength, maxLength} = item;
          const validate = validation[`${key}`];
          return tabs.indexOf(tab) >= 0 && (
              <div key={key}>
                  <TextfieldWithIcon 
                      value={value}
                      type={type || "text"}
                      icon={icon}
                      placeholder={placeholder}
                      onChange={onChange}
                      onKeyDown={(e) => onTextfieldKeyDown(e)}
                      isForAdmin={isForAdmin}
                      minLength={minLength}
                      maxLength={maxLength}
                      showMinMaxLimit={tab === "dang-ky"}
                  />
                  {validate !== "valid" &&
                      <div className={commonClasses.asterisk}>
                          {getRegisterValidationMessage(key, validate)}
                      </div>
                  } 
              </div>
          )
      })}
      {validation.isBlocked && tab === "dang-nhap" && <UserBlockedMessage reason={validation.blockedReason}/>}
    </div>
  )
}

const useStyles = createUseStyles({
    formBody: {
        "& > div:not(:last-child)": {
            marginBottom: "1rem",
        }
    }
})

export default RegisterFields;