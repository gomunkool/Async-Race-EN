import {Application} from '../../system/app';
import {CarDataType} from "../../models/dataCar";
import {Car} from "../../components/car/car";


export class Garage {
  app: Application;
  nodeCar: HTMLElement;
  data: CarDataType[];
  totalPages: number;
  totalCars: number;
  currentPage: number;

  constructor (app: Application, data: CarDataType[]) {
    this.app = app;
    this.data = data;
    this.totalPages = 1;
    this.totalCars = 0;
    this.currentPage = 1;
  }


  async fetchData (url: string): Promise<CarDataType[]> {
    try {
      const response = await fetch (url);
      return await response.json ();
    } catch (error) {
      console.error ('Error fetching data:', error);
      return [];
    }
  }

//////////////////////////////////////////////////////////////
  async init () {
    this.nodeCar = document.getElementById ('garage__race_count');
    const paginationPageCount = document.querySelector ('.pagination__num');
    const paginationButtonLeft = document.querySelector ('.pagination__button_left')
    const paginationButtonRight = document.querySelector ('.pagination__button_right')
    const createForm = document.querySelector ('.garage__form')


    paginationButtonLeft.removeEventListener ('click', this.handlePaginationLeftClick);
    paginationButtonRight.removeEventListener ('click', this.handlePaginationRightClick);

    paginationButtonLeft.addEventListener ('click', this.handlePaginationLeftClick);
    paginationButtonRight.addEventListener ('click', this.handlePaginationRightClick);

    this.data = await this.fetchData (`http://localhost:3000/garage?_page=${this.currentPage}&_limit=7`);
    this.totalCars = (await this.fetchData ('http://localhost:3000/garage')).length;

    this.installationPagination (this.totalCars)

    this.createCars ()


    const submitHandler = (event) => {
      this.createCarForm (event);
      createForm.removeEventListener ('submit', submitHandler);
    };
    
    createForm.addEventListener ('submit', submitHandler);

  }

////////////////////////////////////////////////////////////////////////////////////

  createCars () {
    this.nodeCar.innerHTML = '';
    this.data.map (
      (el: CarDataType) => {
        const element: Car = new Car (this, el, this.nodeCar);
        element.render ();
        this.addEventListenersToCarButtons (element);
        return element;
      }
    );
  }

  async deleteCar (id) {
    try {
      const response = await fetch (`http://localhost:3000/garage/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        console.log ('Car successfully deleted from the garage');
        this.totalCars--;
        await this.init ()
      } else if (response.status === 404) {
        console.error ('Car not found in the garage');
      } else {
        console.error ('Failed to delete car from the garage');
      }
    } catch (error) {
      console.error ('Error deleting car from the garage:', error);
    }
  }

  addEventListenersToCarButtons (car: Car) {
    const selectButton = car.node.querySelector ('.button__select');
    const removeButton = car.node.querySelectorAll ('.button__remove');
    const startButton = car.node.querySelector ('.button__start');
    const stopButton = car.node.querySelector ('.button__stop');


    selectButton.addEventListener ('click', (event) => {
    });


    removeButton.forEach (el => {
      el.addEventListener ('click', (event) => {
        const id = (event.currentTarget as HTMLElement).getAttribute ('data-id');
        this.deleteCar (id)
      });
    });


    startButton.addEventListener ('click', () => {
      console.log ('START button clicked');
    });

    stopButton.addEventListener ('click', () => {
      console.log ('STOP button clicked');
    });
  }


  async createCarForm (event) {
    event.preventDefault ();
    const {value: name} = document.querySelector ('.garage__text');
    const {value: color} = document.querySelector ('.garage__color');

    const carData = {
      name: name,
      color: color
    };
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify (carData)
    };

    fetch ('http://localhost:3000/garage', options)
      .then (response => {
        if (response.status === 201) {
          return response.json ();
        } else {
          console.error ('Failed to create car:', response.status);
        }
      })
      .catch (error => {
        console.error ('Error creating car:', error);
      });
    this.data = await this.fetchData ('http://localhost:3000/garage?_page=${this.currentPage}&_limit=7');
    this.createCars ()
    await this.init ()
  }

  installationPagination (carCount: number) {
    const paginationCarsCount = document.querySelector ('.pagination__cars');
    const paginationPageCount = document.querySelector ('.pagination__num');

    if (paginationCarsCount && paginationPageCount) {
      paginationCarsCount.textContent = String (carCount);
      paginationPageCount.textContent = String (this.currentPage);
    }
  }

  handlePaginationLeftClick = async () => {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
      const paginationPageCount = document.querySelector ('.pagination__num');
      paginationPageCount.textContent = String (this.currentPage);
      this.data = await this.fetchData (`http://localhost:3000/garage?_page=${this.currentPage}&_limit=7`);
      this.createCars ();
    }
  }

  handlePaginationRightClick = async () => {
    if (this.currentPage < Math.ceil (this.totalCars / 7)) {
      this.currentPage += 1;
      const paginationPageCount = document.querySelector ('.pagination__num');
      paginationPageCount.textContent = String (this.currentPage);
      this.data = await this.fetchData (`http://localhost:3000/garage?_page=${this.currentPage}&_limit=7`);
      this.createCars ();
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
            <div class="pagination_count">
                <button class="pagination__button pagination__button_left"> <<<< </button>
                <div>PAGE:</div>
                <div class="pagination__num">1</div>
                <button class="pagination__button pagination__button_right"> >>>> </button>
                <div>ALL CARS:</div>
                <div class="pagination__cars">${this.totalCars}</div>
            </div>
            <div id="garage__race_count" class="garage__race_count"></div>
        </div>
    `;
    this.init ();
  }

  delete (): void {
    this.app.node.innerHTML = '';
  }
}
