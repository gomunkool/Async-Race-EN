import './style/style.css'
import './pages/GaragePage/garage.css'

import {Application} from './system/app.ts';

window.onload = () => {
  const app = new Application ('main');
  app.init ();
};
