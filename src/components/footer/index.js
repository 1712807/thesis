import React from "react";
import { DEALBEE_PATHS } from "../../services/utils/constant";

const Footer = () => {
  return (
    <div style={{
      color: "rgb(19, 58, 106)",
      display: "flex",
      justifyContent: "center",
      position: "absolute",
      bottom: "0.25rem",
      width: "100%",
      backgroundColor: "transparent",
    }}>
      <div style={{
        fontWeight: "bold",
        fontSize: "0.75rem",
        padding: "0.75rem",
        textAlign: "center"
      }}>
        &copy;2021 - Dealbee<br/>
        {window.location.pathname!==DEALBEE_PATHS.feedback && <a href={DEALBEE_PATHS.feedback} style={{color: "inherit", textDecoration: "none"}}>Liên hệ - Đóng góp ý kiến</a>}
      </div>
    </div>
  )
}

export default Footer;