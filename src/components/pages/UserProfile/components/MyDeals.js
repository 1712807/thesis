import React, { useEffect, useState } from "react";
import Tabs from '@atlaskit/tabs';
import { currentUserSelector } from "../../../../selectors/usersSelector";
import { useDispatch, useSelector } from "react-redux";
import { changeMyDealsMenuTab } from "../../../../redux/users/action";
import UsersDeals from "../../../deal_lists/UsersDeals";
import { useCommonStyles } from "../../../../services/utils/common_classes";
import FollowingDeals from "../../../deal_lists/FollowingDeals";
import PendingDeals from "../../../deal_lists/PendingDeals";

const tabsLabels = [
    "Deal đã chia sẻ",
    "Deal chờ duyệt",
    "Deal đang theo dõi",
]

const MyDeals = (props) => {
    const commonClasses = useCommonStyles();
    const dispatch = useDispatch();

    const {defaultTab} = props;
    const [currentTab, setCurrentTab] = useState(defaultTab);

    useEffect(() => {
        setCurrentTab(defaultTab);
        dispatch(changeMyDealsMenuTab(defaultTab))
    }, [])
    
    const currentUser = useSelector(currentUserSelector);
    
    const changeDealList = (index) => {
        if (index === currentTab) return;
        setCurrentTab(index);
        dispatch(changeMyDealsMenuTab(index));
    }

    const renderTabContent = () => {
        return (
            <div className={commonClasses.listContainer}>
                {currentTab === 0 && <UsersDeals userId={currentUser.id} isMine={true}/>}
                {currentTab === 1 && <PendingDeals/>}
                {currentTab === 2 && <FollowingDeals/>}
            </div>
        )
    }

    const tabs = tabsLabels.map((item, index) => ({
        label: item,
        content: renderTabContent(),
    }));

    return (
        <Tabs
            tabs={tabs} 
            onSelect={(tab, index) => changeDealList(index)}
            selected={tabs[currentTab]}
        />
    )
}

export default MyDeals;