import React from "react";
import { createUseStyles } from "react-jss";
import { useDispatch, useSelector } from "react-redux";
import { getDealsForUsers } from "../../redux/deals/action";
import { recentDealsSelector, dealsForUserSelector } from "../../selectors/dealsSelectors";
import { useCommonStyles } from "../../services/utils/common_classes";
import ButtonViewMore from "../common/buttons/ButtonViewMore";
import LoadingSpinner from "../common/loaders/LoadingSpinner";
import DealPreviewVertical from "../deal_preview/DealPreviewVertical";
import SectionLoader from "../common/loaders/SectionLoader";

const SuggestedDeals = (props) => {
  const { forMe, exceptFor } = props;
  const classes = useStyles();
  const commonClasses = useCommonStyles();
  const dispatch = useDispatch();
  const recentDeals = useSelector(recentDealsSelector);
  const dealsForUser = useSelector(dealsForUserSelector);
  const deals = forMe
    ? dealsForUser
    : {
      ...recentDeals,
      list: recentDeals.list.filter((item) => item.id !== exceptFor)
    };
  const { isLoading, offset, list } = deals;

  return forMe && isLoading && offset === 0 ? <SectionLoader height={500}/> : (
    <div className={commonClasses.listContainer}>
      <div className={`${classes.list} ${forMe ? classes.listOnHomepage : classes.listOnDetailPage}`}>
        {list.map((item, index) => <DealPreviewVertical key={index} deal={item} type={forMe ? "forMe" : ""}/>)}
        {isLoading &&
          <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}><LoadingSpinner /></div>
        }
        
      </div>
      {forMe && offset > 0 && !isLoading && (
        <div style={{borderTop: "1px solid rgb(232, 232, 232)"}} onClick={() => dispatch(getDealsForUsers())}>
          <ButtonViewMore />
        </div>
      )}
    </div>
  )
}

const useStyles = createUseStyles({
  list: {
    // backgroundColor: "white",
    padding: "0 0.5rem",
    backgroundColor: "white",
    display: "grid",
    flexWrap: "wrap",
    borderRadius: "5px",
    "& > a": {
        /* maxWidth: "23%", */
        flexGrow: 1,
        borderRadius: "5px",
        border: "thin solid transparent",
        "&:hover": {
            border: "thin solid lightgray",
      }
    },
  },
  listOnDetailPage: {
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    '@media screen and (max-width: 1000px)': {
        gridTemplateColumns: '1fr 1fr 1fr',
    },
    '@media screen and (max-width: 750px)': {
        gridTemplateColumns: '1fr 1fr',
    },
    '@media screen and (max-width: 450px)': {
        gridTemplateColumns: '1fr',
        textAlign: 'center',
        '& > a > div > div:nth-child(2)': {
          display: "flex",
          justifyContent: "center",
        }
    }
  },
  listOnHomepage: {
    gridTemplateColumns: '1fr 1fr 1fr',
    '@media screen and (max-width: 1400px)': {
        gridTemplateColumns: '1fr 1fr 1fr',
    },
    '@media screen and (max-width: 992px)': {
        gridTemplateColumns: '1fr 1fr',
    },
    '@media screen and (max-width: 450px)': {
        gridTemplateColumns: '1fr',
        textAlign: 'center',
      '& > a > div > div:nth-child(2)': {
        display: "flex",
        justifyContent: "center",
        }
    }
  }
})

export default SuggestedDeals;