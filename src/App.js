import './App.css';
import React from 'react';
import 'regenerator-runtime/runtime';
import createSagaMiddleware from 'redux-saga';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { logger } from 'redux-logger';
import { JssProvider, SheetsRegistry, createGenerateId } from 'react-jss';
import rootReducer from './redux/rootReducer';
import { rootSaga } from './redux/rootSaga';
import DealbeeMain from './components/DealbeeMain';

const devMode = process.env.NODE_ENV === 'development';

const sagaMiddleware = createSagaMiddleware();
let store = null;
if (devMode) {
  store = createStore(rootReducer, applyMiddleware(sagaMiddleware, logger));
} else {
  store = createStore(rootReducer, applyMiddleware(sagaMiddleware));
}

sagaMiddleware.run(rootSaga);

const App = () => {
  const sheets = new SheetsRegistry();
  const generateId = createGenerateId();

  return (
    <Provider store={store}>
      <JssProvider registry={sheets} generateId={generateId}>
        <DealbeeMain/>
      </JssProvider>
    </Provider>
  );
};

export default App;
