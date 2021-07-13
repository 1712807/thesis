import React from 'react';
import ContentLoader from 'react-content-loader';
import { MAX_PAGE_WIDTH } from '../../../services/utils/constant';

const SectionLoader = (props) => {
  const height = props.height || 500;
  return (
    <div style={{ 
      width: '100%', 
      minHeight: `${height}px`, 
      maxWidth: MAX_PAGE_WIDTH,
      ...props.style
    }}>
      <ContentLoader
        speed={1}
        style={{ width: '100%', height: `${height}px` }}
      >
        <rect x="0" y="0" rx="5" ry="5" width="100%" height="100%" />
      </ContentLoader>
    </div>
  )
};

export default SectionLoader;
