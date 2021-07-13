import Checkbox from "@atlaskit/checkbox";
import React from "react";
import { createUseStyles } from "react-jss";
import { useSelector } from "react-redux";
import { categoriesSelector } from "../../../selectors/dealsSelectors";

const CategoriesCheckboxes = (props) => {
  const classes = useStyles();
  const {isDisabled, currentList, onChange, styles} = props;
  const categories = useSelector(categoriesSelector).filter((item) => item.value !== "others");
  const allSelected = currentList.length === categories.length;
  const allCategories = [];
  categories.forEach((item) => {
    allCategories.push(item.value)
  })

  const onCategoryChecked = (item, checked) => {
    if (checked) {
      if (item === "all") {
        onChange(allCategories);
        return;
      }
      if (item === "none") {
        onChange([]);
        return;
      }
      else {
        const newList = [...currentList, item];
        if (newList.length === allCategories.length - 1 && newList.indexOf("all") < 0) {
          onChange(allCategories)
        } else onChange(newList)
      }
      return;
    } 
    if (allSelected && item === "all") onChange ([]);
      else onChange(currentList.filter((cate) => cate !== item && cate !== "all"))
  }

  return (
    <div className={classes.categoriesList} style={styles}>
      {categories.map((item, index) => (
          <Checkbox
              key={index}
              value="allowEdit"
              label={item.value === "all" && allSelected ? "Bỏ chọn tất cả" : item.label}
              onChange={(e) => onCategoryChecked(item.value, e.target.checked)}
              isChecked={
                currentList.filter((cate) => cate === item.value)[0]
                || (allSelected && item.value !== "none")
              }
              isDisabled={isDisabled}
          />
      ))}
    </div>
  )
}

const useStyles = createUseStyles({
  categoriesList: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    marginTop: "0.25rem",
    "& label": {
        width: "fit-content",
      "& input": {
          visibility: "hidden",
        }
    },
    "@media screen and (max-width: 768px)": {
      gridTemplateColumns: "1fr"
    }
}
})

export default CategoriesCheckboxes;