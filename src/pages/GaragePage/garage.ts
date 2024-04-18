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
  createFormHandler: EventListener;
  updateFormHandler: EventListener;
  distinctionRacePX: number


  constructor (app: Application, data: CarDataType[]) {
    this.app = app;
    this.data = data;
    this.totalPages = 1;
    this.totalCars = 0;
    this.currentPage = 1;
    this.createFormHandler = this.createCarForm.bind (this);
    this.updateFormHandler = this.updateCar.bind (this);
    this.distinctionRacePX = 0


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

    createForm.removeEventListener ('submit', this.createFormHandler);
    createForm.addEventListener ('submit', this.createFormHandler);
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

////////////////////////////////////////////////////////////////////////////////////

  async deleteCar (id) {
    try {
      const response = await fetch (`http://localhost:3000/garage/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
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

////////////////////////////////////////////////////////////////////////////////////

  async updateCar (event) {
    const id = event.currentTarget.getAttribute ('data-id');

    const removeButton = event.target as HTMLElement;
    const carButtonsCountDiv = removeButton.closest ('.car_count');
    const updateForm = document.querySelector ('.garage__form_update');

    const submitHandler = async (event) => {
      event.preventDefault ();
      const {value: name} = document.querySelector ('.garage__text_update');
      const {value: color} = document.querySelector ('.garage__color_update');

      const carUpdate = {
        name: name,
        color: color
      };

      const options = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify (carUpdate)
      };

      try {
        const response = await fetch (`http://localhost:3000/garage/${id}`, options);
        if (response.ok) {
          console.log ('Car successfully updated');
        } else {
          console.error ('Failed to update car:', response.status);
        }
      } catch (error) {
        console.error ('Error updating car:', error);
      }

      this.data = await this.fetchData (`http://localhost:3000/garage?_page=${this.currentPage}&_limit=7`);
      this.createCars ();
      await this.init ();
      carButtonsCountDiv.classList.remove ('car_count_active');
      updateForm.removeEventListener ('submit', submitHandler);
    };
    updateForm.addEventListener ('submit', submitHandler);
  }

////////////////////////////////////////////////////////////////////////////////////

  async startEngine (event) {
    const button = event.currentTarget
    const id = +(event.currentTarget as HTMLElement).getAttribute ('data-id');
    button.classList.add ('button__move-disabled')
    const driveElement = button.nextElementSibling;
    const stopButton = driveElement.nextElementSibling
    stopButton.classList.remove ('button__move-disabled')


    const url = `http://localhost:3000/engine?id=${id}&status=started`;

    fetch (url, {
      method: 'PATCH'
    })
      .then (response => {
        if (!response.ok) {
          throw new Error ('Network response was not ok');
        }
        return response.json ();
      })
      .then (data => {
        driveElement.classList.remove ('button__move-disabled')
        console.log ('Velocity:', data.velocity);
        console.log ('Distance:', data.distance);
        const foundCarIndex = this.data.findIndex (car => car.id === id);
        if (foundCarIndex !== -1) {
          this.data[foundCarIndex].velocity = data.velocity;
          this.data[foundCarIndex].distance = data.distance;
        }
        console.log (this.data)
      })
      .catch (error => {
        console.error ('There was a problem with the fetch operation:', error.message);
      });

    const carButtonsCountDiv = button.closest ('.car_count');
    this.distinctionRacePX = carButtonsCountDiv.offsetWidth;


  }

  driveCar (event) {
    const button = event.currentTarget
    const id = (event.currentTarget as HTMLElement).getAttribute ('data-id');
    button.classList.add ('button__move-disabled')


    const url = `http://localhost:3000/engine?id=${id}&status=drive`;

    fetch (url, {
      method: 'PATCH'
    })
      .then (response => {
        if (!response.ok) {
          if (response.status === 400) {
            throw new Error ('Wrong parameters: "id" should be any positive number, "status" should be "started", "stopped" or "drive"');
          } else if (response.status === 404) {
            throw new Error ('Engine parameters for car with such id was not found in the garage. Have you tried to set engine status to "started" before?');
          } else if (response.status === 429) {
            throw new Error ('Drive already in progress. You can\'t run drive for the same car twice while it\'s not stopped.');
          } else if (response.status === 500) {
            throw new Error ('Car has been stopped suddenly. It\'s engine was broken down.');
          } else {
            throw new Error ('Network response was not ok');
          }
        }
        return response.json ();
      })
      .then (data => {
        console.log (data);
      })
      .catch (error => {
        console.error (`There was a problem with the fetch operation: ${error.message}`);
      });

  }

////////////////////////////////////////////////////////////////////////////////////
  stopCar (event) {
    const button = event.currentTarget
    const id = (event.currentTarget as HTMLElement).getAttribute ('data-id');
    button.classList.add ('button__move-disabled')
    const driveElement = button.previousElementSibling;
    const engineButton = driveElement.previousElementSibling
    driveElement.classList.add ('button__move-disabled')
    engineButton.classList.remove ('button__move-disabled')
  }

////////////////////////////////////////////////////////////////////////////////////
  addEventListenersToCarButtons (car: Car) {
    const selectButton = car.node.querySelectorAll ('.button__select');
    const removeButton = car.node.querySelectorAll ('.button__remove');
    const startButton = car.node.querySelectorAll ('.button__move_start');
    const driveButton = car.node.querySelectorAll ('.button__move_drive');
    const stopButton = car.node.querySelectorAll ('.button__move_stop');

    selectButton.forEach (el => {
      el.addEventListener ('click', (event) => {
        const removeButton = event.target as HTMLElement
        const carButtonsCountDiv = removeButton.closest ('.car_count');
        carButtonsCountDiv.classList.add ('car_count_active')
        const id = (event.currentTarget as HTMLElement).getAttribute ('data-id');
        this.updateCar (event)
      });
    });


    removeButton.forEach (el => {
      el.addEventListener ('click', (event) => {
        const id = (event.currentTarget as HTMLElement).getAttribute ('data-id');
        this.deleteCar (id)
      });
    });


    startButton.forEach (el => {
      el.addEventListener ('click', (event) => {
        this.startEngine (event)
      })
    })

    driveButton.forEach (el => {
      el.addEventListener ('click', (event) => {
        this.driveCar (event)
      })
    })

    stopButton.forEach (el => {
      el.addEventListener ('click', (event) => {
        this.stopCar (event)
      })
    })

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
                <button class="garage__button garage__button_create">Create</button>
            </form>
            <form class="garage__form garage__form_update">
                <input type="text" placeholder="name" class="garage__text garage__text_update">
                <input type="color" id="crete0color" class="garage__color garage__color_update" name="color" value="#e66465" />
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
