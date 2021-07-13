import Tooltip from "@atlaskit/tooltip";
import React from "react";
import { getLevelName } from "../../../services/utils/common";

const UserLevelLabel = ({role, point, onClick}) => {
  return (
    <div>
      {role === "admin"
        ? "Quản trị viên"
        : role === "editor" 
            ? "Biên tập viên"
            : role === "moderator"
                ? "Điều hành viên"
                : <div style={{cursor: "pointer"}} onClick={onClick}>
                    <Tooltip content="Xem chi tiết">
                        <div>{`${getLevelName(point)}`}</div>
                    </Tooltip>
                </div> 
      }
    </div>
  )
}

export default UserLevelLabel;