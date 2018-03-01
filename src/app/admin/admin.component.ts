import { Component } from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent   {
  journeys: any[];
  timeDiff = null;

  constructor(fdb: AngularFireDatabase) {
    fdb.list('journey').valueChanges().subscribe(res => {
        this.journeys = res;
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

    let departTime = this.parseDate(sections[departureIndex].departure_date_time);
    let arriveeTime = this.parseDate(sections[arrivalIndex].arrival_date_time);

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
}
