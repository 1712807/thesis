import React from "react";
import Textfield from "@atlaskit/textfield";
import SearchIcon from '@atlaskit/icon/glyph/search';
import { INPUT_LENGTHS, TEXT_INPUT_CUSTOM_STYLE } from "../../../services/utils/constant";

 const SearchInput = (props) => {
  const {value, onChange, onKeyDown, type} = props;
  return (
    <div style={{position: "relative"}}>
      <Textfield
        value={value}
        placeholder={`Tìm kiếm ${type}...`}
        onChange={(e) => onChange(e.target.value)}
        css={{
          ...TEXT_INPUT_CUSTOM_STYLE,
          backgroundColor: "white",
          borderWidth: "1.5px",
          // container style
          '& > [data-ds--text-field--input]': {
            // input style
            marginLeft: "24px"
          },
        }}
        maxLength={INPUT_LENGTHS.searchField.max}
        onKeyDown={onKeyDown}
      />
      <div style={{
        position: "absolute",
        top: 8,
        left: 5,
        color: "lightgray",
      }}>
        <SearchIcon size="medium"/>
      </div>
    </div>
  )
}

export default SearchInput;