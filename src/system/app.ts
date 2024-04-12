import {Main} from '../pages/main.ts';
import {Garage} from "../pages/GaragePage/garage";
import {Winners} from "../pages/WinersPage/winners";

export class Application {
  id: string;
  node: HTMLElement;
  main: Main;
  garage: Garage;
  winners: Winners

  constructor (id: string) {
    this.id = id;
    this.node = document.getElementById (this.id);
  }

  init (): void {
    this.main = new Main (this);
    this.garage = new Garage (this);
    this.winners = new Winners (this)

    this.main.render ();
  }
}