import React, { useState, useRef, useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { getDealBySearchKeyApi } from '../../../services/api/deals';
import { removeAccents, getLinkToDeal } from '../../../services/utils/common';
import { DEALBEE_PATHS, TEXT_INPUT_CUSTOM_STYLE } from '../../../services/utils/constant';
import SearchInput from '../../common/text_fields/SearchInput';

const useStyle = createUseStyles({
  searchIcon: {
    display: 'flex',
    alignItems: 'center',
    // transform: 'rotate(90deg)',
  },
  searchField: {
      fontSize: '0.875rem',
      // backgroundColor: 'white',
      // borderRadius: '3px',
      // padding: '0 1rem 0 0.25rem',
      minHeight: '2rem',
      display: 'flex',
      flex: 1,
      marginLeft: "1.5rem",
      // marginRight: '0.75rem',
      "&:hover:not(:focus-within)": {
          backgroundColor: "#f1f1f1",
          transition: "all ease-in-out 0.5s",
          '& input': {
            backgroundColor: "#f1f1f1",
            transition: "all ease-in-out 0.5s",
          }
      },
      position: 'relative',
  },
  input: {
    outline: 'none',
    border: 'none',
    backgroundColor: 'white',
    width: '100%',
    fontSize: '0.875rem',
    color: "black",
    // "&:hover:not(:focus)": {
    //     backgroundColor: "#e0e0e0",
    //     transition: "all ease-in-out 0.5s",
    // }
  },
  suggestedTable: {
    padding: '.5rem 0',
    borderRadius: '5px',
    position: 'absolute',
    top: '110%',
    width: "99.5%",
    // width: '-webkit-fill-available',
    background: 'white',
    maxHeight: "700%",
    overflowY: "scroll",
    zIndex: "1000",
    left: '0.25%',
    boxShadow: 'rgb(9 30 66 / 25%) 0px 1px 1px, rgb(9 30 66 / 13%) 0px 0px 1px 1px',
  },
  suggestedItem: {
    overflow: "hidden",
    display: "-webkit-box",
    boxOrient: "vertical",
    lineClamp: 2,
  },
  itemContainer: {
    '&:hover': {
      backgroundColor: "#f2f3f5",
      transition: "all ease-in-out 0.5s",
    },
    cursor: 'pointer',
    padding: '.5rem',
    margin: '.25rem 0',
  }
})
const SearchDealForm = () => {
  const classes = useStyle();
  const [suggestedTable, setSuggestedTable] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [isShowingSuggestedTable, setIsShowingSuggestedTable] = useState(false)
  const wrapperRef = useRef();
    useEffect(() => {
        document.addEventListener('contextmenu', handleClickOutside);
        document.addEventListener('click', handleClickOutside);
    },[])

  const handleClickOutside = (event) => {
      const { target } = event
      if (wrapperRef.current) {
        setIsShowingSuggestedTable(!wrapperRef.current.contains(target) ? false : true)
      }
  }
  
  const onSearch = (e) => {
    if (invalidSearchKey(searchKey)) return;
    const keyCode = e.which || e.keyCode;
    if (keyCode === 13 && !e.shiftKey) {
        e.preventDefault();
        window.location.href=`${DEALBEE_PATHS.searchDeal}?key=${searchKey}`
    }
  };

  const updateSearchKeyAndDisplaySuggestedTable = async (value) => {
      setSearchKey(value);

      if (!invalidSearchKey(value)) {
        const normalizedSearchKey = removeAccents(value.toLowerCase());
        const params = {
            searchKey: normalizedSearchKey,
        }
        const res = await getDealBySearchKeyApi({params})
        const newData = res.data.filter((i) => i && i.is_title);
        setSuggestedTable(newData.slice(0, newData.length > 6 ? 6 : newData.length))
        setIsShowingSuggestedTable(true)
      } else setSuggestedTable([])
  }

  const invalidSearchKey = (key) => {
    return key === '' || !key.trim()
  }

  const renderItem = (item) => {
    const { id, info: { title } } = item;
    const normalizedSearchKey = removeAccents(searchKey.toLowerCase());
    const normalizedTitle = removeAccents(title.toLowerCase());
    const keyIndex = normalizedTitle.indexOf(normalizedSearchKey);
   
    return (
      keyIndex > -1 && <a href={getLinkToDeal(id, title)} style={{color: 'black', textDecoration: 'none'}}>
        <div className={classes.itemContainer}>
          <div key={item} className={classes.suggestedItem}>
            {title.substring(0, keyIndex)}
            <b>{title.substring(keyIndex, searchKey.length + keyIndex)}</b>
            {title.substring(searchKey.length + keyIndex, title.length)}
          </div>
        </div> 
      </a>
        
    );
  }

  return (
    <div className={classes.searchField}>   
      <div style={{width: "100%"}} ref={wrapperRef}>
        <SearchInput
          type="deal"
          value={searchKey}
          onChange={updateSearchKeyAndDisplaySuggestedTable}
          onKeyDown={onSearch}
        />
      </div>
      
      {!invalidSearchKey(searchKey) && isShowingSuggestedTable && <div className={classes.suggestedTable}>
          <div style={{marginLeft: '.5rem', marginBottom: '.5rem', fontSize: '1rem'}}>
            Tìm deal: <b>{`"${searchKey}"`}</b>
          </div>
          {suggestedTable.map((item, index) => (
              renderItem(item)
          ))}
      </div>}
    </div>
  );
}

export default SearchDealForm;
