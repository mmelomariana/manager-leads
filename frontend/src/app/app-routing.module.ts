import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeadsComponent } from './pages/leads/leads.component';
import { LeadFormComponent } from './pages/lead-form/lead-form.component';
import { LeadDetailComponent } from './pages/lead-detail/lead-detail.component';

const routes: Routes = [
  { path: '', redirectTo: '/leads', pathMatch: 'full' },
  { path: 'leads', component: LeadsComponent },
  { path: 'leads/new', component: LeadFormComponent },
  { path: 'leads/edit/:id', component: LeadFormComponent },
  { path: 'leads/:id', component: LeadDetailComponent },
  { path: '**', redirectTo: '/leads' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }