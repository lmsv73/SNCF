import {Component} from '@angular/core';
import {MessageService} from '../message.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';

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

  private _options = {
    headers: new HttpHeaders()
      .append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
      .append('Accept', 'application/json')
      .append('Authorization', 'e382ad1c-a036-441f-8dea-eab80d0e136b')
  };

  constructor(private _messageService: MessageService, private http: HttpClient){
    this._messageService.listen().subscribe((m:any) => {
      this.oDepart = m[0];
      this.oArrivee = m[1];
      this.dateDepart = m[2];
      this.searchJourneys();
    })
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
}
