import {Application} from '../../system/app';


export class Garage {
  app: Application;

  constructor (app: Application) {
    this.app = app;
  }

  init () {
    function changeColor (value) {
      const inputField = document.getElementById ('inputField');
      inputField.style.color = value;
    }
  }

  render (): void {
    this.app.node.innerHTML = `
        <div class="main-garage">
            <h2 class="garage__title">Garage</h2>
            <form class="garage__form">
                <input type="text" placeholder="name" class="garage__text">
                <input type="color" id="crete0color" class="garage__color" name="color" value="#e66465" />
                <button class="garage__button">Create</button>
            </form>
            <form class="garage__form">
                <input type="text" placeholder="name" class="garage__text">
                <input type="color" id="crete0color" class="garage__color" name="color" value="#e66465" />
                <button class="garage__button">Update</button>
            </form>
            <div class="garage__buttons_count">
                <button class="garage__buttons garage__buttons_race">RACE</button>
                <button class="garage__buttons garage__buttons_reset">RESET</button>
                <button class="garage__buttons garage__buttons_generate">GENERATE CARS</button>            
            </div>
        </div>
    `;
    this.init ();
  }

  delete (): void {
    this.app.node.innerHTML = '';
  }
}
