import {Component} from '@angular/core';
import {MessageService} from '../message.service';
import {FetchDataService} from '../fetch-data.service';

@Component({
  selector: 'app-journey',
  templateUrl: './journey.component.html',
  styleUrls: ['./journey.component.css']
})

export class JourneyComponent  {
  journeys = null;
  oDepart = null;
  oArrivee = null;
  dateDepart = null;
  sections = null;
  timeDiff = null;
  distance = 0;
  price = 0;
  promises = [];
  currency = 'EUR';
  currenciesList = [];
  selectedCurrency = null;
  error = null;

  constructor(private _messageService: MessageService, private _fetchDataService: FetchDataService){
    this._messageService.listen().subscribe((m:any) => {
      this.oDepart = m[0];
      this.oArrivee = m[1];
      this.dateDepart = m[2];

      this.getCurrencies();
      this.searchJourneys();
    })
  }

  searchJourneys() {
    let time = new Date(this.dateDepart);
    let date = time.getFullYear() + '' + ("0" + (time.getMonth() + 1)).slice(-2) + '' + ("0" + (time.getDate())).slice(-2);

    this.distance = 0;
    this.currency = 'EUR';

    this._fetchDataService.getJourneys(this.oDepart.id, this.oArrivee.id, date)
      .subscribe(res => {
        this.journeys = res['journeys'];
        this.calculDistanceTotal();

        Promise.all(this.promises).then(val => {
          let index = 0;
          let savePoint = 0;

          this.journeys.forEach(elem => {
            let sections = elem.sections;
            for(let i = 0; i < sections.length; i++) {
              if(sections[i].type != "waiting") {
                index++;
              }

              if(sections[i].type == "public_transport") {
                this.price += (val[index - 1] - val[index - 2]) / 1000;
              }
            }

            elem["dist"] = Math.round((val[index - 1] - savePoint) / 1000);
            elem["prix"] = (this.price * 0.21).toFixed(2);

            savePoint = val[index - 1];
            this.price = 0;
          });
          this.promises = []
        });
      });
  }

  secondToDate(sec: number) {
    let h = Math.floor(sec / 3600);
    let m = Math.floor(sec % 3600 / 60);

    let hDisplay = h > 0 ? h + "h" : "";
    let mDisplay = h > 0 ? ( m > 0 ? (m < 10 ? "0" + m : m) : "") : m + ("min");

    return hDisplay + mDisplay;
  }

  compareDate(sections: object, departureIndex: number, arrivalIndex: number) {
    this.sections = sections;
    let departTime = this.parseDate(this.sections[departureIndex].departure_date_time);
    let arriveeTime = this.parseDate(this.sections[arrivalIndex].arrival_date_time);

    this.timeDiff = this.secondToDate(departTime.getTime() / 1000 - arriveeTime.getTime() / 1000);

    return departTime !== arriveeTime;
  }

  parseDate(date: string) {
    let y = parseInt(date.substr(0,4)),
      m = parseInt(date.substr(4,2)),
      d = parseInt(date.substr(6,2)),
      h = parseInt(date.substr(9,2)),
      min = parseInt(date.substr(11,2)),
      s = parseInt(date.substr(13,2))
    ;

    return new Date(y , m, d, h, min, s);
  }

  getDistance(lonA: number, latA: number, lonB: number, latB: number) {
    let promise = new Promise((resolve) => {
      this._fetchDataService.getDistance(lonA, latA, lonB, latB)
        .subscribe(res => {
          let parser = new DOMParser();
          let xml = parser.parseFromString(res, 'text/xml');
          let distance = xml.getElementsByTagName('return')[0].textContent;
          this.distance += parseInt(distance);

          resolve(this.distance);
        });
    });

    this.promises.push(promise);
  }

  calculDistanceTotal() {
    let lonA,latA, lonB, latB;

    this.journeys.forEach(elem => {
      elem.sections.forEach(section => {
        let from = section.from;
        let to = section.to;
        if(section.type != "waiting") {
          latA = from[from.embedded_type].coord.lat;
          lonA = from[from.embedded_type].coord.lon;
          latB = to[to.embedded_type].coord.lat;
          lonB = to[to.embedded_type].coord.lon;

          this.getDistance(lonA, latA, lonB, latB);
        }
      });
    });
  }

  getCurrencies() {
    this._fetchDataService.getCurrencies()
      .subscribe(res => {
        let parser = new DOMParser();
        let xml = parser.parseFromString(res, 'text/xml');
        let listCurrencies = xml.getElementsByTagName('GetCurrenciesResult')[0];
        this.currenciesList.push(listCurrencies.getElementsByTagName('string'));
      });
  }

  convertCurrency() {
    this._fetchDataService.getCurrencyRate(this.currency, this.selectedCurrency, this.formatDate())
      .subscribe(res => {
        this.error = null;

        let parser = new DOMParser();
        let xml = parser.parseFromString(res, 'text/xml');
        let rate = xml.getElementsByTagName('GetConversionRateResult')[0].textContent;

        if(parseFloat(rate) != 0) {
          this.journeys.forEach(elem => {
            elem.prix *= parseFloat(rate);
          });

          this.currency = this.selectedCurrency;
        } else {
          this.error = "Erreur lors de la conversion";
        }
      });
  }

  formatDate() {
    let d = new Date(),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }
}
