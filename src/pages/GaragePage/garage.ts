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


  async init () {
    this.nodeCar = document.getElementById ('garage__race_count');
    const paginationPageCount = document.querySelector ('.pagination__num');
    const paginationButtonLeft = document.querySelector ('.pagination__button_left')
    const paginationButtonRight = document.querySelector ('.pagination__button_right')
    const createForm = document.querySelector ('.garage__form')

    this.data = await this.fetchData (`http://localhost:3000/garage?_page=${this.currentPage}&_limit=5`);
    this.totalCars = (await this.fetchData ('http://localhost:3000/garage')).length;

    this.installationPagination (this.totalCars)

    this.createCars ()


    createForm.addEventListener ('submit', (event) => {
      this.createCarForm (event)
    })

    paginationButtonLeft.addEventListener ('click', async () => {
      if (this.currentPage > 1) {
        this.currentPage -= 1
        paginationPageCount.textContent = String (this.currentPage)
        this.data = await this.fetchData (`http://localhost:3000/garage?_page=${this.currentPage}&_limit=5`);
        this.createCars()
      }
    })
    paginationButtonRight.addEventListener
    ('click', async () => {
      if (this.currentPage < Math.ceil (this.totalCars / 5)) {
        this.currentPage += 1
        paginationPageCount.textContent = String (this.currentPage)
        this.data = await this.fetchData (`http://localhost:3000/garage?_page=${this.currentPage}&_limit=5`);
        this.createCars()
      }
    })

    // function changeColor (value) {
    //   const inputField = document.getElementById ('inputField');
    //   inputField.style.color = value;
    // }
  }

  createCars () {
    this.nodeCar.innerHTML = '';
    this.data.map (
      (el: CarDataType) => {
        const element: Car = new Car (this, el, this.nodeCar);
        element.render ();
        return element;
      }
    );
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
      .then (data => {
        console.log ('New car created:', data);
      })
      .catch (error => {
        console.error ('Error creating car:', error);
      });
    this.data = await this.fetchData ('http://localhost:3000/garage?_page=${this.currentPage}&_limit=5');
    this.createCars()
    await this.init ()

  }

  installationPagination (carCount: number) {
    const paginationCarsCount = document.querySelector ('.pagination__cars');
    const paginationPageCount = document.querySelector ('.pagination__num');

    if (paginationCarsCount && paginationPageCount) {
      paginationCarsCount.textContent = String (carCount);
      paginationPageCount.textContent = '1';
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
