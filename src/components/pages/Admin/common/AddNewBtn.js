import React from "react";
import AddIcon from '@atlaskit/icon/glyph/add';
import Button from "@atlaskit/button";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    button: {
        "& span": {
            fontSize: "0.75rem",
            fontWeight: "bold",
        }
    }
})

const AddNewBtn = (props) => {
    const classes = useStyles();
    const { type, onClick } = props;

    return (
        <div className={classes.button}>
            <Button
                appearance="subtle"
                iconBefore={<AddIcon size="small" />}
                onClick={onClick}
            >
                Thêm {type} mới
            </Button>
        </div>
    )
}

export default AddNewBtn;