import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import { getLinkToDeal, getOriginalPrice } from "../../services/utils/common";
import CategoryTag from "../common/components/CategoryTag";
import DealPrices from "../common/components/DealPrices";
import ReactionsCount from "../common/components/ReactionsCount";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { updateDealInfollowingDealsId } from '../../redux/users/action';
import { useDispatch } from 'react-redux';
import TimeTag from "../common/components/TimeTag";
import Modal, { ModalTransition } from "@atlaskit/modal-dialog";
import Tooltip from "@atlaskit/tooltip";

const useStyle = createUseStyles({
    dealsContainer: {
        display: "grid",
        gridTemplateColumns:"1fr 2fr",
        padding: "1rem",
        cursor: "pointer",
        textDecoration: "none",
        color: "black",
        "&:not(:last-child)": {
            borderBottom: "1px solid rgb(232, 232, 232)"
        },
        "&:hover": {
            backgroundColor: "rgb(246, 251, 255)",
            "& h4": {
                color: "rgb(0, 112, 243)",
            }
        },
        "&:first-child": {
            borderTopLeftRadius: "5px",
            borderTopRightRadius: "5px"
        },
        "@media screen and (max-width: 576px)": {
            gridTemplateColumns:"1fr",
        }
    },
    dealThumbnail: {
        color: "transparent",
        borderRadius: "3px",
        objectFit: "contain",
        objectPosition: "center top",
        height: "10rem",
        width: "10rem",
        maxWidth: "100%",
        "@media screen and (max-width: 576px)": {
            width: "15rem",
            height: "15rem"
        }
    },
    dealInfo: {
        width: "100%",
        position: 'relative',
        marginLeft: "0.5rem",
        "& > div:not(:last-child)": {
            marginBottom: "0.5rem",
        }
    },
    dealTitleContainer: {
        width: "100%",
        fontSize: "1.25rem",
        fontWeight: "500",
        color: "rgb(52, 52, 52)",
        margin: "0 !important",
        overflow: "hidden",
        wordBreak: "break-word",
        display: "-webkit-box",
        boxOrient: "vertical",
        lineClamp: 3,
        "& div": {
            lineClamp: 3,
        }
    },
    detailContainer: {
        fontSize: "0.875rem",
        overflow: "hidden",
        wordBreak: "break-word",
        display: "-webkit-box",
        boxOrient: "vertical",
        lineClamp: 5,
        "& div": {
            lineClamp: 5,
        }
    },
    trashIcon: {
        color: '#e60c0c94',
        '&:hover': {
            color: "tomato",
        }
    },
    discountTag: {
        position: "absolute",
        backgroundColor: "red",
        color: "white",
        fontWeight: "bold",
        borderRadius: "5px 0px 20px",
        padding: "3px 12px 3px 5px"
    },
})

const DealPreviewHorizontal = (props) => {
    const {deal, type} = props;
    const { info, category, interaction } = deal;
    const classes = useStyle();
    const dispatch = useDispatch();

    const deleteDealFromFollowingDeals = (e) => {
        e.stopPropagation();
        e.preventDefault();
        // dispatch(updateDealInfollowingDealsId(deal.id, false))
        setIsUnfollowingDeal(true);
    }

    const [isUnfollowingDeal, setIsUnfollowingDeal] = useState(false);
    const onUnfollowConfirmed = () => {
        dispatch(updateDealInfollowingDealsId(deal.id, false))
        setIsUnfollowingDeal(false);
    }

    const onUnfollowCanceled = () => {
        setIsUnfollowingDeal(false);
    }

    const renderDeleteButton = () => {
        return (
            <Tooltip content="Bỏ theo dõi deal">
                <div className={classes.trashIcon} onClick={(e) => deleteDealFromFollowingDeals(e)}>
                    <FontAwesomeIcon icon={faTrash} />
                </div>
            </Tooltip>
        );
    }

    const renderDiscountPercentage = () => {
        return (
            <div className={classes.discountTag}>
                {`-${deal.discount_percentage}%`}
            </div>
        )
    }

    const displayingDealTitle = info.title.length > 40 ? `${info.title.substring(0,40)}...` : info.title;
    return (
        <a className={classes.dealsContainer} href={getLinkToDeal(deal.id, info.title)}>
            {type === "hot" && renderDiscountPercentage()}
            <div style={{width: "100%", display: "flex", justifyContent: "center"}}>
                <img className={classes.dealThumbnail} src={info.imageUrl ? info.imageUrl : '/images/defaultImg.jpg'} alt={info.imageUrl} />
            </div>
            <div className={classes.dealInfo}>
                <div style={{display: 'flex'}}>
                    <h4 className={classes.dealTitleContainer}>
                        {type === "recent" && <TimeTag time={deal.last_reviewed_at} type="ago" />}
                        <div>{info.title}</div>
                    </h4>
                    {type === 'following' && renderDeleteButton()}
                </div>
                <div className={classes.detailContainer}>
                    <div>{info.detail}</div>
                </div>
                {/* <div style={{fontSize: "0.875rem", wordBreak: "break-word"}}>{info.shortDetail || (info.detail ? info.detail.length < 300 ? info.detail : `${info.detail.substring(0, 300)}...` : '')}</div> */}
                <DealPrices newPrice={info.price} originalPrice={info.originalPrice || getOriginalPrice(info.price, info.discount)}/>
                <div style={{display: "flex", justifyContent: "space-between", flexWrap: "wrap", alignItems: "center"}}>
                    <CategoryTag category={category}/>
                    <ReactionsCount count={interaction} type={type}/>
                </div>
                <ModalTransition>
                    {isUnfollowingDeal && 
                        <Modal 
                            appearance="warning"
                            heading="Bỏ theo dõi deal?"
                            actions={[
                                {text: "Hủy", appearance: "subtle", onClick: onUnfollowCanceled},
                                {text: "Xác nhận", appearance: "warning", onClick: onUnfollowConfirmed}
                            ]}
                            onClose={onUnfollowCanceled}
                            width="small"
                        >
                            Bạn sẽ không nhận được thông báo về deal <b>{displayingDealTitle}</b> nữa.
                        </Modal>
                    }
                </ModalTransition>
            </div>
        </a>
    )
}

export default DealPreviewHorizontal;