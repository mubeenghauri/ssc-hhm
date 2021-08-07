import { transition } from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api.service';

export interface transaction {
  id: string,
  batch: string, 
  from: string,
  to: string,
  sent: string,
  sentVerified: string,
  recieved: string
}

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {

  constructor(private api: ApiService) { }
  displayedColumns: string[] = ['id', 'batch', 'from', 'to', 'sent', 'sentVerified', 'recieved'];
  ORGNAME = environment.orgName;
  dataSource!: MatTableDataSource<transaction>;

  ngOnInit(): void {
    document.getElementById('main')!.hidden = true;

    this.loadTransactions();
  }

  loadTransactions() {
    this.api.getTransactions()
      .subscribe( r => {
        let res: any = (r as any).response;
        console.log(res);
        var data = [];
        for(let i = 0; i < res.length; i++) {
          let rec = res[i].Record;
          console.log(rec.from == environment.orgName);
          if(rec.from == environment.orgName || rec.to == environment.orgName ) {
            let t: transaction = {
              id : res[i].Key,
              batch : rec.batchId,
              from : rec.from,
              to : rec.to,
              sent : 'true',
              sentVerified: rec.senderSignature == "" ? "No" : "Yes",
              recieved: rec.dateArrival == "N/A" ? "No" : "Yes",
            }
            data.push(t);
          }
        }
        console.log(data);
        this.dataSource = new MatTableDataSource(data);
        document.getElementById('main')!.hidden = false;
        document.getElementById('spinner')!.hidden = true;
      });
  }

}
