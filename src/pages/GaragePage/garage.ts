import {Application} from '../../system/app';
import {CarDataType} from "../../models/dataCar";
import {Car} from "../../components/car/car";
import {randomCars} from "../../models/dataRandomCars"


export class Garage {
  app: Application;
  nodeCar: HTMLElement;
  data: CarDataType[];
  totalPages: number;
  totalCars: number;
  currentPage: number;
  createFormHandler: EventListener;
  updateFormHandler: EventListener;
  createRandomCarsHandler: EventListener;
  raceCarsHandler: EventListener;
  resetCarsHandler: EventListener;
  distinctionRacePX: number;
  winnerName: string;
  winnerTime: number


  constructor (app: Application, data: CarDataType[]) {
    this.app = app;
    this.data = data;
    this.totalPages = 1;
    this.totalCars = 0;
    this.currentPage = 1;
    this.createFormHandler = this.createCarForm.bind (this);
    this.updateFormHandler = this.updateCar.bind (this);
    this.createRandomCarsHandler = this.createRandomCars.bind (this);
    this.raceCarsHandler = this.raceAllCars.bind (this);
    this.resetCarsHandler = this.resetAllCars.bind (this);
    this.distinctionRacePX = 0;
    this.winnerName = '';
    this.winnerTime = 100;
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

    const generateCarsButton = document.querySelector ('.garage__buttons_generate')
    const raceCarsButton = document.querySelector ('.garage__buttons_race')
    const resetCarsButton = document.querySelector ('.garage__buttons_reset')

    resetCarsButton.removeEventListener ('click', this.resetCarsHandler);
    resetCarsButton.addEventListener ('click', this.resetCarsHandler)


    raceCarsButton.removeEventListener ('click', this.raceCarsHandler);
    raceCarsButton.addEventListener ('click', this.raceCarsHandler)


    generateCarsButton.removeEventListener ('click', this.createRandomCarsHandler);
    generateCarsButton.addEventListener ('click', this.createRandomCarsHandler)


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


  resetAllCars () {
    const resetButton = document.querySelector ('.garage__buttons_reset')
    const raceCarsButton = document.querySelector ('.garage__buttons_race')
    const winnerModalCount = document.querySelector ('.winner-modal__count')
    const allCarsImg = document.querySelectorAll ('.car__img')
    const allButtonsStart = document.querySelectorAll ('.button__move_start')


    resetButton.classList.add ('garage__buttons_reset-disabled')
    raceCarsButton.classList.remove ('garage__buttons_disabled')
    winnerModalCount.classList.remove ('winner-modal__count_active')

    allCarsImg.forEach (img => {
      img.classList.remove ('car__img_drive')
    })

    allButtonsStart.forEach (but => {
      but.classList.remove ('button__move-disabled')
    })

    this.winnerName = '';
    this.winnerTime = 100;
    this.init ()
  }

////////////////////////////////////////////////////////////////////////////////////


  raceAllCars () {
    const allButtonsStart = document.querySelectorAll ('.button__move_start')
    const allButtonsDrive = document.querySelectorAll ('.button__move_drive')
    const allButtonsStop = document.querySelectorAll ('.button__move_stop')
    const allCarsImg = document.querySelectorAll ('.car__img')
    const raceCarsButton = document.querySelector ('.garage__buttons_race')
    const winnerModalName = document.querySelector ('.winner-modal__name')
    const winnerModalTime = document.querySelector ('.winner-modal__time')
    const winnerModalCount = document.querySelector ('.winner-modal__count')
    const resetButton = document.querySelector ('.garage__buttons_reset')


    raceCarsButton.classList.add ('garage__buttons_disabled')

    allButtonsStart.forEach (but => {
      but.classList.add ('button__move-disabled')
    })

    const element = document.querySelector ('.car__race') as HTMLElement | null;
    let offsetWidth: number | undefined;

    if (element) {
      offsetWidth = element.offsetWidth;
    }
    this.distinctionRacePX = offsetWidth;

    this.data.forEach ((car, index) => {
      const url = `http://localhost:3000/engine?id=${car.id}&status=started`;

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
          const foundCarIndex = this.data.findIndex (el => el.id === car.id);
          this.data[foundCarIndex].velocity = data.velocity;
          this.data[foundCarIndex].distance = data.distance;
          this.data[foundCarIndex].time = this.distinctionRacePX / data.velocity;
          const svgCar: HTMLElement = allCarsImg[index] as HTMLElement;
          svgCar.style.animationDuration = `${this.data[index].time}s`
          svgCar.classList.add ('car__img_drive')

          const urlDrive = `http://localhost:3000/engine?id=${car.id}&status=drive`;

          fetch (urlDrive, {
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
                  svgCar.style.animationPlayState = 'paused'
                  throw new Error ('Car has been stopped suddenly. It\'s engine was broken down.');
                } else {
                  throw new Error ('Network response was not ok');
                }
              }
              return response.json ();
            })
            .then (data => {
              if (car.time < this.winnerTime) {
                this.winnerTime = <number>car.time
                this.winnerName = <string>car.name


                setTimeout (() => {
                  winnerModalName.textContent = this.winnerName
                  winnerModalTime.textContent = `${Math.round (this.winnerTime * 100) / 100}  second`
                  winnerModalCount.classList.add ('winner-modal__count_active')
                  resetButton.classList.remove ('garage__buttons_reset-disabled')
                }, 6000);


                fetch (`http://localhost:3000/winners/${car.id}`)
                  .then (response => {
                    if (response.ok) {
                      return response.json ();
                    }
                    if (response.status === 404) {
                      throw new Error ('Winner not found');
                    }
                    throw new Error ('Failed to get winner');
                  })
                  .then (data => {
                    const winnerChangeWins = data
                    winnerChangeWins.wins++
                    const requestOptions = {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify (winnerChangeWins)
                    };

                    fetch ('http://localhost:3000/winners', requestOptions)
                      .then (response => {
                        if (response.ok) {
                          return response.json ();
                        }
                        throw new Error ('Failed to create winner');
                      })
                  })
                  .catch (error => {
                    const postData = {
                      id: car.id,
                      wins: 1,
                      time: car.time
                    };

                    const requestOptions = {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify (postData)
                    };

                    fetch ('http://localhost:3000/winners', requestOptions)
                      .then (response => {
                        if (response.ok) {
                          return response.json ();
                        }
                        throw new Error ('Failed to create winner');
                      })
                      .then (data => {
                        console.log ('Winner created:', data);
                      })
                      .catch (error => {
                        console.error ('Error creating winner:', error);
                      });
                  });
              }

            })
            .catch (error => {
              console.error (`There was a problem with the fetch operation: ${error.message}`);
            });


        }).catch (error => {
        console.error ('There was a problem with the fetch operation:', error.message);
      });
    })
  }

