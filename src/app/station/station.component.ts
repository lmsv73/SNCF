import {Component} from '@angular/core';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {FormControl} from '@angular/forms';
import {MessageService} from '../message.service';

@Component({
  selector: 'app-station',
  templateUrl: './station.component.html',
  styleUrls: ['./station.component.css']
})
export class StationComponent  {
  depart = null;
  arrivee = null;
  villes = null;
  filteredOptions: Observable<string[]>;
  myControl: FormControl = new FormControl();
  minDate = new Date();
  dateDepart = new Date();
  isDepartValide = false;
  isArriveeValide = false;
  oDepart = null;
  oArrivee = null;

  constructor(
    private http: HttpClient,
    private _messageService: MessageService
  ) {}

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

  filter(val: string): string[] {
    return this.villes.filter(
      option => option['name'].toLowerCase().indexOf(val.toLowerCase()) === 0
    );
  }

  searchJourneys() {
    this._messageService.sentForJourneySearch(
      this.oDepart,
      this.oArrivee,
      this.dateDepart);
  }


  isValidForm() {
    return this.isArriveeValide && this.isDepartValide;
  }
}
