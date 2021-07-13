import React, { useState } from "react";
import Modal from "@atlaskit/modal-dialog";
import TextArea from "@atlaskit/textarea";
import { INPUT_LENGTHS, REPORT_DEAL_TYPES, TEXT_INPUT_CUSTOM_STYLE } from "../../../../services/utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { reportDeal } from "../../../../redux/deals/action";
import { selectedDealSelector } from "../../../../selectors/dealsSelectors";
import { getTimeLabel } from "../../../../services/utils/common";

const ReportDealModal = (props) => {
  const {reported, onClose} = props;
  const isReporting = !reported;

  const selectedDeal = useSelector(selectedDealSelector);
  const {currentUserReported: reportContent} = selectedDeal;

  const [type, setType] = useState(0);
  const [content, setContent] = useState("");

  const dispatch = useDispatch();
  const onConfirm = () => {
    dispatch(reportDeal({type: REPORT_DEAL_TYPES[type].key, content, isReporting}));
    onClose();
  }

  const renderReportForm = () => {
    return (
      <div>
        {REPORT_DEAL_TYPES.map((item, index) => (
            <div key={index}>
                <label>
                    <input
                        type="radio"
                        checked={type === index ? true : false}
                        onChange={() => setType(index)}
                    />
                    <span></span>
                    {item.label}
                </label>
            </div>
        ))}
        <div style={{marginTop: "1rem"}}>
          <div style={{fontWeight: "500", marginBottom: "0.25rem"}}>Nội dung báo cáo</div> 
          <TextArea
            value={content}
            resize="smart"
            onChange={(e) => setContent(e.target.value)}
            minimumRows={3}
            css={TEXT_INPUT_CUSTOM_STYLE}
            maxLength={INPUT_LENGTHS.reportContent.max}
          />
        </div>
      </div>
    )
  }

  const renderReportContent = () => {
    if (!reportContent) return;
    const {reported_at, content, type} = reportContent;
    return (
      <div>
        Bạn đã báo cáo deal này vào {`${getTimeLabel(reported_at)}`}
        {type !== "others" && 
          <span>
            &nbsp;vì lý do <b>{`${REPORT_DEAL_TYPES.filter((item) => item.key === type)[0].label.toLowerCase()}`}</b>
          </span>
        }.
        {content && 
          <div style={{marginTop: "1rem"}}>
            Nội dung báo cáo: <br />
            <TextArea maxLength={INPUT_LENGTHS.reportContent.max} value={content} isReadOnly style={{marginTop: "0.25rem"}} css={TEXT_INPUT_CUSTOM_STYLE}/>
          </div>
        }
      </div>
    )
  }

  return (
    <Modal
      actions={[
        {text: "Hủy", appearance: "subtle", onClick: onClose},
        {
          text: isReporting ? "Gửi báo cáo" : "Xóa báo cáo", 
          appearance: "warning", 
          onClick: onConfirm,
          isDisabled: type === 3 && (!content || !content.trim())
        },
      ]}
      appearance="warning"
      heading={isReporting ? "Báo cáo deal" : "Hủy báo cáo deal"}
      onClose={onClose}
      width={isReporting ? "medium" : "small"}
    >
      {isReporting ? renderReportForm() : renderReportContent()}
    </Modal>
  )
}

export default ReportDealModal;