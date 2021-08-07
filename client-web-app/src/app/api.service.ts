import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, ObservableInput, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  API_URL = environment.api;
  authstring : any = localStorage.getItem('authstring') == null ? ' ' : localStorage.getItem('authstring');

  headers = new HttpHeaders()
              .set('authorization', btoa(this.authstring));

  constructor(private http: HttpClient) { }

  public track(batchid: string) {
    return this.http.get(this.API_URL+"/track/"+batchid, {headers: this.headers});
  }
  public getBatches() {
    return this.http.get(this.API_URL+"/batches", {headers: this.headers});
  }

  public getTransactions() {
    return this.http.get(this.API_URL+"/transactions", {headers: this.headers});
  }

  public addBatch(batch: string) {
    return this.http.post(this.API_URL+'/batch', {'batchid': batch}, {headers: this.headers});
  }

  public sendBatch(batch: string, reciever: string, cost: string, date: string) {
    let payload : any = {
      'batchid': batch,
      'cost': cost,
      'reciever': reciever,
      'departureDate': date
    };
    return this.http.post(this.API_URL+'/send-batch', payload, {headers: this.headers});
  }

  public recieveBatch(reciever: string, trxid: string, batchid: string, date: string) {
    let payload : any = {
      'batchid': batchid,
      'trxid': trxid,
      'date': date,
      'reciever': reciever
    };
    return this.http.post(this.API_URL+'/recieve-batch', payload, {headers: this.headers});
  }
}
