import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecieveBatchComponent } from './recieve-batch.component';

describe('RecieveBatchComponent', () => {
  let component: RecieveBatchComponent;
  let fixture: ComponentFixture<RecieveBatchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecieveBatchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecieveBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
