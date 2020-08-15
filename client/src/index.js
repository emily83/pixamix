import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { GlobalProvider } from './context/GlobalState';
import { Spinner } from './components/Spinner';
import './fonts/CenturyGothic.ttf'

ReactDOM.render(
  <React.StrictMode>
    <GlobalProvider>
      <App />
      <Spinner />
    </GlobalProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
