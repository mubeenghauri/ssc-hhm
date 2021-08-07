import { Component, OnInit, Inject } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api.service';
import { MatTableDataSource } from '@angular/material/table';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  to: string,
  from: string, 
  batchid: string, 
  txid:string,
  dateRec: string
}

export interface transaction {
  id: string,
  batch: string, 
  from: string,
  to: string,
  sent: boolean,
  sentVerified: boolean,
  recievedVerified: boolean,
  recieved: boolean
}

@Component({
  selector: 'app-recieve-batch',
  templateUrl: './recieve-batch.component.html',
  styleUrls: ['./recieve-batch.component.css']
})
export class RecieveBatchComponent implements OnInit {
  constructor(private api: ApiService, public dialog: MatDialog) { }
  displayedColumns: string[] = ['id', 'batch', 'from', 'to', 'sent', 'sentVerified', 'recieved'];
  ORGNAME = environment.orgName;
  dataSource!: MatTableDataSource<transaction>;
  dateRec : string = '';

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
              sent :  true,
              recieved: rec.dateArrival == "N/A" ? false : true,
              sentVerified: rec.senderSignature == "" ? false : true,
              recievedVerified: rec.recieverSignature == "" ? false : true,
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


  openDialog(e: transaction): void {
    console.log(e)
    const dialogRef = this.dialog.open(ReciverDialog, {
      data: {
        dateRec: this.dateRec,
        to: e.to,
        from: e.from,
        batchid: e.batch,
        txid: e.id
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  recieve() {
    // TODO
  }
}


@Component({
  selector: 'reciver-dialog',
  templateUrl: 'dialog.html',
})
export class ReciverDialog {

  constructor(
    public dialogRef: MatDialogRef<ReciverDialog>, 
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public api: ApiService) {}

    recieve() {
      console.log(this.data);
      this.api.recieveBatch(this.data.to, this.data.txid, this.data.batchid, this.data.dateRec)
        .subscribe(res => {
          console.log(res);
        });

    }
}