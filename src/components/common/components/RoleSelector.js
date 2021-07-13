import React from "react";
import { createUseStyles } from "react-jss";
import { ROLES } from "../../../services/utils/constant";
import CategoriesCheckboxes from "./CategoriesCheckboxes";

const RoleSelector = (props) => {
  const {role, categoriesList, setRole, setCategoriesList} = props;
  const isEditor = role === "editor";
  const classes = useStyles();

  return (
    <div className={classes.roleOptions}>
      {ROLES.map((item) => (
          <div key={item.key}>
              <label>
                  <input
                      type="radio"
                      checked={role === item.key ? true : false}
                      onChange={() => setRole(item.key)}
                  />
                  <span></span>
                  {item.label}
              </label>
              {item.key === "editor" && 
                <div style={{margin: "0 0 1rem 3rem", fontSize: "0.875rem"}}>
                  <i style={{fontWeight: "500", opacity: isEditor ? 1 : 0.5}}>Ngành hàng:</i>
                  <CategoriesCheckboxes isDisabled={!isEditor} currentList={categoriesList} onChange={(value) => setCategoriesList(value)}/>
                </div>
              }
          </div>
      ))}
  </div>
  )
}

const useStyles = createUseStyles({
  roleOptions: {
    "& label": {
        display: "flex",
        "& input": {
            marginTop: "0.4rem",
            marginRight: "0.35rem",
        }
    }
  }
})

export default RoleSelector;