import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createUseStyles } from 'react-jss';
import { followingDealsIdSelector, currentUserSelector } from '../../../../selectors/usersSelector';
import { updateDealInfollowingDealsId } from '../../../../redux/users/action';
import { Checkbox } from '@atlaskit/checkbox';

const useStyles = createUseStyles({
    addListContainer: {
        display: 'flex',
        alignItems: 'center',
        marginRight: '.5rem',
        cursor: 'pointer',
        // height: '100%',
        '& > label': {
            cursor: 'pointer',
            color: 'gray',
            fontFamily: 'inherit',
            "& input": {
                visibility: "hidden",
            }
        }, 
        "& span": {
            paddingLeft: "0 !important",
            fontWeight: '500',
            color: 'black',
            fontSize: '.8rem',
        }
    },
    addedStatus: {
        color: 'white',
        background: 'rgb(4, 180, 66)',
    },
    text: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
    addIcon: {
        color: 'gray',
        width: '1.5rem !important',
        height: '1.5rem',
        '&:hover': {
            color: 'rgb(4, 180, 66)',
        }
    },
    blurLabel: {
        "& span": {
            color: 'lightgray',
        }
    },
})
const AddDealCheckBox = (props) => {
    const classes = useStyles();
    const dispatch =  useDispatch();
    const { deal } = props;
    const { id, user_id } = deal;
    const followingDealsId = useSelector(followingDealsIdSelector);
    const currentUser = useSelector(currentUserSelector);
    const addedDeal = followingDealsId && followingDealsId.includes(id);
    const [added, setAdded] = useState(false);

    useEffect(() => {
        setAdded(addedDeal);
    }, [addedDeal]);

    const addOrDeleteDealOfFollowingList = () => {
        dispatch(updateDealInfollowingDealsId(id, !added));
        setAdded(!added);
    }
    const nonUser = !currentUser.id || currentUser.id === user_id
    return (
        <div 
            className={nonUser ? `${classes.addListContainer} ${classes.blurLabel}` : `${classes.addListContainer}`}
        >
            <Checkbox
            value="Theo dõi deal"
            label="Theo dõi deal"
            onChange={() => addOrDeleteDealOfFollowingList()}
            size="medium"
            isChecked={added}
            isDisabled={nonUser}
            />
        </div>
    );
}

export default AddDealCheckBox;