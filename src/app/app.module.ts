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
import {FetchDataService} from './fetch-data.service';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import {environment} from '../environments/environment';
import {Routes, RouterModule} from "@angular/router";
import {SearchComponent} from './search/search.component';
import {AdminComponent} from './admin/admin.component';

const routes: Routes = [
  { path: '', component: SearchComponent },
  { path: 'search', component: AdminComponent },
  {path: '**', component: SearchComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    StationComponent,
    JourneyComponent,
    SearchComponent,
    AdminComponent,
    FilterTypePipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MaterialModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    RouterModule.forRoot(routes, {useHash: true})
  ],
  providers: [
    MessageService,
    FetchDataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
