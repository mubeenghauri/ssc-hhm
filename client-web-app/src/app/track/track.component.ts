import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.css']
})
export class TrackComponent implements OnInit {
  batchid = new FormControl('', Validators.required);

  constructor(private api: ApiService) { }

  ngOnInit(): void {
  }

  track() {
    this.api.track(this.batchid.value)
      .subscribe( res => {
        console.log(res);
        alert("Batch track : "+JSON.stringify((res as any).response));
      });

  }
}
