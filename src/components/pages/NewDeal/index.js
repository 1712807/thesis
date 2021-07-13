import React, { useState, useEffect } from "react"; 
import Textfield from '@atlaskit/textfield';
import { useDispatch, useSelector } from "react-redux";
import { createDeal, crawlDataFromShopee, crawlDataFromTiki, openErrorMessageModal } from '../../../redux/deals/action';
import { currentUserSelector, isGettingCurrentUserSelector } from '../../../selectors/usersSelector';
import TextArea from '@atlaskit/textarea';
import { categoriesSelector, productInfoSelector } from '../../../selectors/dealsSelectors';
import { useCommonStyles } from "../../../services/utils/common_classes";
import Select from '@atlaskit/select';
import { DateTimePicker } from "@atlaskit/datetime-picker";
import { getDiscountFromPrices, getNewPrice, getOriginalPrice, isPastDate, saveLocation, getTimes } from "../../../services/utils/common";
import { LoadingButton } from "@atlaskit/button";
import { createUseStyles } from "react-jss";
import { DEALBEE_PATHS, INPUT_LENGTHS, TEXT_INPUT_CUSTOM_STYLE } from "../../../services/utils/constant";
import ImageField from "./components/ImageField";    
import { uploadPhoto } from "../../../services/utils/common";
import ButtonViewDetail from "../../common/buttons/ButtonViewDetail";
import validator from "validator";

