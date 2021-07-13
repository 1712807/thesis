import { faIdBadge, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { useDispatch, useSelector } from "react-redux";
import { currentMenuTabSelector, pointedDealIdSelector } from "../../selectors/adminSelectors";
import ButtonApproveDeal from "../common/buttons/ButtonApproveDeal";
import ButtonSaveEditedInfo from "../common/buttons/ButtonSaveEditedInfo";
import ButtonDeleteDeal from "../common/buttons/ButtonDeleteDeal";
import ButtonRejectDeal from "../common/buttons/ButtonRejectDeal";
import InlineEdit, { InlineEditableTextfield } from '@atlaskit/inline-edit';
import TextArea from "@atlaskit/textarea";
import { DateTimePicker } from "@atlaskit/datetime-picker";
import ButtonViewDetail from "../common/buttons/ButtonViewDetail";
import { markDealAsViewed, changePointedDealId } from "../../redux/admin/action";
import Select from "@atlaskit/select";
import Checkbox from "@atlaskit/checkbox";
import { useCommonStyles } from "../../services/utils/common_classes";
import { getTimes, getDiscountFromPrices, getLinkToProfile, getNewPrice, getOriginalPrice, getTimeAgoLabel, getTimeLabel, getTimeRemainingLabel, hasEditorPermission, isPastDate, setLevel, uploadPhoto } from "../../services/utils/common";
import ButtonDeleteDealForOwner from "../common/buttons/ButtonDeleteDealForOwner";
import ButtonSaveEditedInfoForOwner from "../common/buttons/ButtonSaveEditedInfoForOwner";
import TextField from "@atlaskit/textfield";
import moment from "moment";
import Tooltip from "@atlaskit/tooltip";
import { categoriesSelector } from "../../selectors/dealsSelectors";
import { INPUT_LENGTHS, TEXT_INPUT_CUSTOM_STYLE } from "../../services/utils/constant";
import MediaServicesScaleLargeIcon from '@atlaskit/icon/glyph/media-services/scale-large';
import CrossCircleIcon from '@atlaskit/icon/glyph/cross-circle';

const DealPreviewWithInlineEdit = (props) => {
    const classes = useStyles();
    const commonClasses = useCommonStyles();
    const dispatch = useDispatch();
    const uploadPhotoRef = useRef();

    const {type, deal, isEditor} = props;
    const {info, id, expired_at: expiredDate, viewed, featured, category, editors_note: editorsNote, status} = deal;
    const {title, detail, link, price, originalPrice, discount, imageUrl} = info;
    const {created_at: createdAt, username, user_blocked: isBlocked, user_info: userInfo, user_role: userRole, user_point: userPoint, reputation_score: userReputationPoint} = deal;

    const [detailViewed, setDetailViewed] = useState(viewed);
    const [newTitle, setNewTitle] = useState(title);
    const [newDescription, setNewDescription] = useState(detail);
    const [newEditorsNote, setNewEditorsNote] = useState(editorsNote ? editorsNote.content : '');
    const [newPrice, setNewPrice] = useState(price);
    const [newOriginalPrice, setNewOriginalPrice] = useState(originalPrice || getOriginalPrice(price, discount));
    const [newDiscount, setNewDiscount] = useState(discount);
    const [newImageUrl, setNewImageUrl] = useState(imageUrl)

    const [isExpired, setIsExpired] = useState(deal.expired || isPastDate(expiredDate));
    const [newExpiredDate, setNewExpiredDate] = useState(expiredDate);
    const expiredDateIsInvalid = isPastDate(newExpiredDate);
    
    const isInvalidInfo = !newTitle || !newTitle.trim() 
        || newDiscount < 0 || newPrice < 0 || newOriginalPrice < 0;

    const categories = useSelector(categoriesSelector);
    const [newCategory, setNewCategory] = useState(
        categories.filter((item) => item.value === category)[0] || null
    );
    const [isFeatured, setIsFeatured] = useState(featured);

    const pointedDealId = useSelector(pointedDealIdSelector);
    const [isShowingDetail, setIsShowingDetail] = useState(false);
    useEffect(() => {
        setIsShowingDetail(
            type==="full-page" 
                ? true 
                : pointedDealId === id
        )
    }, [pointedDealId])

    const tabFromState = useSelector(currentMenuTabSelector);
    const tab = type === "full-page"    
        ? status === "waiting" 
            ? 0 
            : status === "approved" ? 1 : 2
        : tabFromState;

    const editorActions = (deal) => {
        return (
            <div className={classes.actions}>
                <div></div>
                <div>
                    <ButtonViewDetail id={id} title={newTitle} deal={deal} preview={(tab === 0 || tab === 2) ? true : false}/>
                    {tab === 0 && <ButtonRejectDeal deal={deal} />}
                    {tab === 1 && <ButtonDeleteDeal deal={deal} />}
                    {tab === 0 || tab === 2 
                        ? <ButtonApproveDeal deal={deal} isDisabled={(tab === 0 && (expiredDateIsInvalid || isInvalidInfo))}/>
                        : <ButtonSaveEditedInfo deal={deal} closeEditView={onCloseDetail} isDisabled={isInvalidInfo}/>
                    }
                </div>
            </div>
        )
    }

    const ownerActions = (deal) => (
        <div className={classes.actions}>
            <div></div>
            <div>
                <ButtonViewDetail id={id} title={newTitle} deal={deal} preview={true}/>
                <ButtonDeleteDealForOwner dealId={deal.id}/>
                <ButtonSaveEditedInfoForOwner deal={deal} closeEditView={onCloseDetail} isDisabled={expiredDateIsInvalid}/>
            </div>
        </div>
    )
    
    const renderActions = () => {
        const editedDeal = {
            ...deal,
            info: {
                ...deal.info,
                title: newTitle,
                detail: newDescription,
                price: newPrice,
                originalPrice: newOriginalPrice,
                discount: newDiscount,
                imageUrl: newImageUrl,
            },
            isFeatured: isFeatured,
            editorsNote: newEditorsNote && newEditorsNote.trim() ? newEditorsNote : '',
            prevCategory: category,
            category: newCategory ? newCategory.value : category,
            expiredDate: newExpiredDate,
            expired: isExpired,
        };

        if (isEditor) return editorActions(editedDeal);
        else return ownerActions(editedDeal);
    }

    const onOpenDetail = () => {
        if (!viewed && isEditor) dispatch(markDealAsViewed(id));
        setDetailViewed(true);
        setIsShowingDetail(true);
        dispatch(changePointedDealId(id))
    }

    const onCloseDetail = () => {
        if (type === "full-page") return;
        setIsShowingDetail(false);
        dispatch(changePointedDealId(null))
    }

    const onExpiredDateChanged = (value) => {
        setNewExpiredDate(value);
        if (isPastDate(value)) setIsExpired(true);
        else setIsExpired(false);
    }

    const onExpiredChecked = (isChecked) => {
        setIsExpired(isChecked);
        if (!isChecked) setNewExpiredDate('');
        else 
            if (isPastDate(newExpiredDate)) 
                setNewExpiredDate(moment())
    }

    const onPhotoUpdated = async (files) => {
        const photoFiles = Array.from(files)[0];
        const newFiles = await uploadPhoto(photoFiles);
        if (newFiles.size < 80000) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setNewImageUrl(reader.result);
            });
            reader.readAsDataURL(newFiles)
        } else {
            console.log('invalid')
        }
    }

    const renderStatusLabel = () => {
        const bgColors = ["blue", "green", "rgb(255, 171, 0)"];
        const colors = ["white", "white", "rgb(23, 43, 77)"]
        return (
            <div style={{
                backgroundColor: bgColors[tab],
                color: colors[tab],
                width: "fit-content",
                padding: "0.25rem",
                fontSize: "0.8rem",
                fontWeight: "500",
                borderRadius: "5px",
            }}>
                {tab === 0 
                    ? "Deal đang chờ duyệt" 
                    : tab === 1 
                        ? "Deal đã được đăng"
                        : "Deal đã bị từ chối"
                }
            </div>
        )
    }

    const renderTitleSection = () => {
        return (
            <div className={classes.dealTitleContainer}>
                <h4 onClick={() => onOpenDetail()}>
                    {isShowingDetail 
                        ? <div>
                            <InlineEditableTextfield
                                defaultValue={newTitle}
                                onConfirm={(value) => setNewTitle(value.length <= INPUT_LENGTHS.dealTitle.max ? value : value.slice(0, INPUT_LENGTHS.dealTitle.max))}
                                // keepEditViewOpenOnBlur
                                isRequired
                            />
                        </div>
                        : <div style={{opacity: isEditor && detailViewed ? 0.5 : 1}}>{newTitle}</div>
                    }
                </h4>

                {(isShowingDetail && (type !== "full-page")) && <div onClick={() => onCloseDetail()} style={{fontWeight: "normal", paddingLeft: "1rem"}}>Ẩn chi tiết</div>}
            </div>
        )
    }

    const renderUserAndTimePosted = () => {
        return (
            <div className={classes.postedOn}>
                {isEditor && 
                    <div>
                        <div>Đăng bởi:&nbsp;</div>
                        {isBlocked || !userInfo ? (
                            <div>{username} <span style={{ color: "tomato", fontWeight: "500" }}>(Người dùng đã bị khóa tài khoản)</span></div>
                        ) : (
                            <div>
                                {userInfo && <a className={classes.username} href={getLinkToProfile(username)} target="_blank" rel="noreferrer">{userInfo.displayName}</a>}
                                &nbsp;&nbsp;&nbsp;
                                <FontAwesomeIcon icon={faStar} />&nbsp;
                                {userRole === "user" 
                                    ? `Thành viên cấp ${setLevel(userPoint)}`
                                    : `${userRole}`
                                }&nbsp;&nbsp;&nbsp;
                                <FontAwesomeIcon icon={faIdBadge} />&nbsp;{userReputationPoint} điểm uy tín
                            </div>   
                        )}
                    </div>
                }
                <Tooltip content={getTimeLabel(createdAt)}>
                    <div>Đăng vào: {getTimeAgoLabel(createdAt)}</div>
                </Tooltip>
                {expiredDate && <Tooltip content={`Hết hạn vào ${getTimeLabel(expiredDate)}`}>
                        <b style={{color: "tomato"}}>{moment(expiredDate) > moment() ? getTimeRemainingLabel(expiredDate) : "Đã hết hạn"}</b>
                    </Tooltip>
                }
            </div>
        )
    }

    const renderOriginalLink = () => {
        return (
            <b><a style={{wordBreak: "break-all"}} href={link} target="_blank" rel="noreferrer">{link}</a></b>
        )
    }

    const onPriceChanged = (value) => {
        setNewPrice(value);
        if (!newOriginalPrice && !newDiscount) return;
        if (!newOriginalPrice || value >= newOriginalPrice) setNewOriginalPrice(getOriginalPrice(value, newDiscount));
        else setNewDiscount(getDiscountFromPrices(value, newOriginalPrice));
    }

    const onDiscountChanged = (v) => {
        const value = parseInt(v);
        const discount = value < 0 ? 0 : value > 100 ? 100 : value;
        setNewDiscount(discount);
        if (discount === 100) {
            setNewPrice(0);
            return;
        }
        if (!newOriginalPrice && !newPrice) return;
        if (newPrice) setNewOriginalPrice(getOriginalPrice(newPrice, discount));
        else setNewPrice(getNewPrice(newOriginalPrice, discount))
    }

    const onOriginalPriceChanged = (value) => {
        setNewOriginalPrice(value);
        if (!newDiscount && !newPrice) return;
        if (newDiscount) setNewPrice(getNewPrice(value, newDiscount))
        else setNewDiscount(getDiscountFromPrices(newPrice, value))
    }

    const renderPrice = () => {
        return (
            <div className={classes.discountContainer}>
                <div className={classes.discount}>
                    <div>
                        -
                        <InlineEdit
                            defaultValue={newDiscount}
                            editView={({ errorMessage, ...fieldProps }, ref) => (
                                <TextField 
                                    value={newDiscount}
                                    onChange={(e) => onDiscountChanged(e.target.value)}
                                    type="number"
                                    ref={ref} 
                                    css={TEXT_INPUT_CUSTOM_STYLE}
                                />
                            )}
                            readView={() => (<div style={{minWidth: "1rem", minHeight: "1rem"}}>{newDiscount}</div>)}
                            onConfirm={(value) => onDiscountChanged(value || 0)}
                            hideActionButtons
                        />
                        %
                    </div>
                </div>
                <div>
                    <div className={classes.newPrice}>
                        <InlineEdit
                            defaultValue={newPrice}
                            editView={({ errorMessage, ...fieldProps }, ref) => (
                                <TextField 
                                    value={newPrice}
                                    onChange={(e) => onPriceChanged(e.target.value)}
                                    type="number"
                                    ref={ref} 
                                    css={TEXT_INPUT_CUSTOM_STYLE}
                                />
                            )}
                            readView={() => ( <div>{newPrice}đ</div>)}
                            onConfirm={(value) => onPriceChanged(value || 0)}
                        />
                    </div>
                    {isEditor ? <div className={classes.originalPrice}>
                        {/* {originalPrice}đ */}
                        <InlineEdit
                            defaultValue={newOriginalPrice}
                            editView={({ errorMessage, ...fieldProps }, ref) => (
                                <TextField 
                                    value={newOriginalPrice}
                                    onChange={(e) => onOriginalPriceChanged(e.target.value)}
                                    type="number"
                                    ref={ref} 
                                    css={TEXT_INPUT_CUSTOM_STYLE}
                                />
                            )}
                            readView={() => ( <div style={{textDecorationLine: "line-through"}}>{newOriginalPrice}đ</div>)}
                            onConfirm={(value) => onOriginalPriceChanged(value || 0)}
                        />
                    </div>
                    : <div className={classes.originalPrice}>
                    {originalPrice}đ</div>
                    }
                </div>
            </div>
        )
    }

    const renderDescription = () => {
        return (
            <div>
                <div>Mô tả</div>
                <TextArea 
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="(Thêm mô tả)"
                    spellCheck={false}
                    resize="smart"
                    css={TEXT_INPUT_CUSTOM_STYLE}
                    maxLength={INPUT_LENGTHS.dealDescription.max}
                />
            </div>
        )
    }

    const renderCategory = () => {
        return (
            <div className={status === "approved" ? classes.selectDisabled : ""}>
                <div>Ngành hàng</div>
                <Select
                    options={categories.filter((item, index) => index > 0)}
                    placeholder="Chọn ngành hàng"
                    onChange={value => setNewCategory(value)}
                    value={newCategory}
                    defaultValue={{ label: category, value: category }}
                    className={commonClasses.customSelect}
                />
            </div>
        )
    }

    const renderExpiredDate = () => {
        return (
            <div>
                <div>Ngày hết hạn</div>
                <div className={commonClasses.datepickerContainer}>
                    <DateTimePicker
                        onChange={(value) => onExpiredDateChanged(value)}
                        value={newExpiredDate || ""}
                        isInvalid={tab === 0 && expiredDateIsInvalid}
                        defaultValue={moment()}
                        placeholder="Chọn ngày hết hạn"
                        timeIsEditable
                        times={getTimes()}  
                    />
                </div>
                {tab > 0 && 
                    <Checkbox
                        label={`Deal đã hết hạn`}
                        onChange={(e) => onExpiredChecked(e.target.checked)}
                        isChecked={isExpired}
                    />
                }
                {(tab === 0 && expiredDateIsInvalid) && 
                    <div className={commonClasses.asterisk}>
                        Ngày đã qua, vui lòng chọn ngày khác!
                    </div>
                }
            </div>
        )
    }

    const renderEditorNote = () => {
        return (
            <div className={classes.editorsNote}>
                <div>Ghi chú</div>
                <TextArea 
                    value={newEditorsNote}
                    onChange={(e) => setNewEditorsNote(e.target.value)}
                    resize="smart"
                    placeholder="(Thêm ghi chú)"
                    minimumRows={4}
                    css={TEXT_INPUT_CUSTOM_STYLE}
                    maxLength={INPUT_LENGTHS.note.max}
                />
                <div className={classes.featuredLabel}>
                    <Checkbox
                        label={`Deal chọn lọc`}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        isChecked={isFeatured}
                    />
                </div>
            </div>
        )
    }

    const renderDetail = () => {
        return (
            <div className={classes.detail}>
                <div className={classes.imgContainer}>
                    <img src={newImageUrl ? newImageUrl : '/images/defaultImg.jpg'} />
                    <div className={classes.changeThumbnail}>
                        <Tooltip content="Thay đổi hình ảnh">
                            <div
                                role="presentation"
                                onClick={() => uploadPhotoRef.current.click()}
                            >
                                <MediaServicesScaleLargeIcon />
                                <input
                                    ref={uploadPhotoRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => onPhotoUpdated(e.currentTarget.files)}
                                    hidden
                                    aria-hidden
                                />
                            </div>
                        </Tooltip>
                        {newImageUrl && (
                            <Tooltip content="Xóa hình ảnh">
                                <div onClick={() => setNewImageUrl("")}>
                                    <CrossCircleIcon />
                                </div>
                            </Tooltip>
                        )}
                    </div>
                </div>
                <div style={{width: "100%"}} className={commonClasses.inputForm}>
                    {renderOriginalLink()}
                    {renderPrice()}
                    {renderDescription()}
                    {renderCategory()}
                    {renderExpiredDate()}
                    {isEditor && renderEditorNote()}
                </div>
            </div>
            
        )
    }

    return (
        <div className={classes.container}>
            {type === "full-page" && renderStatusLabel()}
            {renderTitleSection()}
            {renderUserAndTimePosted()}

            {isShowingDetail && 
                <div>
                    {renderDetail()}
                    {renderActions()}
                </div>
            }
        </div>
    )
}

