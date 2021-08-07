import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-add-batch',
  templateUrl: './add-batch.component.html',
  styleUrls: ['./add-batch.component.css']
})
export class AddBatchComponent implements OnInit {

  batchid = new FormControl('', Validators.required);

  constructor(private api: ApiService) { }

  ngOnInit(): void {
  }

  addBatch() {
    this.api.addBatch(this.batchid.value)
      .subscribe( res => {
        console.log(res);
        alert("Batch added");
      });

  }
}
