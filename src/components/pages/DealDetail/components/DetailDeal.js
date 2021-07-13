import React from 'react';
import { createUseStyles } from 'react-jss';
import { getLinkToProfile, getPriceText, getTimeAgoLabel, getTimeLabel, hasEditorPermissionOnCategory } from '../../../../services/utils/common';
import Button from '@atlaskit/button';
import Avatar from '@atlaskit/avatar';
import moment from 'moment';
import TimeTag from '../../../common/components/TimeTag';
import ErrorIcon from '@atlaskit/icon/glyph/error';
import { useCommonStyles } from '../../../../services/utils/common_classes';
import { useSelector } from 'react-redux';
import { currentUserSelector } from '../../../../selectors/usersSelector';
import AdminActions from './AdminActions';
import Tooltip from '@atlaskit/tooltip';
import FeaturedTag from './FeaturedTag';

const DetailDeal = (props) => {
    const classes = useStyles();
    const commonClasses = useCommonStyles();
    
    const {selectedDeal, expired} = props;
    const { info, expired_at, user_info, created_at: createdAt, category } = selectedDeal;
    const { title, link, price, discount, detail, imageUrl } = info;
    const originalPrice = info.originalPrice || parseInt(price / (100 -discount) * 100);

    const displayImgUrl = imageUrl ? imageUrl : '/images/defaultImg.jpg';

    const currentUser = useSelector(currentUserSelector);

    const renderPostOwner = () => {
        return (
            user_info &&
                <div className={classes.creatingInfo}>
                    <div className={classes.postOwnerName}>
                        <Avatar
                            appearance="circle"
                            size="medium"
                            src={user_info.info ? user_info.info.avatarUrl : ''}
                        />
                        
                        <div style={{marginLeft: "0.5rem"}}>
                            <div style={{display: "flex", flexWrap: 'wrap', justifyContent: 'center'}}>
                                <a className={classes.formatUserAvatar} href={getLinkToProfile(user_info.username)} target="_blank" rel="noreferrer">
                                    <div>{user_info.info ? user_info.info.displayName : user_info.username}</div>
                                </a> 
                                <div>đã đăng deal này</div>
                            </div>
                            <Tooltip content={getTimeLabel(createdAt)}>
                                <div className={classes.createdTime}>
                                    {getTimeAgoLabel(createdAt)}
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                    {/* <ButtonFollow isOnDetailPage={true} followedByUserId={currentUser.id} followedUserId={user_info.id} /> */}
                    
                </div>
            
        );
    }

    const renderPriceInfo = () => {
        return (
            <div className={classes.promotion}>
                <div className={classes.price}>
                    {getPriceText(price)}
                </div>
                <span className={classes.originalPrice}>
                    {getPriceText(originalPrice)}
                </span>
                <span className={classes.discount}>-{discount}%</span>
            </div>
        )
    }

    const renderContentLeftCol = () => {
        return (
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '280px', height: '280px'}}>     
                <img src={displayImgUrl} alt={displayImgUrl} className={classes.formatImg} />
            </div>
        )
    }

    const renderContentRightCol = () => {
        return (
            <div className={classes.contentRightCol}>
                {renderPriceInfo()}
                <div className={classes.row}>
                    <a href={link} className={classes.link} target="_blank" rel="noopener noreferrer">
                        <Button className={`${commonClasses.mainButton} ${classes.viewDetail}`}>Xem chi tiết</Button>
                    </a>
                </div>
         
                {renderPostOwner()}     
            </div>
        )
    }

    return (
        <div style={{backgroundColor: "white", position: "relative"}}>
            <h2 style={{marginTop: 0, marginBottom: '.5rem'}}>
                    <div style={{display: "flex", justifyContent: "space-between", flexWrap: 'wrap'}}>
                        {/* <CategoryTag category={category}/>      */}
                        <div className={classes.expiredMsg}>
                            {expired ? (
                                <Tooltip content={expired_at ? `${getTimeLabel(expired_at)}` : ''}>
                                    <div style={{display: "flex", userSelect: 'none'}}>
                                        <ErrorIcon />
                                        <span style={{marginLeft: "0.25rem"}}>
                                            Deal đã hết hạn
                                        </span>
                                    </div>
                                </Tooltip>
                            ) : (expired_at && <span>
                                    <TimeTag time={expired_at} type="remaining"/>
                                </span>
                            )}
                        </div>
                        {selectedDeal.featured && <FeaturedTag />}
                    </div>
                    {title}
                </h2>
            <div style={{display: "flex", justifyContent: "space-between"}}>
                <div
                    className={classes.contentContainer}
                    style={{
                        width: !hasEditorPermissionOnCategory(currentUser, category) && '100%',
                    }}
                >
                    {renderContentLeftCol()}
                    {renderContentRightCol()}
                </div>
                
                <div style={{marginTop: "1rem", alignSelf: "center"}}>
                    {hasEditorPermissionOnCategory(currentUser, category) && <AdminActions />}
                </div>
            </div>
            <div className={commonClasses.paragraph} style={{margin: "1rem 0"}}>{detail}</div>
        </div>
    );
};