const useStyles = createUseStyles({
    container: {
        "& > div:not(:last-child)": {
            marginBottom: "0.5rem"
        },
    },
    dealTitleContainer: {
        display: "flex",
        justifyContent: "space-between",
        wordBreak: "break-word",
    
        "& h4, div": {
            width: "100%",
            fontWeight: "bold",
            fontSize: "1.5rem",
            color: "rgb(52, 52, 52)",
            margin: "0 !important",
            overflow: "hidden",
            display: "-webkit-box",
            boxOrient: "vertical",
            lineClamp: 1,
            "& div": {
                padding: 0,
                lineClamp: 1,
            }
        },
        
        "& > div": {
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "fit-content",
            minWidth: "fit-content",
            fontSize: "0.9rem",
            marginTop: "0.4rem",
            cursor: "pointer",
            color: "#0052CC",
            "&:hover": {
                color: "rgb(0, 112, 243)",
            }
        },

        "& form": {
            color: "red !important",
            "& div": {
                marginTop: "0 !important"
            }
        }
    },
    postedOn: {
        display: "flex",
        flexDirection: "column",
        fontSize: "0.8rem",
        "& > div": {
            display: "flex",
            "& div": {
                "& svg": {
                    color: "rgb(252, 166, 9)"
                }
            }
        }
    },
    detail: {
        "@media screen and (max-width: 768px)": {
            flexWrap: "wrap",
        },
        display: "flex",
        marginTop: "1rem",
        "& img": {
            width: "10rem",
            height: "10rem",
            objectFit: "contain",
            flexWrap: "wrap",
            "@media screen and (max-width: 768px)": {
                width: "15rem",
                height: "15rem",
            }
        },
        "& > div:last-child": {
            minWidth: "50%",
            "& > div": {
                flexWrap: "wrap",
                "&:not(:last-child)": {
                    marginBottom: "0.5rem"
                }
            }
        }
    },
    imgContainer: {
        marginRight: "1rem",
        position: "relative",
        "@media screen and (max-width: 768px)": {
            marginRight: 0,
            width: "100%",
            display: "flex",
            justifyContent: "center"
        }
    },
    actions: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: "1rem",
        "& > img": {
            objectFit: "contain",
        },
        "& > div": {
            display: "flex",
            marginLeft: "1rem",
            "& > div:not(:first-child)": {
                marginLeft: "1rem",
            }
        },
    },
    editorsNote: {
        borderTop: "1px solid gray",
        marginTop: "1.5rem",
        paddingTop: "0.5rem",
        "& form": {
            "& div": {
                marginTop: "0",
            }
        }
    },
    featuredLabel: {
        fontWeight: "bold", 
        textTransform: "uppercase", 
        fontSize: "0.85rem",
    },
    discountContainer: {
        display: "flex",
        flexWrap: "wrap",
        marginTop: "0.5rem",
    },
    newPrice: {
        color: "green",
        // color: "rgb(49, 174, 76)",
        fontWeight: "500",
        fontSize: "1.25rem",
        display: "flex",
        "& > form": {
            "& > div": {
                marginTop: "0",
            },
            "& input": {
                height: "1.75rem !important",
            }
        },
    },
    originalPrice: {
        fontWeight: "400",
        fontSize: "0.85rem",
        color: "rgb(165, 165, 165)",
        margin: "0px",
        lineHeight: "1.41",
        "& > form": {
            "& > div": {
                marginTop: "0",
            },
            "& input": {
                height: "1.25rem !important",
            }
        },
    },
    discount: {
        fontSize: "1.5rem !important",
        backgroundColor: "#FFF8DC",
        fontWeight: "bold !important",
        color: "red",
        borderRadius: "5px",
        padding: "0 0.25rem",
        marginRight: "0.5rem",
        "& > div": {
            display: "flex",
            "& > form": {
                "& > div": {
                    marginTop: "0",
                },
                "& input": {
                    maxWidth: "50px",
                }
            },
        },
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
    },
    selectDisabled: {
        "& > div:nth-child(2)": {
            cursor: "not-allowed",
            "& div": {
                pointerEvents: "none",
                opacity: "0.8",
            }
        }
    },
    username: {
        textDecoration: "none",
    },
    changeThumbnail: {
        position: 'absolute',
        top: '0.25rem',
        right: '0.25rem',
        cursor: "pointer",
        display: "flex",
        backgroundColor: "rgba(255,255,255,0.9)",
        borderRadius: '2px',
        "& > div": {
            opacity: 0.8,
            "&:last-child": {
                marginLeft: "2px",
            },
            marginTop: "1px"
        },
        "& > div:hover": {
            "&:last-child": {
                color: "tomato"
            },
            "&:first-child": {
                color: "darkgreen"
            },
        }
    }
})

export default DealPreviewWithInlineEdit;