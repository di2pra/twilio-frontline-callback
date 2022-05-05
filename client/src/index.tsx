import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'bootstrap/dist/css/bootstrap.css';
import './index.scss';
import { BrowserRouter } from "react-router-dom";
import { Theme } from '@twilio-paste/core/theme';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Theme.Provider theme="default">
        <App />
      </Theme.Provider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);