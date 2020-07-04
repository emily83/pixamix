import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { GlobalProvider } from './context/GlobalState';
import { Spinner } from './components/Spinner';

ReactDOM.render(
  <React.StrictMode>
    <GlobalProvider>
      <App />
      <Spinner />
    </GlobalProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
