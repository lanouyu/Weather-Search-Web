import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-app-result',
  templateUrl: './app-result.component.html',
  styleUrls: ['./app-result.component.css']
})
export class AppResultComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  @Input('street') street: string;
  @Input('city') city: string;
  @Input('state') state: string;
  @Input('cur') cur: boolean;
}
