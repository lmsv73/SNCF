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
  villes = null;
  oDepart = null;
  oArrivee = null;
  isDepartValide = false;
  isArriveeValide = false;
  filteredOptions: Observable<string[]>;
  myControl: FormControl = new FormControl();

  constructor(private http: HttpClient) {}

  private _options = {
    headers: new HttpHeaders()
      .append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
      .append('Accept', 'application/json')
      .append('Authorization', 'e382ad1c-a036-441f-8dea-eab80d0e136b')
  };

  getCities(val: string) {
    if(val != "") {
      this.http
        .get("https://api.sncf.com/v1/coverage/sncf/places?q=" + val, this._options)
        .subscribe(res => {
          this.villes = res["places"];

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
      option => option['name'].toLowerCase().indexOf(val.toLowerCase()) === 0 &&
        option['embedded_type'] === "stop_area"
    );
  }

  getDatas() {
    console.log(this.oDepart);
  }

  checkStation(start: string) {
    let from = start == 'D' ? this.depart : this.arrivee;
    start == 'D' ? this.isDepartValide = false : this.isArriveeValide = false;

    if(from != "") {
      this.http
        .get("https://api.sncf.com/v1/coverage/sncf/places?q=" + from, this._options)
        .subscribe(res => {

          res["places"].forEach(element => {
            if(element["name"] == from) {
              console.log(element);
              start == 'D' ? this.oDepart = element : this.oArrivee = element;
              start == 'D' ? this.isDepartValide = true : this.isArriveeValide = true;
            }
          })
        });
    }
  }
}
