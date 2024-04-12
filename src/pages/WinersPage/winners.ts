import {Application} from '../../system/app';


export class Winners {
  app: Application;

  constructor (app: Application) {
    this.app = app;
  }

  init () {

  }

  render (): void {
    this.app.node.innerHTML = `
        <div class="main-toys">
    Winners
</div>
    `;
    this.init ();
  }

  delete (): void {
    this.app.node.innerHTML = '';
  }
}
