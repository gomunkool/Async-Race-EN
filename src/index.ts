import './style/style.css'
import './pages/GaragePage/garage.css'
import './components/car/car.css'
import './pages/WinersPage/winners.css'
import './components/winner/winner.css'



import {Application} from './system/app.ts';

window.onload = () => {
  const app = new Application ('main');
  app.init ();
};
