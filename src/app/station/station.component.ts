import {Component} from '@angular/core';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';
import {Observable} from 'rxjs/Observable';
import {FormControl} from '@angular/forms';
import {MessageService} from '../message.service';
import {Subject} from 'rxjs/Subject';
import "rxjs/Rx";
import {FetchDataService} from '../fetch-data.service';

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
  departureChanged: Subject<string> = new Subject<string>();
  arrivalChanged: Subject<string> = new Subject<string>();

  constructor(
    private _fetchDataService: FetchDataService,
    private _messageService: MessageService) {
      this.departureChanged
        .debounceTime(1000)
        .distinctUntilChanged()
        .subscribe(model => {
          this.depart = model;
          this.searchStations(this.depart);
        });

      this.arrivalChanged
        .debounceTime(1000)
        .distinctUntilChanged()
        .subscribe(model => {
          this.arrivee = model;
          this.searchStations(this.arrivee);
        });
  }

  searchStations(val: string) {
    if(val != "") {
      this._fetchDataService.getStations(val)
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
      this._fetchDataService.getStopAreas(from)
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

  onDepartChange(query:string){
    this.departureChanged.next(query);
  }

  onArrivalChange(query:string){
    this.arrivalChanged.next(query);
  }
}
