import React from 'react';
import ContentLoader from 'react-content-loader';
import { MAX_PAGE_WIDTH } from '../../../services/utils/constant';

const PageLoader = () => (
  <div style={{ 
    width: '100%', 
    minHeight: "500px", 
    maxWidth: MAX_PAGE_WIDTH,
  }}>
    <ContentLoader
      speed={1}
      style={{ width: '100%', height: "500px" }}
    >
      <rect x="0" y="0" rx="5" ry="5" width="63%" height="500" />
      <rect x="66%" y="0" rx="5" ry="5" width="34%" height="500" />
    </ContentLoader>
  </div>
);

export default PageLoader;
