import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { pendingDealsSelector } from '../../selectors/usersSelector';
import DealPreviewWithInlineEdit from '../deal_preview/DealPreviewWithInlineEdit';
import { useCommonStyles } from '../../services/utils/common_classes';
import ButtonViewMore from '../common/buttons/ButtonViewMore';
import { getPendingDeals } from '../../redux/users/action';
import LoadingSpinner from '../common/loaders/LoadingSpinner';

const PendingDeals = () => {
    const commonClasses = useCommonStyles();
    const dispatch = useDispatch();

    const pendingDeals = useSelector(pendingDealsSelector);
    const {list, currentPage, isLoading} = pendingDeals;
    
    useEffect(() => {
        dispatch(getPendingDeals())
    }, [])

    const renderList = () => {
        return (
            <div className={commonClasses.dealsPreviewWithInlineEditContainer}>
                {list.map((item) => (
                    <DealPreviewWithInlineEdit 
                        key={item.id} 
                        deal={item} 
                        isEditor={false}
                    />
                ))}
            </div>
        )
    }

    if (isLoading && list.length === 0) {
        return <LoadingSpinner />
    }

    if (list.length === 0 && currentPage < 0) {
        return <div className={commonClasses.emptyDealMsg}>Bạn không có deal nào đang chờ duyệt.</div> 
    }

    return (
        <div className={commonClasses.listContainer}>
            <div>
                {renderList()}
                {isLoading
                    ? <LoadingSpinner /> 
                    : (currentPage > 0 && list.length > 0 &&
                        <div onClick={() => dispatch(getPendingDeals())}>
                            <ButtonViewMore />
                        </div>
                    )
                }
            </div>
        </div>
    );
}

export default PendingDeals;