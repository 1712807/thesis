import React,  { useState, useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import { updateFollowUser } from '../../../redux/users/action';
import { DEALBEE_PATHS } from '../../../services/utils/constant';

const useStyles = createUseStyles({
  buttonFollow: {
    padding: '.2rem .5rem',
    borderRadius: '3px',
    // background: '',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    margin: 'auto',
    marginTop: "0.25rem",
    width: 'fit-content',
    fontSize: '.8rem',
    '&:hover': {
      opacity: '.9'
    }
  }
});

const ButtonFollow = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { followedByUserId, followedUserId, isOnDetailPage, followedUsername } = props;
  const [isFollowing, setIsFollowing] = useState(false);

  const followerUserIds = useSelector((state) => state.users.followerUserIds);

  useEffect(() => {
      setIsFollowing(followerUserIds.filter((i) => i.followed_by_user_id === followedByUserId).length > 0)
  },[])
  const updateFollow = () => {
    if (followedByUserId) {
      setIsFollowing(!isFollowing);
      dispatch(updateFollowUser(followedByUserId, followedUserId, !isFollowing, followedUsername))
    } else {
      window.location.href=`${DEALBEE_PATHS.login}?required=true`;
    }
  }
  return (
    <div 
      className={classes.buttonFollow}
      style={{
        background: isOnDetailPage ? "transparent" : isFollowing ? '#ebebeb' : "rgb(19, 58, 106)",
        color: (isOnDetailPage || isFollowing) && 'rgb(19, 58, 106)',
        padding: isOnDetailPage && 0,
        margin: isOnDetailPage && 0,
      }}
      onClick={updateFollow}  
    >
      {isFollowing ? 'Hủy theo dõi' : 'Theo dõi'}{isOnDetailPage && ' người đăng'}
    </div>
  );
}

export default ButtonFollow;
