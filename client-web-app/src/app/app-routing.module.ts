import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/**
 * SSC app components
 */
import { AddBatchComponent } from './add-batch/add-batch.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ListBatchComponent } from './list-batch/list-batch.component';
import { LoginComponent  } from './login/login.component';
import { RecieveBatchComponent } from './recieve-batch/recieve-batch.component';
import { SendBatchComponent } from './send-batch/send-batch.component';
import { TrackComponent } from './track/track.component';
import { TransactionsComponent } from './transactions/transactions.component';

const routes: Routes = [
  {
    path : 'login', component: LoginComponent 
  },
  {
    path : 'dashboard', component: DashboardComponent
  },
  {
    path : 'batches', component: ListBatchComponent
  },
  {
    path : 'batch', component: AddBatchComponent
  },
  {
    path : 'send-batch', component: SendBatchComponent
  },
  {
    path : 'recieve-batch', component: RecieveBatchComponent,

  },
  {
    path : 'orders', component: TransactionsComponent
  },
  {
    path: 'track', component: TrackComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
