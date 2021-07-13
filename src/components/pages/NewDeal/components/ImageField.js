import React, { useState, useRef} from "react"; 
import ImageIcon from '@atlaskit/icon/glyph/image';
import AddImage from './AddImage';
import { createUseStyles } from "react-jss";

const ImageField = (props) => {
    const { setPhotoFiles, invalid } = props;
    const classes = useStyles();
    const uploadPhotoRef = useRef();
    const [photoUrls, setPhotoUrls] = useState('');

    const onPhotoClicked = () => {
        uploadPhotoRef.current.click();
      };
    const onPhotoUpdated = (files) => {
        setPhotoUrls(window.URL.createObjectURL(Array.from(files)[0]));
        setPhotoFiles(Array.from(files)[0]);
    };

    const onRemovePhotoClicked = () => {
        setPhotoUrls('');
        setPhotoFiles('');
    };

    const isExistPhoto = photoUrls !== "";
    const renderAddImgField = () => {
        return (
            <div>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <div style={{marginRight: "0.25rem"}}>Ảnh minh họa</div>
                    <div
                        className={classes.typeButton}
                        role="presentation"
                        onClick={onPhotoClicked}
                    >
                        <ImageIcon />
                        <input
                            ref={uploadPhotoRef}
                            type="file"
                            onChange={(e) => onPhotoUpdated(e.currentTarget.files)}
                            hidden
                            aria-hidden
                            accept="image/*"
                        />
                    </div>
                </div>
              {isExistPhoto && (
                  <AddImage
                      photoUrls={photoUrls}
                      onRemovePhotoClicked={onRemovePhotoClicked}
                      invalid={invalid}
                  />
              )}
            </div>
        );
    }
    return (
      renderAddImgField()
    )
}

const useStyles = createUseStyles({
    typeButton: {
        padding: '0.05rem 0.25rem',
        borderRadius: '0.35rem',
        display: 'flex',
        alignItems: 'center',
        width: 'fit-content',
        '&:hover': {
          backgroundColor: '#f2f2f2',
          transition: 'all ease-in-out 0.3s',
        },
        cursor: 'pointer',
    }, 
})

export default ImageField;