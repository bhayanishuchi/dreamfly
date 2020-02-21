import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {MasterComponent} from "./master/master.component";


const routes: Routes = [
  {path: '', component: MasterComponent},
  {path: 'master', component: MasterComponent},
  {path: '**', redirectTo: 'master'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
