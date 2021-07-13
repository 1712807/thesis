import { faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { searchDeal } from '../../redux/deals/action';
import { dealsBySearchKeySelector, searchKeySelector } from '../../selectors/dealsSelectors';
import DealPreviewHorizontal from "../deal_preview/DealPreviewHorizontal";
import LoadingSpinner from '../common/loaders/LoadingSpinner';

const SearchKeyDeals = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const searchKey = searchParams.get("key");
    const searchKeyStatus = useSelector(searchKeySelector);
    const allDealsBySearchKeyLoaded = useSelector((state) => state.deals.allDealsBySearchKeyLoaded);

    const dispatch = useDispatch();
    useEffect(() => {
        if (!searchKeyStatus) dispatch(searchDeal(searchKey)); 
    })

    const dealsBySearchKey = useSelector(dealsBySearchKeySelector);
    const countDeals = dealsBySearchKey.length;

    document.addEventListener("scroll", () => {
        const {scrollHeight: maxHeight, clientHeight: containerHeight, scrollTop} = document.getElementsByTagName("html")[0];
        const isBottom = Math.ceil(scrollTop + containerHeight) >= maxHeight;
        if (isBottom) {
            if (!allDealsBySearchKeyLoaded) dispatch(searchDeal(searchKey))
        }
    });

    return (
        <div style={{margin: '2rem 4rem', background: countDeals > 0 && 'white', borderRadius: "5px"}}>
            {countDeals > 0 && <p style={{padding: '1rem 1rem 0'}}>
                <FontAwesomeIcon icon={faCaretRight}/>
                &nbsp;Kết quả tìm kiếm với từ khóa <b style={{fontSize: "500"}}>{searchKey}</b> 
            </p>}
            {countDeals > 0 ? dealsBySearchKey.map((item) => <DealPreviewHorizontal key={item.id} deal={item}/>)
            : (searchKeyStatus && 
                <h2
                    style={{
                        marginTop: "0",
                        textAlign: 'center',
                        fontWeight: 'normal',
                        fontSize: '1rem'
                    }}>
                        Không tìm thấy kết quả với từ khóa{" "}
                        <span style={{fontWeight: "500"}}>{searchKey}</span>
                </h2>)
            }
            {(!allDealsBySearchKeyLoaded) && <LoadingSpinner />}
        </div>
    );
}

export default SearchKeyDeals;