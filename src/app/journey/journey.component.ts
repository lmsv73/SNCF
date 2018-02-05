import {Component} from '@angular/core';
import {MessageService} from '../message.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {xml2json} from 'xml-js';

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

    let time = new Date(this.dateDepart);
    let date = time.getFullYear() + '' + ("0" + (time.getMonth() + 1)).slice(-2) + '' + ("0" + (time.getDate())).slice(-2);

    this.distance = 0;

    this.http
      .get("https://api.sncf.com/v1/coverage/sncf/journeys?from="+ this.oDepart.id + "&to=" + this.oArrivee.id  + "&datetime=" + date, this._options)
      .subscribe(res => {
        this.journeys = res['journeys'];
        this.calculDistanceTotal();

        Promise.all(this.promises).then(val => {
          let index = 0;
          let savePoint = 0;
          console.log(val);
          this.journeys.forEach(elem => {
            let sections = elem.sections;
            for(let i = 0; i < sections.length; i++) {
              if(sections[i].type != "waiting") {
                index++;
              }

              if(sections[i].type == "public_transport") {
                console.log(index);
                this.price += (val[index - 1] - val[index - 2]) / 1000;
              }
            }

            elem["dist"] = Math.round((val[index - 1] - savePoint) / 1000);
            elem["prix_1"] = (this.price * 0.21).toFixed(2);
            elem["prix_2"] = (this.price * 0.18).toFixed(2);
            console.log(elem);
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
    let sr =
      `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:exam="http://example/">
          <soapenv:Header/>
          <soapenv:Body>
             <exam:calculDistance> 
                <arg0>`+ latA +`</arg0>
                <arg1>`+ lonA +`</arg1>
                <arg2>`+ latB +`</arg2>
                <arg3>`+ lonB +`</arg3>
             </exam:calculDistance>
          </soapenv:Body>
       </soapenv:Envelope>`;

    let promise = new Promise((resolve) => {
      this.http
        .post("http://localhost:8080/SOAP_distance_war_exploded/services/CalculDistance?wsdl", sr,
          {headers: new HttpHeaders().set('Content-Type', 'text/xml'), responseType: 'text'})
        .subscribe(res => {
          let json = xml2json(res);
          let parse = JSON.parse(json).elements[0].elements[0].elements[0].elements[0].elements[0].text;
          this.distance += parseInt(parse);

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
}
