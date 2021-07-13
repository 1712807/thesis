import React from "react";
import { useCommonStyles } from "../../../services/utils/common_classes";
import { DEALBEE_PATHS } from "../../../services/utils/constant";

const UserBlockedMessage = ({reason}) => {
  const commonClasses = useCommonStyles();

  return (
    <div className={commonClasses.asterisk} style={{marginBottom: "0.5rem"}}>
        Tài khoản này đã bị khóa.
        <div style={{color: "black"}}>
            <span style={{fontWeight: "500"}}>Lý do:</span> {reason} <a href={DEALBEE_PATHS.feedback}>Khiếu nại</a>
        </div>
    </div>
  )
}

export default UserBlockedMessage;