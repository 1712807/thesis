import React from "react";
import Modal from "@atlaskit/modal-dialog";
import { getLevelName } from "../../../services/utils/common";
import { createUseStyles } from "react-jss";
import { LEVEL_POINTS } from "../../../services/utils/constant";

const ScoreInfoModal = (props) => {
  const {isMine, name, point, onClose} = props;
  const nameLabel = isMine ? "Bạn" : name;
  const levelLabel = getLevelName(point);
  const classes = useStyles();

  return (
    <Modal
      actions={[
        {text: "Đóng", appearance: "primary", onClick: onClose}
      ]}
      onClose={onClose}
      heading="Thông tin hạng thành viên"
      width="medium"
    >
      <div className={classes.modalBody}>
        {isMine && (
          <div>
            {`${nameLabel} hiện đang là ${levelLabel}`}<br></br>
            {`Điểm hiện tại: ${point}`}
          </div>
        )}

        <div>
          <h3>Xếp hạng thành viên Dealbee</h3>
          <div className={classes.guide}>
            {LEVEL_POINTS.map((item, index) => index < 5 && 
              <div>
                <div>{`${getLevelName(item)}`}</div>
                <div>{item} điểm</div>
              </div>
            )}
          </div>
        </div>
        <div className={classes.guide}>
          <h3>
            Cách tính điểm
          </h3>
          <div>
            <div>Chia sẻ khuyến mãi</div>
            <div>+20 điểm tương tác</div>
          </div>

          <div>
            <div>Bình luận</div>
            <div>+5 điểm tương tác</div>
          </div>
          
          <div>
            <div>Tương tác với khuyến mãi</div>
            <div>+1 điểm tương tác</div>
          </div>

          <div>
            <div>Khuyến mãi bạn chia sẻ được thích</div>
            <div>+1 điểm uy tín</div>
          </div>

          <div>
            <div>Tài khoản nhận lượt theo dõi từ người dùng khác</div>
            <div>+2 điểm danh tiếng</div>
          </div>

          <i style={{fontWeight: 500, display: "block", marginTop: "0.5rem"}}>Tổng điểm của bạn = Điểm tương tác + Điểm uy tín + Điểm danh tiếng</i>

        </div>
      </div>
    </Modal>
  )
}

const useStyles = createUseStyles({
  modalBody: {
    fontSize: "0.875rem",
    "& > div:not(:last-child)": {
      marginBottom: "0.75rem",
    },
    "& h3": {
      margin: 0,
      marginBottom: "0.25rem",
      fontSize: "1rem",
      fontWeight: "500",
      textTransform: "uppercase"
    }
  },
  guide: {
    "& > div": {
      display: "grid",
      gridTemplateColumns: "3fr 2fr",
      alignItems: "center",
      "& > div:first-child": {
        marginRight: "0.75rem"
      }
    }
  }
})

export default ScoreInfoModal;