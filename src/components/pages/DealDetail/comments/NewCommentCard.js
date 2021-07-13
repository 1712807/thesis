import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { createUseStyles } from 'react-jss';
import Avatar from '@atlaskit/avatar';
import {addNewComment} from '../../../../redux/deals/action';
import moment from 'moment';
import TextArea from '@atlaskit/textarea';
import { getLinkToProfile } from '../../../../services/utils/common';
import { DEALBEE_PATHS, INPUT_LENGTHS, TEXT_INPUT_CUSTOM_STYLE } from '../../../../services/utils/constant';
import Button from "@atlaskit/button";

const useStyles = createUseStyles({
  newCommentCard: {
    marginTop: "1.5rem"
  },
  userAvatar: { 
    cursor: 'pointer',
    marginRight: '0.5rem',
  },
  inputContainer: {
    width: '100%',
    display: 'flex',
  },
  input: {
    border: 'thin solid lightgray',
    borderRadius: '5px',
    padding: '0.5rem 1rem',
    width: '100%',
    minHeight: '2.5rem',
    outline: 'none',
    marginLeft: '.5rem',
    fontFamily: "inherit",
  },
  actionOnCommentCard: {
    width: "100%",
    display: 'flex',
    marginTop: '.5rem',
    justifyContent: 'flex-end',
    '& > button:first-child': {
      marginRight: '.5rem',
    },
    '& > button': {
      width: '60px',
      fontSize: '.875rem',
    }
  }
});

const NewCommentCard = (props) => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const { dealId, currentUser, parentId, isReply } = props;
  const [status, setStatus] = useState('');

  const cancelComment = () => {
    setStatus('');
  }

  const sendComment = () => {
    if (status !== '') {
      const now = () => moment().format("YYYY-MM-DD HH:mm:ss");
      const newComment = {
        dealId,
        content: {text: status, username: currentUser.username, likeUsers: [], dislikeUsers: [] },
        userId: currentUser.id,
        currentTime: now(),
        parentId,
      };
      dispatch(addNewComment(newComment));
      setStatus('');
    }
  }

  const onCommentKeyDown = (e) => {
    if (!status || !status.trim()) return;
    const keyCode = e.which || e.keyCode;
    if (keyCode === 13 && !e.shiftKey) {
        e.preventDefault();
        sendComment();
    } 
  };

  const wrapperRef = useRef();
  useEffect(() => {
      document.addEventListener('contextmenu', onFocus);
      document.addEventListener('click', onFocus);
      if (isReply) wrapperRef.current.focus()
  },[])

  const [isFocused, setIsFocused] = useState(false)
  const onFocus = (event) => {
      const { target } = event
      if (wrapperRef.current) {
        setIsFocused(!wrapperRef.current.contains(target) ? false : true)
      }
  }

  return (
    <div className={classes.newCommentCard}>
      <div className={classes.inputContainer}>
        <a className={classes.userAvatar} href={getLinkToProfile(currentUser.username)} >
          <Avatar size={parentId ? 'medium': 'large'} src={currentUser && currentUser.info && currentUser.info.avatarUrl} />
        </a>
        <TextArea
          onChange={(e) => {
            if (!isFocused) setIsFocused(true);
            setStatus(e.target.value)
          }}
          onKeyDown={(e) => onCommentKeyDown(e)}
          onClick={() => {if (!currentUser.id) window.location.href=`${DEALBEE_PATHS.login}?required=true`}}
          className={classes.input}
          placeholder="Thêm bình luận... (Nhấn Shift + Enter để xuống dòng)"
          resize="smart"
          value={status}
          css={TEXT_INPUT_CUSTOM_STYLE}
          minimumRows={3}
          maxLength={INPUT_LENGTHS.comment.max}
          ref={wrapperRef}
        />
      </div>
      <div className={classes.actionOnCommentCard} style={{visibility: isFocused ? 'visible' : 'hidden'}}>
          <Button spacing="compact" onClick={cancelComment}>Hủy</Button>
          <Button spacing="compact" appearance="primary" onClick={sendComment} isDisabled={status === "" && true}>Đăng</Button>
      </div>
    </div>
  );
};
export default NewCommentCard;
