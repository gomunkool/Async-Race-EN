import {Garage} from '../../pages/GaragePage/garage';
import {CarDataType} from '../../models/dataCar'

export class Car {
  parent: Garage;
  dataElement: CarDataType;
  node: HTMLElement;

  constructor (parent: Garage, dataElement: CarDataType, node: HTMLElement) {
    this.parent = parent;
    this.dataElement = dataElement;
    this.node = node;
  }


  render (): void {
    this.node.innerHTML += `
       <div class="car_count"> 
          <div class="car__buttons_count">
              <button class="car__button button__select">SELECT</button>
              <button class="car__button button__remove" data-id="${this.dataElement.id}">REMOVE</button>
              <button class="car__button button__start">START</button>
              <button class="car__button button__stop">STOP</button>
              <h3 class="car__title">${this.dataElement.name}</h3>
          </div>
          <div class="car__race">
            <svg fill="${this.dataElement.color}" height="50px" width="100px" 
xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 256 158.7"
xml:space="preserve">
<path d="M80.1,129.2c0,15.2-12.3,27.5-27.5,27.5c-15.2,0-27.5-12.3-27.5-27.5s12.3-27.5,27.5-27.5C67.8,101.7,80.1,114,80.1,129.2z
\t M66.1,129.2c0-7.4-6.1-13.5-13.5-13.5c-7.4,0-13.5,6.1-13.5,13.5c0,7.4,6.1,13.5,13.5,13.5S66.1,136.6,66.1,129.2z M231.2,129.2
\tc0,15.2-12.3,27.5-27.5,27.5s-27.5-12.3-27.5-27.5s12.3-27.5,27.5-27.5S231.2,114,231.2,129.2z M217.2,129.2
\tc0-7.4-6.1-13.5-13.5-13.5c-7.4,0-13.5,6.1-13.5,13.5c0,7.4,6.1,13.5,13.5,13.5S217.2,136.6,217.2,129.2z M253.8,104.7H248v0l0-28.1
\tc0-8.8-7.1-15.9-16-15.9h-26c-0.6,0-1.2-0.3-1.6-0.7l-44.5-49c-2-2-4.8-3.2-7.7-3.3l-83.5,0c-6.8,0-12.6,4.4-15.1,10.6L34.4,58.9
\tc-0.2,1-1.1,1.7-2.2,1.7h0C22.2,60.7,8,60.7,8,78.9v23.5c0,1.2-1,2.2-2.2,2.2H2.2c-1.2,0-2.2,1-2.2,2.2v7.5
\tc0,5.6,4.6,10.2,10.2,10.2h4.1c1.1,0,2-0.8,2.2-1.8c3-17.2,18.1-30.4,36.2-30.4c18.1,0,33.1,13.1,36.1,30.3c0.2,1.1,1.1,1.8,2.2,1.8
\th74.4c1.1,0,2-0.8,2.2-1.8c3-17.2,18-30.3,36.1-30.3c18.1,0,33.1,13.1,36.1,30.3c0.2,1.1,1.1,1.8,2.2,1.8h3.8
\tc5.7,0,10.2-4.6,10.2-10.2v-7.4C256,105.7,255,104.7,253.8,104.7z M103.8,57.7c0,1.2-1,2.1-2.1,2.1H52.9c-1.4,0-2.4-1.3-2.1-2.6
\tl14.1-33.8c0.4-1.7,1.8-3,3.6-3h33.2c1.2,0,2.1,1,2.1,2.1V57.7z M180.7,59.2h-59.2c-1.1,0-2.1-0.9-2.1-2.1v-34
\tc0-1.1,0.9-2.1,2.1-2.1h29.3c0.6,0,1.1,0.2,1.5,0.7l29.9,34C183.4,57.1,182.5,59.2,180.7,59.2z"/>
</svg>
          </div>
       </div> 
         `;
  }

  delete (): void {
    this.node.innerHTML = '';
  }
}
