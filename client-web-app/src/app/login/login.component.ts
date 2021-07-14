import { Component, OnInit } from '@angular/core';
// import {FormControl} from "@angular/forms";
import {FormControl, Validators} from '@angular/forms';
import { Subject } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  orgname = 'Manufacturer';
  authInvalid: Subject<boolean> = new Subject();
  authValid: Subject<boolean> = new Subject();
  username = new FormControl('', Validators.required);
  password = new FormControl('', Validators.required);

  constructor(private auth: AuthService) { 
    this.authInvalid.next(true);
    this.authValid.next(false);
  }

  ngOnInit(): void {
  }

  login() {
    console.log(`username ${this.username.value}`);
    console.log(`password ${this.password.value}`);

    let user = this.username.value;
    let pass = this.password.value;

    // console.log(this.auth.authenticate(user, pass))
    this.auth.authenticate(user, pass) 
    .subscribe( resp  => {
      // catchError(this.handleError);
      console.log((resp as any).auth);
      let res = (resp as any).auth;
      if(res == false) {
        this.authInvalid.next(true);
        this.authValid.next(false);
      }
      else {
        this.authInvalid.next(false);
        this.authValid.next(true);
      }   
      return res;
    });
  }
}
