import Popup from "@atlaskit/popup";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useCommonStyles } from "../../../../services/utils/common_classes";

const FilterPopup = (props) => {
  const {isNumber, icon, label, isOpen, onOpen, onClose, options, onOptionSelected, currentValue} = props;
  const commonClasses = useCommonStyles();

  const renderLimitOptions = () => {
    return (
        <div className={commonClasses.popupContent}>
            {options.map((item,index) => ( 
                <div
                    key={index}
                    onClick={() => onOptionSelected(isNumber ? index : item.value)}
                    style={{
                        minWidth: "2rem",
                        textAlign: "center",
                        fontWeight: ((isNumber && currentValue === item) || (!isNumber && currentValue === item.value)) && "bold"
                    }}
                >
                    {isNumber ? item : item.label}
                </div>
            ))}
        </div>
    )
  }

  const currentOption = options.filter((item) => item.value === currentValue)[0] || {}
  return (
      <div style={{ color: "#0052CC", display: "flex"}}>
            <FontAwesomeIcon icon={icon}/>
          <div style={{marginLeft: "0.5rem"}}>
            {isNumber ? label 
                : currentOption.label
            }
          </div>
      <Popup 
          isOpen={isOpen}
          onClose={onClose}
          placement='bottom-end'
          content={renderLimitOptions}
          trigger={(triggerProps) => (
              <div 
                  {...triggerProps}
                  role="presentation"
                  onClick={onOpen}
                  style={{marginLeft: "0.5rem"}}
              > 
                  {isNumber && <span style={{marginRight: "0.5rem"}}>{currentValue}</span>}
                  <FontAwesomeIcon icon={faChevronDown}/>
              </div>
          )}
      />
      </div>
  )
}

export default FilterPopup;