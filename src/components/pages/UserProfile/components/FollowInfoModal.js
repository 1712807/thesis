import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createUseStyles } from 'react-jss';
import { getFollowInfoByUsername } from '../../../../redux/users/action';
import Avatar from "@atlaskit/avatar";
import { getLinkToProfile } from '../../../../services/utils/common';
import Modal, { ModalTransition } from "@atlaskit/modal-dialog";
import LoadingSpinner from '../../../common/loaders/LoadingSpinner';

const useStyles = createUseStyles({
  followInfo: {
    fontWeight: 500
  },
  userInfoContainer: {
    display: "flex",
    alignItems: "center",
    padding: '.5rem 24px',
    textDecoration: 'none',
    color: 'black',
    '&:hover': {
      background: '#ebebeb',
    }
  },
  username: {
    marginLeft: "1rem"
  }
});

const FollowInfoModal = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { type, username, name } = props;
  const dispatch = useDispatch();
  const followerUserIds = useSelector((state) => state.users.followerUserIds);
  const followingUserIds = useSelector((state) => state.users.followingUserIds);
  const classes = useStyles();
  const followInfoList = useSelector((state) => state.users.followInfoList)
  const isLoadingPage = useSelector((state) => state.app.isLoadingPage);
  
  const viewFollowerList = () => {
    if (type === "follower" && followerUserIds.length === 0) return;
    if (type === "following" && followingUserIds.length === 0) return;
    setIsOpen(!isOpen)
    dispatch(getFollowInfoByUsername(!isOpen ? username : '', type))
  }
  const renderContent = () => {
    return (
      type === 'followers' ?
      (
        <div>Được theo dõi bởi&nbsp;
            <span className={classes.followInfo} style={{cursor: "pointer", pointerEvents: followerUserIds.length === 0 ? "none" : ""}} onClick={viewFollowerList}>{followerUserIds.length} người</span>
        </div>
      ) : (
        <div>Đang theo dõi&nbsp;
            <span className={classes.followInfo} style={{cursor: "pointer", pointerEvents: followingUserIds.length === 0 ? "none" : ""}} onClick={viewFollowerList}>{followingUserIds.length} người</span>
        </div>
      )
    );
  }

  const renderUserInfo = (item) => {
    const { info, username, blocked_by } = item;
    return (
      <a className={classes.userInfoContainer} href={getLinkToProfile(username)} target="_blank" rel="noreferrer">
        <Avatar
          appearance="circle"
          size="medium"
          src={info.avatarUrl}
        />
        <div>
          <div className={classes.username}>
            {info ? info.displayName || username : username}
          </div>
          {blocked_by && blocked_by.id &&
           <div
            className={classes.username}
            style={{color: 'tomato', fontWeight: '500', fontSize: '.7rem'}}
          >
            Người dùng đã bị khóa tài khoản
          </div>}
        </div>   
      </a>
    );
  }

  const CustomBody = ({props}) => {
    return (
      <div
        {...props}
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
        }} >
          {!isLoadingPage ? (<div>
            {followInfoList.map((item) => renderUserInfo(item))}
          </div>) : <LoadingSpinner />}
        </div>
    );
  };

  return (
    <div>
      {renderContent()}
      <ModalTransition>
        {isOpen && (
            <Modal
              actions={[
                {text: "Đóng", onClick: viewFollowerList}
              ]}
              onClose={viewFollowerList}
              heading={type === 'followers' ? `Những người đang theo dõi ${name}` : `${name} đang theo dõi`}
              width="small"
              style={{padding: '0'}}
              components={{
                Body: CustomBody,
              }}
            />
          )}
      </ModalTransition>
    </div>
    
  );
}

export default FollowInfoModal;