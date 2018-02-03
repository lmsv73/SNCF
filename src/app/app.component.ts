import {Component, ViewEncapsulation} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators/map';
import {Observable} from 'rxjs/Observable';
import {FormControl} from '@angular/forms';
import {startWith} from 'rxjs/operators/startWith';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class AppComponent {
  depart = null;
  arrivee = null;
  minDate = new Date();
  dateDepart = new Date();
  villes = null;
  oDepart = null;
  oArrivee = null;
  isDepartValide = false;
  isArriveeValide = false;
  journeys = null;
  filteredOptions: Observable<string[]>;
  myControl: FormControl = new FormControl();


  constructor(private http: HttpClient) {}

  private _options = {
    headers: new HttpHeaders()
      .append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
      .append('Accept', 'application/json')
      .append('Authorization', 'e382ad1c-a036-441f-8dea-eab80d0e136b')
  };

  searchStations(val: string) {
    if(val != "") {
      this.http
        .get("https://api.sncf.com/v1/coverage/sncf/places?q=" + val + "&type[]=stop_area", this._options)
        .subscribe(res => {
          this.villes = res['places'];

          if(typeof this.villes !== "undefined") {
            this.filteredOptions = this.myControl.valueChanges
              .pipe(
                startWith(''),
                map(val => this.filter(val))
              );
          }
        });
    } else {
      this.villes = [];
    }
  }

  filter(val: string): string[] {
    return this.villes.filter(
      option => option['name'].toLowerCase().indexOf(val.toLowerCase()) === 0
    );
  }

  checkStation(start: string) {
    let from = start == 'D' ? this.depart : this.arrivee;
    start == 'D' ? this.isDepartValide = false : this.isArriveeValide = false;

    if(from != "" && from != null) {
      this.http
        .get("https://api.sncf.com/v1/coverage/sncf/places?q=" + from + "&type[]=stop_area", this._options)
        .subscribe(res => {

          res["places"].forEach(element => {
            if(element['name'] == from) {
              start == 'D' ? this.oDepart = element : this.oArrivee = element;
              start == 'D' ? this.isDepartValide = true : this.isArriveeValide = true;
            }
          })
        });
    }
  }

  isValidForm() {
    return this.isArriveeValide && this.isDepartValide;
  }

  searchJourneys() {
    let lonA = this.oDepart.stop_area.coord.lon;
    let latA = this.oDepart.stop_area.coord.lat;
    let lonB = this.oArrivee.stop_area.coord.lon;
    let latB = this.oArrivee.stop_area.coord.lat;
    let date = this.dateDepart.toISOString();

    this.http
      .get("https://api.sncf.com/v1/coverage/sncf/journeys?from="+ lonA + ";" + latA + "&to=" + lonB + ";" + latB + "&datetime=" + date, this._options)
      .subscribe(res => {
        this.journeys = res['journeys'];
        console.log(this.journeys);
      });
  }

  secondToDate(sec: number) {
    let h = Math.floor(sec / 3600);
    let m = Math.floor(sec % 3600 / 60);

    let hDisplay = h > 0 ? h + "h" : "";
    let mDisplay = h > 0 ? ( m > 0 ? (m < 10 ? "0" + m : m) : "") : m + ("min");

    return hDisplay + mDisplay;
  }
}
