import './style/style.css'
import './pages/GaragePage/garage.css'
import './components/car/car.css'

import {Application} from './system/app.ts';

window.onload = () => {
  const app = new Application ('main');
  app.init ();
};
