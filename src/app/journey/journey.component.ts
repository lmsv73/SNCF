import {Component} from '@angular/core';
import {MessageService} from '../message.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Component({
  selector: 'app-journey',
  templateUrl: './journey.component.html',
  styleUrls: ['./journey.component.css']
})
export class JourneyComponent {
  journeys = null;
  oDepart = null;
  oArrivee = null;
  dateDepart = null;

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
