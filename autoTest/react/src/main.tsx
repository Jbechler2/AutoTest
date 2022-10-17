import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import { Kochava } from './kochava/kochava'; // To test local dev version
// import { Kochava } from 'kv-test-lib'; // To test the published dev version
// import { Kochava } from 'kochava'; // To test the published prod version

const KochavaSetup = (): Kochava => {
  const kochava = Kochava.createForReact();

  // Optional pre-start calls will go here

  return kochava;
};

ReactDOM.render(
  <React.StrictMode>
    <App kochava={KochavaSetup()} />
  </React.StrictMode>,
  document.getElementById('root')
);

