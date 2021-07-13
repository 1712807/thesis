import { faCheckDouble } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const FeaturedTag = () => {
  return (
    <div style={{
      fontSize: "0.875rem",
      fontWeight: "500",
      color: "green",
      marginBottom: "0.25rem"
    }}>
      <FontAwesomeIcon icon={faCheckDouble} color="green"/>&nbsp;
      Lựa chọn của biên tập viên
    </div>
  )
}

export default FeaturedTag;