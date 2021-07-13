import React, { useEffect, useState } from "react";
import { AutoDismissFlag, FlagGroup } from '@atlaskit/flag';
import { useDispatch, useSelector } from "react-redux";
import { updateFlagsSuccess } from "../../../redux/app/action";
import SuccessIcon from '@atlaskit/icon/glyph/check-circle';
import ErrorIcon from '@atlaskit/icon/glyph/error';
import InfoIcon from '@atlaskit/icon/glyph/info';

const FlagNotification = () => {
    const dispatch = useDispatch();
    const newFlag = useSelector((state) => state.app.newFlag);
    const [flags, setFlags] = useState([]);

    useEffect(() => {
      if (newFlag) {
        setFlags([newFlag, ...flags]);
        dispatch(updateFlagsSuccess());
      }
    }, [newFlag])

    const handleDismiss = () => {
      setFlags(flags.slice(1));
    };

    const getIconByType = (type) => {
      switch (type) {
        case "success": 
          return <SuccessIcon primaryColor="rgb(0, 135, 90)" size="medium" />;
        case "error":
          return <ErrorIcon primaryColor="rgb(222, 53, 11)" size="medium"/>;
        case "warning": 
          return <InfoIcon primaryColor="rgb(255, 196, 0)" size="medium"/>;
        case "info": 
          return <InfoIcon primaryColor="#172B4D" size="medium" />
        default: 
          return '';
      }
    }
  
    return (
      <div>
        <FlagGroup onDismissed={handleDismiss}>
          {flags.map((item, index) => {
            return (
              <AutoDismissFlag
                id={item.id}
                key={item.id}
                icon={getIconByType(item.type)}
                title={item.title}
                description={item.description}
              />
            );
          })}
        </FlagGroup>
      </div>
    );
}

export default FlagNotification;