import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api.service';

export interface batch {
  name: string
}

@Component({
  selector: 'app-list-batch',
  templateUrl: './list-batch.component.html',
  styleUrls: ['./list-batch.component.css']
})
export class ListBatchComponent implements OnInit {

  constructor(private api: ApiService) { }

  dataSource!: MatTableDataSource<batch>;
  displayedColumns: string[] = ['name'];

  ngOnInit(): void {
    document.getElementById('main')!.hidden = true;
    // $("#main").hide();
    let d = this.getBatches();
    // console.log(d);    
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
        this.dataSource = new MatTableDataSource( data);
        document.getElementById('main')!.hidden = false;
        document.getElementById('spinner')!.hidden = true;
    
      });

  }

}
