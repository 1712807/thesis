import React, { useState, useEffect, useRef } from 'react';
import {
    FacebookShareButton,
    TwitterShareButton,
  } from "react-share";
import { createUseStyles } from 'react-jss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink, faShare } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF } from "@fortawesome/free-brands-svg-icons"
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import Tooltip from '@atlaskit/tooltip';
import { useDispatch } from 'react-redux';
import { addFlagNoti } from '../../../../redux/app/action';
import { FLAGS } from '../../../../services/utils/constant';

const useStyles = createUseStyles({
    containerShare: {
        // marginRight: '1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '40px',
        '@media screen and (max-width: 460px)': {
            height: '100%',
        }
    },
    containerICon: {
        display: 'grid',
        gridTemplateColumns: 'auto auto auto',
        "& button": {
            padding: "0.5rem !important",
            width: "40px !important",
            height: '40px !important',
            marginRight: "0.5rem",
        },
        "& svg": {
            marginRight: "0 !important",
            width: "1rem !important",
            height: "1rem !important",
        },
        '@media screen and (max-width: 848px)': {
            display: 'none',
        }
    },
    copyLink: {
        width: "38px !important",
        height: '38px !important',
        // width: '85px',
        borderRadius: '5px',
        border: 'thin solid #000000bd',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#000000bd',
        '&:hover' : {
            color: 'white',
            background: '#000000bd',
        }
    },
    confirmICon: {
        width: '20px !important',
        height: '20px',
        padding: '.5rem',
        color: 'white',
        background: 'black',
        borderRadius: '50px',
    },
    fbButton: {
        outline: 'none',
        border: 'thin solid rgb(59, 89, 152) !important',
        borderRadius: '5px',
        color: 'rgb(59, 89, 152) !important',
        // width: '85px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&:hover': {
            background: 'rgb(59, 89, 152) !important',
            color: 'white !important',
        }
    },
    twitterButton: {
        outline: 'none',
        border: 'thin solid rgb(1, 172, 237) !important',
        borderRadius: '5px',
        color: 'rgb(1, 172, 237) !important',
        // width: '85px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&:hover': {
            color: 'white !important',
            background: 'rgb(1, 172, 237) !important'
        }
    },
    generalBtn: {
        display: 'none',
        padding: '.25rem .5rem',
        alignItems: 'center',
        cursor: 'pointer',
        position: 'relative',
        borderRadius: '3px',
        '&:hover': {
            background: '#f2f2f2',
        },
        '@media screen and (max-width: 848px)': {
            display: 'flex',
        },
    },
    content: {
        position: 'absolute',
        background: '#fffffff0',
        bottom: '120%',
        borderRadius: '3px',
        padding: '.5rem',
        boxShadow: "0 2px 6px grey",
        '& > div': {
            display: 'flex !important',
            flexDirection: 'column',
            alignItems: 'center',
            '& button': {
                marginRight: 0,
            },
            '& > div:nth-child(2)': {
                margin: '.5rem 0'
            }
        },
        
    }
})
const ShareDeal = (props) => {
    const { selectedDeal } = props;
    const { info } = selectedDeal;
    const classes = useStyles();
    const dispatch = useDispatch();
    const [showContent, setShowContent] = useState(false)
    const copyToClipBoard = () => {
        let inputc = document.body.appendChild(document.createElement("input"));
        inputc.value = window.location.href;
        inputc.select();
        document.execCommand('copy');
        document.body.removeChild(inputc);
        dispatch(addFlagNoti(FLAGS.copyLinkSuccess))
    }
    
    const wrapperRef = useRef();
    useEffect(() => {
        document.addEventListener('contextmenu', handleClickOutside);
        document.addEventListener('click', handleClickOutside);
    },[])

    const handleClickOutside = (event) => {
        const { target } = event
        if (wrapperRef.current && !wrapperRef.current.contains(target)) {
            setShowContent(false)
        }
    }
    const renderIconList = () => {
        return (
            <div className={classes.containerICon}>
                <Tooltip content="Chia sẻ lên Facebook">
                    <FacebookShareButton url={window.location.href} className={classes.fbButton}>
                        <FontAwesomeIcon icon={faFacebookF}/>
                    </FacebookShareButton>
                </Tooltip>

                <Tooltip content="Chia sẻ lên Twitter">
                    <TwitterShareButton url={window.location.href} className={classes.twitterButton}>
                        <FontAwesomeIcon icon={faTwitter}/>
                    </TwitterShareButton>
                </Tooltip>

                <Tooltip content="Sao chép liên kết">
                    <div className={classes.copyLink} onClick={copyToClipBoard}>
                        <FontAwesomeIcon icon={faLink}/>
                    </div>
                </Tooltip>
            </div>
        );
    }
    return (
        <div className={classes.containerShare}>
            {renderIconList()}
            <div className={classes.generalBtn} onClick={() => setShowContent(!showContent)} ref={wrapperRef}>
                <FontAwesomeIcon icon={faShare} />
                <div style={{userSelect: 'none', marginLeft: '.25rem'}}>Chia sẻ</div>
                {showContent && <div className={classes.content}>
                    {renderIconList()}
                </div>}
            </div>
        </div>
    );
}

export default ShareDeal;