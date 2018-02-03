import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators/map';
import {Observable} from 'rxjs/Observable';
import {FormControl} from '@angular/forms';
import {startWith} from 'rxjs/operators/startWith';

class Villes {
  depart: Array<string>;
  arrivee: Array<string>;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class AppComponent implements OnInit {
  depart = null;
  arrivee = null;
  villes = new Villes;
  filteredOptions: Observable<string[]>;
  myControl: FormControl = new FormControl();

  constructor(private http: HttpClient) {}

  private _options = {
    headers: new HttpHeaders()
      .append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
      .append('Accept', 'application/json')
      .append('Authorization', 'e382ad1c-a036-441f-8dea-eab80d0e136b')
  };

  ngOnInit() {
    this.villes.depart = [];
    this.villes.arrivee = [];
  }

  getCities(val: string, start: string) {
    if(val != "") {
      this.http
        .get("https://api.sncf.com/v1/coverage/sncf/places?q=" + val, this._options)
        .subscribe(res => {
          start == 'a' ? this.villes.arrivee = res["places"] : this.villes.depart = res["places"];

          this.filteredOptions = this.myControl.valueChanges
            .pipe(
              startWith(''),
              map(val => this.filter(val, start))
            );
        });
    } else {
      start == 'a' ? this.villes.arrivee = [] : this.villes.depart = [];
    }
  }

  filter(val: string, start: string): string[] {
    if(start == 'a')
      return this.villes.arrivee.filter(option => option['name'].toLowerCase().indexOf(val.toLowerCase()) === 0);
    else
      return this.villes.depart.filter(option => option['name'].toLowerCase().indexOf(val.toLowerCase()) === 0);
  }

  getDatas() {
    console.log(this.depart);
  }
}
