import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendBatchComponent } from './send-batch.component';

describe('SendBatchComponent', () => {
  let component: SendBatchComponent;
  let fixture: ComponentFixture<SendBatchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SendBatchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SendBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
