if(module.hot)
  module.hot.accept();

import './app.css';
import './app.scss';

const element = document.createElement('div');
element.innerHTML = 'hello world';

document.body.appendChild(element);

console.log('hello world');


