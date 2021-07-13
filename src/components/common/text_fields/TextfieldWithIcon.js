import React, { useState } from "react";
import { TEXT_INPUT_CUSTOM_STYLE } from "../../../services/utils/constant";
import Textfield from "@atlaskit/textfield";
import Tooltip from "@atlaskit/tooltip";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash, faRandom } from '@fortawesome/free-solid-svg-icons';
import * as passwordGenerator from "generate-password";

const TextfieldWithIcon = (props) => {
  const {value, minLength, maxLength, isInvalid, type, placeholder, icon, onChange, onKeyDown, isForAdmin, showMinMaxLimit} = props;
  const [isShowingPassword, setIsShowingPassword] = useState(isForAdmin);
  const content = `${placeholder}${showMinMaxLimit ? ` (${type === "username" ? "không khoảng trắng, " : ""}${minLength} - ${maxLength} ký tự)` : ''}`;

  return (
    <div style={{
      position: "relative",
      alignItems: "center",
    }}>
      <Textfield 
        value={value}
        isInvalid={isInvalid}
        type={type === "password" && !isShowingPassword ? "password" : "text"}
        placeholder={content}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown || {}}
        css={{...TEXT_INPUT_CUSTOM_STYLE, paddingLeft: "1.75rem"}}
        minLength={minLength}
        maxLength={maxLength}
      />
      <div style={{
        position: "absolute",
        top: 8,
        left: 5,
        color: "gray",
      }}> 
        <Tooltip content={content}>{icon}</Tooltip>
      </div>
      {type === "password" && (
        <div style={{
          position: "absolute",
          top: 8,
          right: 10,
          color: "dimgray",
          cursor: "pointer",
        }}>
          {isForAdmin ? (
            <div onClick={() => onChange(passwordGenerator.generate({length: 20, number: true}))}>
              <FontAwesomeIcon icon={faRandom} />
            </div>
          ) : (
            <div onClick={() => setIsShowingPassword(!isShowingPassword)}>
              <FontAwesomeIcon icon={isShowingPassword ? faEye : faEyeSlash} />
            </div>
          )}
        </div>
      )}
    </div>
  )

}

export default TextfieldWithIcon;