import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import { useSelector } from "react-redux";
import { flashDealsSelector } from "../../selectors/dealsSelectors";
import { useCommonStyles } from "../../services/utils/common_classes";
import DealPreviewVertical from "../deal_preview/DealPreviewVertical";
import SectionLoader from "../common/loaders/SectionLoader";

let slides = [];

const FlashDeals = () => {
    const classes = useStyles();
    const commonClasses = useCommonStyles();

    const flashDeals = useSelector(flashDealsSelector);
    const {list, isLoading} = flashDeals;
    const length = list.length;

    const [lIndex, setLIndex] = useState(0);
    const [currentSlides, setCurrentSlides] = useState(list);
    const [slidesUpdated, setSlidesUpdated] = useState(false);

    useEffect(() => {
        setCurrentSlides(list);
    }, [list])

    useEffect(() => {
        if (slidesUpdated) {
            setCurrentSlides(slides);
            setSlidesUpdated(false);
        }
    }, [slidesUpdated]);

    const changeSlideIndex = (index) => {
        const l = (lIndex + index + length) % length;
        let i; slides = [];
        for (i=l; i<length; i++) slides.push(list[i]);
        for (i=0; i<l; i++) slides.push(list[i]);
        setLIndex(l);
        setSlidesUpdated(true);
    }

    return isLoading ? <SectionLoader height={300} /> : (
        <div className={`${commonClasses.listContainer} ${classes.flashDealsContainer}`}>
            <div className={classes.dealList}>
                {currentSlides.map((item) => <DealPreviewVertical type="flash" key={item.id} deal={item} />)}
            </div>
            <div className={classes.navigateBtns}>
                <div onClick={() => changeSlideIndex(-1)}>
                    <FontAwesomeIcon icon={faChevronLeft}/>
                </div>
                <div onClick={() => changeSlideIndex(1)}>
                    <FontAwesomeIcon icon={faChevronRight}/>
                </div>
            </div>
        </div>
    )
}


const useStyles = createUseStyles({
    flashDealsContainer: {
        display: "flex",
        position: "relative",
    },
    dealList: {
        display: "grid",
        gridTemplateColumns: "repeat(10, 1fr)",
        overflow: "hidden",
        "& > a": {
            // width: "100%",
            minWidth: "12rem",
        },
        "& > a:not(:last-child)": {
            borderRight: "1px solid rgb(232, 232, 232) !important",
        },
    },
    navigateBtns: {
        "& > div": {
            cursor: "pointer",
            position: "absolute",
            top: "30%",
            width: "auto",

            padding: "1rem",
            fontWeight: "bold",
            fontSize: "1.25rem",
            transition: "0.6s ease",
            color: "rgb(19, 58, 106)",
            backgroundColor: "rgb(236 237 239 / 75%)",

            "&:hover": {
                backgroundColor: "#f2f2f2",
            },

            "&:first-child": {
                left: 0,
                borderTopRightRadius: "5px",
                borderBottomRightRadius: "5px",
            },
            "&:last-child": {
                right: 0,
                borderTopLeftRadius: "5px",
                borderBottomLeftRadius: "5px"
            }
        },
    }
})


export default FlashDeals;