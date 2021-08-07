import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, ObservableInput, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const API_URL = environment.api;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  /**
   * Validate giver username pass
   * 
   * @param {string} username
   * @param {string} password
   * @return {boolean}
   */
  public authenticate(username: string, password: string) {
    return this.http.post(API_URL+"/authenticate", {'username': username, 'password': password} );
  }

}
