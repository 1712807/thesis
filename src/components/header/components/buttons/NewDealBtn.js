import Button from "@atlaskit/button";
import React from "react";
import { useSelector } from "react-redux";
import { currentUserSelector } from "../../../../selectors/usersSelector";
import { saveLocation } from "../../../../services/utils/common";
import { useCommonStyles } from "../../../../services/utils/common_classes";
import { DEALBEE_PATHS } from "../../../../services/utils/constant";

const NewDealBtn = () => {
  const currentUser = useSelector(currentUserSelector);
  const commonClasses = useCommonStyles();

  const onClick = () => {
        if (!currentUser.id) {
            saveLocation(DEALBEE_PATHS.newDeal);
            window.location.href=`${DEALBEE_PATHS.login}?required=true`;
            return;
        }
        window.location.href = DEALBEE_PATHS.newDeal;
    }

  return (
    <div>
      <Button 
          onClick={onClick}
          className={commonClasses.mainButton}
      >
          Đăng deal
      </Button>
    </div>
  )
}

export default NewDealBtn;