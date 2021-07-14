import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, ObservableInput, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

const API_URL = 'http://localhost:8001/manufacturer';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  // private handleError(in: HttpErrorResponse): boolean {
  //   console.log('s');
  //   return false;
  // }

  /**
   * Validate giver username pass
   * 
   * @param {string} username
   * @param {string} password
   * @return {boolean}
   */
  public authenticate(username: string, password: string)  {

    let res;

    return this.http.post(API_URL+"/authenticate", {'username': username, 'password': password} )
    
  }

}
