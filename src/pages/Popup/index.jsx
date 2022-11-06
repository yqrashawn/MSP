import React from 'react';
import { render } from 'react-dom';

import Popup from './Popup';
import 'uno.css';
import '@unocss/reset/tailwind.css';
import './index.css';

render(<Popup />, window.document.querySelector('#app-container'));

if (module.hot) module.hot.accept();
