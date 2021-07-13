import React from "react";
import Spinner from "@atlaskit/spinner";

const LoadingSpinner = () => {
    return (
        <div 
            style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                padding: "2rem 0",
            }}
        >
            <Spinner size={40} />
        </div>
    )
}

export default LoadingSpinner;