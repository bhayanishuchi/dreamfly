import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MasterComponent } from './master/master.component';
import {AppRoutingModule} from "./app-routing.module";
import {HeaderComponent} from "./header/header.component";
import { CalendarModule, DateAdapter } from 'angular-calendar';
import {FormsModule} from "@angular/forms";
import {CommonModule, DatePipe} from '@angular/common';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
// import {CalendarDatePipe} from "./calendarDate.pipe";

import { DragAndDropModule } from 'angular-draggable-droppable';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {DxDateBoxModule, DxSwitchModule} from "devextreme-angular";
import {HttpClientModule} from '@angular/common/http';
import {CalendarService} from './service/calendar.service';

@NgModule({
  declarations: [
    AppComponent,
    MasterComponent,
    HeaderComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    DragAndDropModule,
    DxDateBoxModule,
    DxSwitchModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
  ],
  providers: [CalendarService, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
