import React, { useState } from "react";
import Drawer from "@atlaskit/drawer";
import MenuIcon from "@atlaskit/icon/glyph/menu";
import { useSelector } from "react-redux";
import { categoriesSelector } from "../../../../selectors/dealsSelectors";
import CategoryItem from "./CategoryItem";
import { createUseStyles } from "react-jss";
import SearchDealForm from "../SearchDealForm";
import { DEALBEE_PATHS } from "../../../../services/utils/constant";

const CategoriesMenu = () => {
  const classes = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const categories = useSelector(categoriesSelector);
  
  const pathName = window.location.pathname;
  const isHomepage = pathName === DEALBEE_PATHS.homepage || pathName === "";

  return (
    <div>
      <div className={classes.menuIcon} onClick={() => setIsOpen(true)}>
          <MenuIcon size="large" primaryColor="white"/>
      </div>
      <Drawer
        onClose={() => setIsOpen(false)}
        isOpen={isOpen}
        width="200px"
        overrides={{
          Sidebar: {
            cssFn: (defaultStyles) => ({
              ...defaultStyles,
              margin: "0 0.5rem",
              width: "fit-content",
            }),
          },
          Content: {
            cssFn: (defaultStyles) => ({
              ...defaultStyles,
              // marginTop: "4.5rem",
            })
          }
        }}
      >
        <div>
          <div className={classes.searchContainer}>
                <SearchDealForm />
          </div>
          {isHomepage && (
            <div>
              <h4 style={{margin: "0"}}>Chọn ngành hàng</h4>
              <div className={classes.categoriesList}>
                {categories.map((item) => <CategoryItem key={item.value} item={item} actions={() => setIsOpen(false)}/>)}
              </div>
            </div>
          )}
        </div>                  
      </Drawer>
    </div>
  )
}

const useStyles = createUseStyles({
  menuIcon: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    marginLeft: "0.5rem",
    cursor: "pointer",
    "@media screen and (min-width: 992px)": {
      display: "none"
    }
  },
  categoriesList: {
    marginTop: "0.25rem",
    "& > div": {
      width: "fit-content",
      padding: "0.5rem 0",
    }
  },
  searchContainer: {
    marginLeft: "-1.5rem",
    marginRight: "1rem",
    marginBottom: "1rem",
    // "@media screen and (min-width: 768px)": {
    //     display: "none"
    // }
  },
})

export default CategoriesMenu;