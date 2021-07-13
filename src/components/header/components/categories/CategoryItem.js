import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeCategory } from "../../../../redux/deals/action";
import { currentCategorySelector } from "../../../../selectors/dealsSelectors";
import { useCommonStyles } from "../../../../services/utils/common_classes";

const CategoryItem = ({ item, actions }) => {
  const dispatch = useDispatch();
  const commonClasses = useCommonStyles();
  const currentCategory = useSelector(currentCategorySelector);
  
  const onClick = () => {
    dispatch(changeCategory(item.value));
    if (actions) actions();
  }
  
  return (
    <div 
        key={item.value} 
        className={`${commonClasses.categoryLabel} ${item.value === currentCategory ? `${commonClasses.categoryLabelSelected}` : ''}`}
        onClick={onClick}
    >
        {item.label}
    </div>
  )
}

export default CategoryItem;