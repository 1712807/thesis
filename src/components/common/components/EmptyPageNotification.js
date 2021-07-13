import Button from "@atlaskit/button";
import React from "react";
import { DEALBEE_PATHS } from "../../../services/utils/constant";

const EmptyPageMessage = () => {
    return (
        <div style={{
            width: "100%",
            textAlign: "center",
            padding: "3rem 0",
        }}>
            <h2 style={{fontWeight: "500", marginTop: "0"}}>Rất tiếc, trang bạn đang tìm không tồn tại!</h2>
            <Button 
                appearance="primary"
                onClick={() => window.location.href=DEALBEE_PATHS.homepage}
            >
                Về trang chủ
            </Button>
        </div>
    )
}

export default EmptyPageMessage;