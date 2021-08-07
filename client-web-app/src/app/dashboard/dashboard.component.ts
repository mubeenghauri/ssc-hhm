import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  orgname = environment.orgName;
  actions = environment.actions; 


  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  navigate(url: string) {
    this.router.navigateByUrl(url);
  }

}
