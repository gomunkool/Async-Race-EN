import {Application} from '../../system/app';
import {CarDataType} from "../../models/dataCar";
import {Winner} from "../../components/winner/winner";


export class Winners {
  app: Application;
  nodeWinner!: HTMLElement;
  data: CarDataType[];
  dataWinners: CarDataType[];


  constructor (app: Application, data: CarDataType[], dataWinners: CarDataType[] = []) {
    this.app = app;
    this.data = data;
    this.dataWinners = dataWinners

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
    this.nodeWinner = document.querySelector ('.winner__car_count')!;

    try {
      const [winnersData, garageData] = await Promise.all ([
        this.fetchData (`http://localhost:3000/winners?_page=${1}&_limit=10`),
        this.fetchData (`http://localhost:3000/garage`)
      ]);
      this.dataWinners = winnersData;
      this.data = garageData;
      this.dataWinners.map(car1 => {
        const matchingObj = this.data.find(car2 => car2.id === car1.id);
        if (matchingObj) {
          car1.name = matchingObj.name;
          car1.color = matchingObj.color;
        } else {
          car1.name = '';
          car1.color = '';
        }
        return car1;
      });

    } catch (error) {
      console.error ('Error initializing:', error);
    }

    this.createWinners ()
  }

  createWinners () {
    this.nodeWinner.innerHTML = '';
    this.dataWinners.map (
      (el: CarDataType, index) => {
        const element: Winner = new Winner (this, el, this.nodeWinner, index);
        element.render ();
        return element;
      }
    );
  }


  render (): void {
    if (this.app.node && "innerHTML" in this.app.node) {
      this.app.node.innerHTML = `
        <div class="main-winners">
            <h2 class="winners__title">Winners</h2>
            <div class="pagination_count">
                <button class="pagination__button pagination__button_left"> <<<< </button>
                <div>PAGE:</div>
                <div class="pagination__num">1</div>
                <button class="pagination__button pagination__button_right"> >>>> </button>
                <div>ALL CARS:</div>
                <div class="pagination__cars">${1}</div>
            </div>
            <div class="winners_count">
                <div class="winners__title_count">
                    <div class="winners__title_item winners__title_number">NUMBER</div>
                    <div class="winners__title_item winners__title_car">CAR</div>
                    <div class="winners__title_item winners__title_name">NAME</div>
                    <div class="winners__title_item winners__title_wins">WINS</div>
                    <div class="winners__title_item winners__title_best">BEST</div>
                </div>
                <div class="winner__car_count"></div>
            </div>
</div>
    `;
    }
    this.init ();
  }

  delete (): void {
    if (this.app.node) {
      this.app.node.innerHTML = '';
    }
  }
}
