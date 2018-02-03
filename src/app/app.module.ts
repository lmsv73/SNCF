import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import {StationComponent} from './station/station.component';
import {JourneyComponent} from './journey/journey.component';
import {MessageService} from './message.service';
import {FilterTypePipe} from './filter-type.pipe';

@NgModule({
  declarations: [
    AppComponent,
    StationComponent,
    JourneyComponent,
    FilterTypePipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MaterialModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [MessageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
