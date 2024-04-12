import {Application} from '../system/app.ts';

export class Main {
  app: Application;

  constructor (app: Application) {
    this.app = app;
  }

  init (): void {
    const garageButton: HTMLElement = document.querySelector('.garage-button');
    const winnersButton: HTMLElement = document.querySelector('.winners-button');

    garageButton.addEventListener('click', (): void => {
      this.delete();
      this.app.garage.render();
    });
    winnersButton.addEventListener('click', (): void => {
      this.delete();
      this.app.winners.render();
    });
  }

  render (): void {
    this.app.node.innerHTML = ` 
      <div class="main-start">
         <h2>Welcome to my app</h2>
      </div>`
    this.init ();
  }

  delete (): void {
    this.app.node.innerHTML = '';
  }
}
