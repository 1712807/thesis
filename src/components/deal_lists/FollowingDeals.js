import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFollowingDealsByUser } from '../../redux/users/action';
import { currentUserSelector, followingDealsSelector } from '../../selectors/usersSelector';
import { useCommonStyles } from '../../services/utils/common_classes';
import ButtonViewMore from '../common/buttons/ButtonViewMore';
import LoadingSpinner from '../common/loaders/LoadingSpinner';
import DealPreviewHorizontal from '../deal_preview/DealPreviewHorizontal';

const FollowingDeals = () => {
    const commonClasses = useCommonStyles();
    const dispatch = useDispatch();
    
    const currentUser = useSelector(currentUserSelector);
    const followingDeals = useSelector(followingDealsSelector);

    const {list, currentPage, isLoading} = followingDeals;

    useEffect(() => {
        dispatch(getFollowingDealsByUser(currentUser));
    }, [])

    const renderList = () => {
        return (
            <div className={commonClasses.listContainer}>
                {list.map((item) => (
                    <DealPreviewHorizontal type="following" key={item.id} deal={item}/>
                ))}
                {currentPage > 0 &&
                    (isLoading
                        ? <LoadingSpinner/>
                        : <div 
                            style={{padding: "0"}}
                            onClick={() => dispatch(getFollowingDealsByUser(currentUser))}
                        >
                            <ButtonViewMore/>
                        </div>
                    )
                }
            </div>
        )
    }

    return( 
        <div>
            {currentUser.followingDealsId === null || currentUser.followingDealsId.length === 0
                ? <div className={commonClasses.emptyDealMsg}>Bạn chưa theo dõi bất cứ deal nào.</div> 
                : renderList()
            }
        </div>
    );
}

export default FollowingDeals;