const useStyles = createUseStyles({
    promotion: {
        marginBottom: '1rem',
    },
    price: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: "green",
        marginRight: "0.5rem",
    },
    originalPrice: {
        textDecoration: 'line-through',
        fontWeight: "300",
        color: "rgb(165, 165, 165)",
        marginRight: "0.75rem",
    },
    discount: {
        color: "red",
        fontWeight: "500",
    },
    link: {
        textDecoration: 'none',
    },
    col: {
        padding: '0 1rem',
        margin: '1rem 0',
        borderRight: 'thin solid lightgray',
        width: '100%',
    },
    row: {
        margin: "auto",
        marginTop: "0.5rem",
        marginBottom: "1rem",
        '@media screen and (max-width: 700px)': {
            position: 'absolute',
            width: '100%',
            bottom: '-85%',
        },
        /* '@media screen and (max-width: 414px)': {
            bottom: '-85%',
        }, */
        '@media screen and (max-width: 330px)': {
            bottom: '-65%',
        },
        '@media screen and (max-width: 280px)': {
            bottom: '-60%'
        },
        '@media screen and (max-width: 260px)': {
            bottom: '-45%'
        }
    },
    contentContainer: {
        display: 'flex', 
        maxHeight: "50rem",
        width: '90%',
        justifyContent: 'space-around',
        "& > div": {
            alignSelf: 'center',
            textAlign: 'center',
            /* "&:not(:last-child)": {
                marginRight: "2rem"
            } */
        },
        '@media screen and (max-width: 700px)': {
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: '100%',
            '& > div:first-child': {
                width: '80%'
            },
            "& > div:not(:last-child)": {
                marginRight: "0"
            },
        }
    },
    viewDetail: {
        '@media screen and (max-width: 700px) and (min-width: 321px)': {
            width: '100% !important'
        }
    },
    postOwnerName: {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    formatUserAvatar: {
        display: 'flex',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginRight: '.3rem',
        alignItems: 'center',
        textDecoration: 'none',
        color: 'black',
        '&:hover': {
            '& > div': {
                textDecoration: 'underline',
            }
        }
    },
    creatingInfo: {
        fontSize: '.8rem',
    },
    expiredMsg: {
        color: "red",
        fontWeight: "bold",
        display: "flex",
        fontSize: "1rem !important",
        "& span": {
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
        }
    },
    createdTime: {
        width: "fit-content",
        '@media screen and (max-width: 712px)': {
            margin: 'auto'
        },
        '@media screen and (min-width: 993px) and (max-width: 1060px)': {
            margin: 'auto',
        }
    },
    contentRightCol: {
        position: 'relative',
        '@media screen and (max-width: 700px) and (min-width: 321px)':{
            display: 'grid',
            gridTemplateColumns: '50% 50%',
            /* position: 'relative', */
            alignItems: 'center',
        },
        '@media screen and (max-width: 700px)': {
            marginBottom: '3rem',
        }
    },
    formatImg: {
        width: '90%',
        height: '90%',
        objectFit: 'contain',
/*         '@media screen and (max-width: 440px)': {
            width: '60%',
            height: '60%',
        } */
    }
});

export default DetailDeal;