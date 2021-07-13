import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { createUseStyles } from "react-jss";

const FilterBar = (props) => {
  const {icon, options, onClick, currentValue} = props;
  const classes = useStyles();

  return (
    <div className={classes.filterBar}>
      <div><FontAwesomeIcon icon={icon}/></div>
      {options.map((item) => (
          <div
              key={item.value}
              onClick={() => onClick(item.value)}
              style={{
                  color: currentValue === item.value ? "#0052CC" : "gray",
                  opacity: currentValue === item.value ? 1 : 0.8,
              }}
          >
              {item.label}
          </div>
      ))}
    </div>
  )
}

const useStyles = createUseStyles({
  filterBar: {
    color: "#0052CC",
    display: "flex",
    "& > div": {
      "&:not(:last-child)": {
        marginRight: "0.5rem",
      },
      "&:hover": {
        color: "black !important",
      }
    }
  }
})

export default FilterBar;