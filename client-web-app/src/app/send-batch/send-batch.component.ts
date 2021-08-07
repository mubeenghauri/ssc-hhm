import { Component, OnInit } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api.service';
import { DateAdapter } from '@angular/material/core';

export interface batch {
  name: string
}

@Component({
  selector: 'app-send-batch',
  templateUrl: './send-batch.component.html',
  styleUrls: ['./send-batch.component.css']
})
export class SendBatchComponent implements OnInit {

  batches: batch[] = [];
  
  recievers = [
    {name: 'Supplier'},
    {name: 'Retailer'},
  ];

  selectedBatch: string;
  selectedReciever: string;
  cost = new FormControl('', Validators.required);
  departureDate: string;

  constructor(private api: ApiService) { 
    this.selectedBatch = '';
    this.selectedReciever = '';
    this.departureDate = '';
  }

  ngOnInit(): void {
    document.getElementById('main')!.hidden = true;
    this.getBatches();
  }

  getBatches() {

    let batches;
    this.api.getBatches()
      .subscribe( res => {
        res = (res as any).response;
        console.log(res);
        let data = [];
        for(let i = 0; i < (res as any).length; i++) {
          // let data = this.dataSource.data;
          let obj : any = (res as any)[i];
          if (obj.Record.owner == environment.orgName) {
            let b : batch = {name: obj.Key};
            data.push(b);
          }
        }
        console.log(data);
        this.batches = data;
        document.getElementById('main')!.hidden = false;
        document.getElementById('spinner')!.hidden = true;
      });
  }

  send() {
    console.log(this.cost.value);
    console.log(this.departureDate);
    console.log(this.selectedReciever);
    console.log(this.selectedBatch);

    this.api.sendBatch(this.selectedBatch,  this.selectedReciever, this.cost.value, this.departureDate)
      .subscribe( res => {
        console.log(res);
        alert("Batch sent !!\n ");
      });
  }
}
