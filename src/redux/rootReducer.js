import { combineReducers } from 'redux';
import adminReducer from './admin/reducer';
import { appReducer } from './app/reducer';
import { dealsReducer } from './deals/reducer';
import { usersReducer } from './users/reducer';

const rootReducer = combineReducers({
    app: appReducer,
    deals: dealsReducer,
    users: usersReducer,
    admin: adminReducer,
});
  
export default rootReducer;