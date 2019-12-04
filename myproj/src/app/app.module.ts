import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppInputComponent } from './app-input/app-input.component';
import { AppResultComponent } from './app-result/app-result.component';
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import {ReactiveFormsModule, FormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import { ChartsModule } from 'ng2-charts';
import { DatePipe } from '@angular/common'
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';

@NgModule({
  declarations: [
    AppComponent,
    AppInputComponent,
    AppResultComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatAutocompleteModule,
    HttpClientModule,
    HttpClientJsonpModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    MatButtonToggleModule,
    ChartsModule,
    NgbModule,
    FormsModule,
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