////////////////////////////////////////////////////////////////////////////////////

  async createRandomCars () {
    for (let i = 0; i < 100; i++) {
      const r = Math.floor (Math.random () * 256);
      const g = Math.floor (Math.random () * 256);
      const b = Math.floor (Math.random () * 256);
      const hexColor = '#' + [r, g, b].map (component => {
        const hex = component.toString (16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join ('');
      const randomIndex = Math.floor (Math.random () * randomCars.length);
      const nameCar = randomCars[randomIndex];
      this.createCarNameColor (nameCar, hexColor)
    }
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

      const nameInputElement = document.querySelector ('.garage__text_update');
      const name = nameInputElement !== null ? (nameInputElement as HTMLInputElement).value : '';

      const colorInputElement = document.querySelector ('.garage__color_update');
      const color = colorInputElement !== null ? (colorInputElement as HTMLInputElement).value : '';

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
      if (carButtonsCountDiv !== null) {
        carButtonsCountDiv.classList.remove ('car_count_active');
      }
      if (updateForm !== null) {
        updateForm.removeEventListener ('submit', submitHandler);
      }
    };
    if (updateForm !== null) {
      updateForm.addEventListener ('submit', submitHandler);
    }
  }

////////////////////////////////////////////////////////////////////////////////////

  async startEngine (event: MouseEvent) {
    const button = event.currentTarget
    const id = +(event.currentTarget as HTMLElement).getAttribute ('data-id')!;
    if (button instanceof Element) {
      button.classList.add ('button__move-disabled');
    }
    const driveElement = button instanceof Element ? button.nextElementSibling : null;
    const stopButton = driveElement ? driveElement.nextElementSibling : null;
    if (stopButton) {
      stopButton.classList.remove ('button__move-disabled');
    }
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
        if (driveElement) {
          driveElement.classList.remove ('button__move-disabled');
        }
        const foundCarIndex = this.data.findIndex (car => car.id === id);
        if (foundCarIndex !== -1) {
          this.data[foundCarIndex].velocity = data.velocity;
          this.data[foundCarIndex].distance = data.distance;
          this.data[foundCarIndex].time = this.distinctionRacePX / data.velocity;

        }
      })
      .catch (error => {
        console.error ('There was a problem with the fetch operation:', error.message);
      });

    const carButtonsCountDiv = button instanceof Element ? button.closest ('.car_count') as HTMLElement : null;
    if (carButtonsCountDiv) {
      this.distinctionRacePX = carButtonsCountDiv.offsetWidth;
    }
  }

  driveCar (event: MouseEvent) {
    const button = event.currentTarget
    const idAttr = (event.currentTarget as HTMLElement).getAttribute ('data-id');
    const id = idAttr ? +idAttr : 0;
    if (button instanceof Element && button.classList) {
      button.classList.add ('button__move-disabled');
    }
    const parentDiv = button instanceof Element ? button.closest ('.car__buttons_count') : null;
    const svgCount = parentDiv ? parentDiv.nextElementSibling : null;
    const svgCar = svgCount?.querySelector ('.car__img') as HTMLElement;
    const currentCar = this.data.find (car => car.id === id)


    if (svgCar) {
      svgCar.style.animationDuration = `${currentCar && currentCar.time ? +currentCar.time : 0}s`;
      svgCar.classList.add ('car__img_drive');
    }

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
            const svgCar = svgCount?.querySelector ('.car__img') as HTMLElement;
            if (svgCar) {
              svgCar.style.animationPlayState = 'paused';
            }
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
  stopCar (event: MouseEvent) {
    const button = event.currentTarget as HTMLElement;
    button.classList.add ('button__move-disabled')
    const driveElement = (button as Element).previousElementSibling;
    let engineButton;
    if (driveElement) {
      engineButton = driveElement.previousElementSibling;
    }
    if (driveElement) {
      driveElement.classList.add ('button__move-disabled');
    }
    if (engineButton) {
      engineButton.classList.remove ('button__move-disabled');
    }
    const button2 = event.target as HTMLElement;
    const parentDiv = button2.closest ('.car__buttons_count');
    const svgCount = parentDiv ? parentDiv.nextElementSibling : null;
    const svgCar = svgCount ? svgCount.querySelector ('.car__img') : null;
    if (svgCar) {
      svgCar.classList.remove ('car__img_drive');
    }
    this.init ()
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
        if (carButtonsCountDiv) {
          carButtonsCountDiv.classList.add ('car_count_active');
        }
        this.updateCar (event)
      });
    });


    removeButton.forEach (el => {
      el.addEventListener ('click', (event) => {
        const id = (event.currentTarget as HTMLElement).getAttribute ('data-id');
        this.deleteCar (id)
      });
    });

    startButton.forEach ((el) => {
      const context = this;
      el.addEventListener ('click', (event: MouseEvent) => {
        context.startEngine (event);
      });
    });


    driveButton.forEach ((el) => {
      if (el instanceof HTMLElement) {
        el.addEventListener ('click', (event: MouseEvent) => {
          this.driveCar (event);
        });
      }
    });

    stopButton.forEach ((el) => {
      if (el instanceof HTMLElement) {
        el.addEventListener ('click', (event: MouseEvent) => {
          this.stopCar (event);
        });
      }
    });

  }


  createCarForm (event: MouseEvent) {
    event.preventDefault ();

    const nameInput = document.querySelector<HTMLInputElement> ('.garage__text');
    const colorInput = document.querySelector<HTMLInputElement> ('.garage__color');
    const name = nameInput ? nameInput.value : '';
    const color = colorInput ? colorInput.value : '';
    this.createCarNameColor (name, color)
  }


  async createCarNameColor (name: string, color: string) {
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

      if (paginationPageCount) {
        paginationPageCount.textContent = String (this.currentPage);

      }
      this.data = await this.fetchData (`http://localhost:3000/garage?_page=${this.currentPage}&_limit=7`);
      this.createCars ();
    }
  }

  handlePaginationRightClick = async () => {
    if (this.currentPage < Math.ceil (this.totalCars / 7)) {
      this.currentPage += 1;
      const paginationPageCount = document.querySelector ('.pagination__num');
      if (paginationPageCount) {
        paginationPageCount.textContent = String (this.currentPage);
      }
      this.data = await this.fetchData (`http://localhost:3000/garage?_page=${this.currentPage}&_limit=7`);
      this.createCars ();
    }
  }


  render (): void {
    if (this.app.node && "innerHTML" in this.app.node) {
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
                <button class="garage__buttons garage__buttons_reset garage__buttons_reset-disabled">RESET</button>
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
            <div class="winner-modal__count">
                <div class="winner-modal__text">Winner</div>
                <div class="winner-modal__text winner-modal__name">${this.winnerName}</div>
                <div class="winner-modal__text winner-modal__time">${this.winnerTime}</div>
            </div>
        </div>
    `;
    }
    this.init ();
  }

  delete (): void {
    if (this.app.node && "innerHTML" in this.app.node) {
      this.app.node.innerHTML = '';
    }
  }
}
