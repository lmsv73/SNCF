import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class FetchDataService {

  constructor(private _http: HttpClient) { }

  private _options = {
    headers: new HttpHeaders()
      .append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
      .append('Accept', 'application/json')
      .append('Authorization', 'e382ad1c-a036-441f-8dea-eab80d0e136b')
  };

  getStations(val: string) {
    return this._http
      .get("https://api.sncf.com/v1/coverage/sncf/places?q=" + val + "&type[]=stop_area", this._options);
  }

  getStopAreas(from: string) {
    return  this._http
      .get("https://api.sncf.com/v1/coverage/sncf/places?q=" + from + "&type[]=stop_area", this._options);
  }

  getJourneys(idDepart: number, idArrivee: string, date: string) {
    return this._http
      .get("https://api.sncf.com/v1/coverage/sncf/journeys?from="+ idDepart + "&to=" + idArrivee  + "&datetime=" + date, this._options);
  }

  getCurrencies() {
    let sr =
      `<soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
          <soap12:Body>
            <GetCurrencies xmlns="http://tempuri.org/" />
          </soap12:Body>
       </soap12:Envelope>`;

    return this._http
      .post("http://currencyconverter.kowabunga.net/converter.asmx", sr,
        {headers: new HttpHeaders().set('Content-Type', 'text/xml'), responseType: 'text'});
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

    return this._http
      .post("http://localhost:8080/SOAP_distance_war_exploded/services/CalculDistance?wsdl", sr,
        {headers: new HttpHeaders().set('Content-Type', 'text/xml'), responseType: 'text'});
  }

  getCurrencyRate(from: string, to: string, date: string) {
    let sr =
      `<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
          <GetConversionRate xmlns="http://tempuri.org/">
            <CurrencyFrom>` + from + `</CurrencyFrom>
            <CurrencyTo>` + to + `</CurrencyTo>
            <RateDate>` + date + `</RateDate>
          </GetConversionRate>
        </soap12:Body>
      </soap12:Envelope>`;

    return this._http
      .post("http://currencyconverter.kowabunga.net/converter.asmx", sr,
        {headers: new HttpHeaders().set('Content-Type', 'text/xml'), responseType: 'text'});
  }
}
