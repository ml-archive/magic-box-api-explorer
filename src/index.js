import 'core-js/fn/object/assign';
import React from 'react';
import App from './components/Main';

window.__app_container = document.getElementById('app');
// Render the main component into the dom
React.render(<App />, window.__app_container);
