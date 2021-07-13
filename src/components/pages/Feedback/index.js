import React, { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { useCommonStyles } from "../../../services/utils/common_classes";
import Button, { LoadingButton } from "@atlaskit/button";
import TextArea from "@atlaskit/textarea";
import Textfield from "@atlaskit/textfield";
import { DEALBEE_PATHS, FEEDBACK_TYPES, INPUT_LENGTHS, TEXT_INPUT_CUSTOM_STYLE } from "../../../services/utils/constant";
import validator from "validator";
import { useDispatch, useSelector } from "react-redux";
import { sendFeedback } from "../../../redux/users/action";
import { getDocumentTitle } from "../../../services/utils/common";
import { currentUserSelector, isGettingCurrentUserSelector } from "../../../selectors/usersSelector";

const FeedbackForm = () => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const commonClasses = useCommonStyles();

  const [feedback, setFeedback] = useState({name: "", email: "", content: "", type: FEEDBACK_TYPES[0].key});
  const { name, email, type, content } = feedback;
  const feedbackSent = useSelector((state) => state.users.feedbackSent);
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = useSelector(currentUserSelector);
  const isGettingCurrentUser = useSelector(isGettingCurrentUserSelector);

  useEffect(() => {
    document.title = getDocumentTitle("Liên hệ - Phản hồi");
  })

  useEffect(() => {
    if (!isGettingCurrentUser && currentUser.id) {
      setFeedback({
        ...feedback,
        name: currentUser.info.displayName || '',
        email: currentUser.email || '',
      })
    }
  }, [isGettingCurrentUser])

  const onSubmit = () => {
    setIsLoading(true);
    dispatch(sendFeedback(feedback))
  }

  const renderHeader = () => {
    return (
      <div className={commonClasses.formHeader}>
        <h3>Liên hệ - Phản hồi</h3>
      </div>
    )
  }

  const renderNameField = () => {
    return (
      <div>
          <div>Họ và tên <span className={commonClasses.asterisk}>*</span></div>
          <Textfield
            placeholder="Tên của bạn"
            value={name}
            onChange={(e) => setFeedback({...feedback, name: e.target.value})}
            css={TEXT_INPUT_CUSTOM_STYLE}
            maxLength={INPUT_LENGTHS.displayName.max}
          />
      </div>
    )
  }

  const renderEmailField = () => {
    return (
      <div>
          <div>Email <span className={commonClasses.asterisk}>*</span></div>
          <Textfield
            placeholder="Email của bạn"
            value={email}
            onChange={(e) => setFeedback({...feedback, email: e.target.value})}
            css={TEXT_INPUT_CUSTOM_STYLE}
            maxLength={INPUT_LENGTHS.email.max}
          />
      </div>
    )
  }

  const renderTypeField = () => {
    return (
      <div>
        <div>Loại phản hồi <span className={commonClasses.asterisk}>*</span></div>
        <div className={classes.types}>
          {FEEDBACK_TYPES.map((item, index) => (
            <div key={index}>
                <label>
                    <input
                        type="radio"
                        checked={type === item.key ? true : false}
                        onChange={() => setFeedback({ ...feedback, type: item.key })}
                    />
                    <span></span>
                    {item.label}
                </label>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderContentField = () => {
    return (
      <div>
          <div>Nội dung <span className={commonClasses.asterisk}>*</span></div>
          <TextArea
            placeholder="(50 - 2000 ký tự)"
            value={content}
            onChange={(e) => setFeedback({...feedback, content: e.target.value})}
            css={TEXT_INPUT_CUSTOM_STYLE}
            maxLength={2000}
            minimumRows={5}
          />
      </div>
    )
  }

  const renderBody = () => {
    return (
      <div className={commonClasses.inputForm}>
        {renderNameField()}
        {renderEmailField()}
        {renderTypeField()}
        {renderContentField()}
      </div>
    )
  }

  const isInvalid = () => {
    if (!validator.isLength(name, INPUT_LENGTHS.displayName)) return true;
    if (!validator.isEmail(email)) return true;
    if (!content || content.trim().length < 50) return true;
    return false;
  }

  const renderFooter = () => {
    return (
      <div className={classes.formFooter}>
        <LoadingButton
            appearance="primary" 
            onClick={onSubmit}
            isLoading={isLoading}
            isDisabled={isInvalid()}
        >
          Gửi
        </LoadingButton>
      </div>
    )
  }

  return (
    <div style={{display: "flex", justifyContent: "center"}}>
      {feedbackSent ? (
        <div className={commonClasses.formContainer} style={{textAlign: "center"}}>
          <div>Phản hồi của bạn đã được ghi nhận. Xin cảm ơn bạn đã dành thời gian đóng góp ý kiến cho chúng tôi!</div>
          <Button appearance="primary" onClick={() => window.location.href=DEALBEE_PATHS.homepage}>
            Về trang chủ
          </Button>
        </div>
      ) : (
        <div className={commonClasses.formContainer}>
          {renderHeader()}
          {renderBody()}
          {renderFooter()}
        </div>
      )}
    </div>
  )
}

const useStyles = createUseStyles({
  formFooter: {
    width: "100%",
    marginTop: "0.5rem",
    textAlign: "center",
    "& button": {
        width: "100% !important",
    },
  },
  types: {
    fontSize: "0.875rem",
    "& label": {
      alignItems: "center"
    }
  }
})

export default FeedbackForm;