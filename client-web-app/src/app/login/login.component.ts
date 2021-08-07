import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {FormControl, Validators} from '@angular/forms';
import { Subject } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  orgname = environment.orgName;
  authInvalid: Subject<boolean> = new Subject();
  authValid: Subject<boolean> = new Subject();
  username = new FormControl('', Validators.required);
  password = new FormControl('', Validators.required);

  constructor(private auth: AuthService, private router: Router) { 
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
      console.log(typeof (resp as any).auth);
      let res = (resp as any).auth;
      if(res === 'false') {
        this.authInvalid.next(true);
        this.authValid.next(false);
      }
      else {
        // if login successful, 
        // login to dash
        localStorage.setItem('username', user);
        localStorage.setItem('password', pass);
        localStorage.setItem('authstring', user+":"+pass);
        this.router.navigateByUrl('/dashboard');
      }   
    });
  }
}
