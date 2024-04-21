import {Main} from '../pages/main.ts';
import {Garage} from "../pages/GaragePage/garage";
import {Winners} from "../pages/WinersPage/winners";
import {data} from '../models/dataCar'

export class Application {
  id: string;
  node: HTMLElement | null;
  main: Main;
  garage: Garage;
  winners: Winners

  constructor (id: string) {
    this.id = id;
    this.node = document.getElementById (this.id);
    this.main = new Main(this);
    this.garage = new Garage(this, []);
    this.winners = new Winners (this, []);
  }

  init (): void {
    this.main = new Main (this);
    this.garage = new Garage (this, data);
    this.winners = new Winners (this, data)

    this.main.render ();
  }
}
