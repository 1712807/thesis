import React from 'react';
import { createUseStyles } from 'react-jss';
import CrossCircleIcon from '@atlaskit/icon/glyph/cross-circle';
import WarningIcon from '@atlaskit/icon/glyph/warning';

const useStyles = createUseStyles({
  imagePanelContainer: {
    paddingTop: '.5rem',
  },
  imageContainer: {
    width: 'fit-content',
    position: 'relative',
    marginBottom: '.5rem',
  },
  image: {
    border: 0,
    height: '7rem',
    margin: '0.25rem',
    objectFit: 'scale-down',
    borderRadius: '3px',
  },
  removeIcon: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    cursor: 'pointer',
  },
  invalidImg: {
    color: 'red',
    fontWeight: 'bold',
    position: 'absolute',
    top: '0.5rem',
    left: '.5rem',
    fontSize: '.5rem',
  },
  errorInfo: {
    color: 'red',
    fontSize: '.8rem',
  },
});
const AddImage = ({
  photoUrls, onRemovePhotoClicked, invalid
}) => {
  const classes = useStyles();

  return (
    <div className={classes.imagePanelContainer}> 
      <div
        key={photoUrls}
        className={classes.imageContainer}
        style={{opacity: invalid ? '.5' : '1'}}
      >
        <img className={classes.image} src={photoUrls} alt={photoUrls} />
        <div
          className={classes.removeIcon}
          role="presentation"
          onClick={onRemovePhotoClicked}
        >
          <CrossCircleIcon />
        </div>
        {invalid && <div className={classes.invalidImg}>
            <WarningIcon />
          </div>}
      </div>
    </div>
  );
};

export default AddImage;