const NewDealForm = () => {
    const classes = useStyles();
    const commonClasses = useCommonStyles();
    const dispatch = useDispatch();

    const productInfo = useSelector(productInfoSelector);
    const { title, discount, imgUrls, price, detail, short_detail, originalPrice } = productInfo;
    const [newTitle, setNewTitle] = useState(title);
    const [newLink, setNewLink] = useState('');
    const [newPrice, setNewPrice] = useState(price);
    const [newDiscount, setNewDiscount] = useState(discount);
    const [newOriginalPrice, setNewOriginalPrice] = useState(originalPrice);
    const [newDetail, setNewDetail] = useState(detail);
    const [newImageUrls, setNewImageUrls] = useState(imgUrls);
    const [newCategory, setNewCategory] = useState(null);
    const [newExpiredDate, setNewExpiredDate] = useState(undefined);
    const expiredDateIsInvalid = isPastDate(newExpiredDate);
    const categories = useSelector(categoriesSelector);
    const [photoFiles, setPhotoFiles] = useState('');
    const [invalidImg, setInvalidImg] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (photoFiles === '') {
            setNewImageUrls(imgUrls)
            setInvalidImg(false)
        }
        else {
            updateImgUrl()
        }
    }, [imgUrls, photoFiles])

    useEffect(() => {
        setNewTitle(title);
        setNewDiscount(discount);
        setNewImageUrls(imgUrls);
        setNewPrice(price);
        setNewDetail(detail);
        setNewOriginalPrice(originalPrice);
    }, [detail, discount, imgUrls, price, productInfo, title, originalPrice]);

    const currentUser = useSelector(currentUserSelector);
    const isGettingCurrentUser = useSelector(isGettingCurrentUserSelector);
    if (!currentUser.id && !isGettingCurrentUser) {
        saveLocation(DEALBEE_PATHS.newDeal);
        dispatch(openErrorMessageModal(true));
        return "";
    };
    
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

    const getDealContent = () => {
        const content = {
            title: newTitle || newLink,
            link: newLink,
            price: newPrice,
            discount: newDiscount,
            originalPrice: newOriginalPrice,
            detail: newDetail,
            imageUrl: newImageUrls,
            shortDetail: short_detail,
        };
        return content;
    }

    const updateImgUrl = async() => {
        const newFiles = photoFiles.size < 70000 ? photoFiles : await uploadPhoto(photoFiles);
        if (newFiles.size < 70000) {
          const reader = new FileReader();
          reader.addEventListener('load', () => {
            setNewImageUrls(reader.result)
          });
          reader.readAsDataURL(newFiles)
          setInvalidImg(false)
        } else {
            setInvalidImg(true)
        }
    }

    const onCreateClicked = () => {
        const content = getDealContent();
        const userId = currentUser.id;
        const category = newCategory ? newCategory.value : null;
        setIsCreating(true);
        dispatch(createDeal(userId, content, category, newExpiredDate));
    }

    const getProductInfoFromLink = (value) => {
        setNewLink(value);
        
        /* if (value.includes('tiki')) {
            dispatch(crawlDataFromTiki(value));
        }

        if (value.includes('shopee')) {
            dispatch(crawlDataFromShopee(value));
        } */
    }

    const renderTitleField = () => {
        return (
            <div>
                <div>Tên <span className={commonClasses.asterisk}>*</span></div>
                <Textfield 
                    placeholder="Tên sản phẩm"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    isRequired
                    css={TEXT_INPUT_CUSTOM_STYLE}
                    maxLength={INPUT_LENGTHS.dealTitle.max}
                />
            </div>
        );
    }

    const renderLinkField = () => {
        return (
            <div>
                <div>Đường dẫn <span className={commonClasses.asterisk}>*</span></div>
                <Textfield 
                    placeholder="Đường dẫn đến sản phẩm"
                    value={newLink}
                    maxLength={INPUT_LENGTHS.dealLink.max}
                    onChange={(e) => {
                        const value = e.target.value;
                        getProductInfoFromLink(value);
                        setNewLink(value);
                    }}
                    css={TEXT_INPUT_CUSTOM_STYLE}
                />
            </div>
        );
    }

    const renderPromotionField = () => {
        return (
            <div className={classes.promotions}>
                <div>
                    <div>Giá sản phẩm (VND) <span className={commonClasses.asterisk}>*</span></div>
                    <Textfield 
                        placeholder="Ví dụ: 100000"
                        value={newPrice}
                        type="number"
                        onChange={(e) => onPriceChanged(e.target.value)}
                        css={TEXT_INPUT_CUSTOM_STYLE}
                    />
                </div>
                <div>
                    <div>Phầm trăm giảm giá (%) <span className={commonClasses.asterisk}>*</span></div>
                    <Textfield 
                        placeholder="Ví dụ: 20"
                        value={newDiscount}
                        type="number"
                        onChange={(e) => onDiscountChanged(e.target.value)}
                        css={TEXT_INPUT_CUSTOM_STYLE}
                    />
                </div>
                <div>
                    <div>Giá gốc (VND) <span className={commonClasses.asterisk}>*</span></div>
                    <Textfield 
                        type="number"
                        onChange={(e) => onOriginalPriceChanged(e.target.value)}
                        value={newOriginalPrice}
                        css={TEXT_INPUT_CUSTOM_STYLE}
                        placeholder="Ví dụ: 100000"
                    />
                </div>
            </div>
        );
    }
    
    const renderDetailField = () => {
        return (
            <div>
                <div>Thông tin chi tiết</div>
                <TextArea
                    placeholder="Mô tả sản phẩm"
                    value={newDetail}
                    onChange={(e) => setNewDetail(e.target.value)}
                    css={TEXT_INPUT_CUSTOM_STYLE}
                    maxLength={INPUT_LENGTHS.dealDescription.max}
                    minimumRows={5}
                />
            </div>
        );
    }

    const renderCategoryField = () => {
        return (
            <div>
                <div>Ngành hàng</div>
                <Select
                    options={categories.filter((item, index) => index > 0)}
                    placeholder="Chọn ngành hàng"
                    onChange={value => setNewCategory(value)}
                    value={newCategory}
                    className={commonClasses.customSelect}
                />
            </div>
        )
    }

    const renderExpiredDateField = () => {
        return (
            <div>
                <div>Ngày hết hạn</div>
                <div className={commonClasses.datepickerContainer}>
                    <DateTimePicker
                        onChange={(value) => setNewExpiredDate(value)}
                        value={newExpiredDate}
                        isInvalid={expiredDateIsInvalid}
                        placeholder="Chọn ngày hết hạn"
                        timeIsEditable
                        times={getTimes()}  
                    />
                </div>
                {expiredDateIsInvalid && 
                    <div className={commonClasses.asterisk}>
                        Ngày đã qua, vui lòng chọn ngày khác!
                    </div>
                }
            </div>
        )
    }

    const renderHeader = () => {
        return (
            <div className={commonClasses.formHeader}>
                <h3>
                    Chia sẻ khuyến mãi
                </h3>
            </div>
        )
    }

    const invalid = invalidImg || expiredDateIsInvalid || !(newLink && newLink.trim()) || !validator.isURL(newLink) || !(newTitle && newTitle.trim()) || !newOriginalPrice || !newDiscount || !newPrice
    const renderBody = () => {
        return (
            <div className={commonClasses.inputForm}>
                {renderLinkField()}
                {renderTitleField()}
                {renderPromotionField()}
                {renderDetailField()}
                {renderCategoryField()}
                {renderExpiredDateField()}
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: photoFiles === '' && 'center'}}>
                    <ImageField setPhotoFiles={setPhotoFiles} invalid={invalidImg} />
                    {!invalid && <ButtonViewDetail id={0} deal={{info: getDealContent()}} title={newTitle} preview={true}/>}
                </div>
            </div>
        )
    }

    const renderFooter = () => {
        return (
            <LoadingButton 
                appearance="primary" 
                onClick={onCreateClicked}
                style={{width: "100%", marginTop: "0.5rem"}}
                isDisabled={invalid}
                isLoading={isCreating}
            >
                Đăng 
            </LoadingButton>
        )
    }
    
    return (
        <div style={{display: "flex", justifyContent: "center"}}>
            <div className={`${commonClasses.formContainer} ${classes.container}`}>
                {renderHeader()}
                {renderBody()}
                {renderFooter()}
            </div>
        </div>
    )
}

const useStyles = createUseStyles({
    container: {
        width: "100%",
    },
    typeButton: {
        padding: '0.05rem 0.25rem',
        borderRadius: '0.35rem',
        display: 'flex',
        alignItems: 'center',
        width: 'fit-content',
        '&:hover': {
          backgroundColor: '#f2f2f2',
          transition: 'all ease-in-out 0.3s',
        },
        cursor: 'pointer',
    }, 
    promotions: {
        display: 'flex', 
        justifyContent: 'space-between',
        "@media screen and (max-width: 768px)": {
            flexWrap: "wrap",
            "& > div": {
                marginRight: "0 !important"
            }
        },
        "& > div": {
            width: "100%",
            "& > div:first-child": {
                marginBottom: "0.25rem",
                fontWeight: "500",
                fontSize: "0.875rem",
            },
            "&:not(:last-child)": {
                marginBottom: "1rem !important",
                marginRight: "1rem",
            }
        }
    }
})

export default NewDealForm;