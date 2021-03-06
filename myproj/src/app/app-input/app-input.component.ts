import {Component, ElementRef, EventEmitter, OnInit, Output, TemplateRef, ViewChild, Inject, Injectable } from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import { environment } from '../../environments/environment';
import {FormGroup, FormControl, Validators, FormsModule} from '@angular/forms';
import {Observable} from "rxjs";
import {Config} from "protractor";
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import * as CanvasJS from './canvasjs.min';
import {DatePipe} from "@angular/common";
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import {min} from "rxjs/operators";

@Component({
  selector: 'app-app-input',
  templateUrl: './app-input.component.html',
  styleUrls: ['./app-input.component.css']
})
export class AppInputComponent implements OnInit {

  constructor(public http: HttpClient,
              public datepipe: DatePipe,
              public modalService: NgbModal,
              @Inject(LOCAL_STORAGE) private storage: StorageService) { }

  ngOnInit() {
    this.inputForm.valueChanges.subscribe(v => this.checkFormValid());
    this.inputForm.get('inputCity').valueChanges.subscribe(v => this.showAutoCities(v));
    console.log("window.innerWidth", window.innerWidth);
  }

  public inputForm = new FormGroup({
      inputStreet: new FormControl('',[Validators.required,]),
      inputCity: new FormControl('',[Validators.required,]),
      inputState: new FormControl('',[Validators.required,]),
      inputCheckBox: new FormControl('',[]),
    }
  );
  public inputFormValid = false;
  public inputCheckBoxChecked = false;
  public btnSltCls = "btn ml-lg-3 ml-3 selected_button";
  public btnUstCls = "btn ml-lg-3 ml-3 unselected_button";
  public btnResCls = this.btnSltCls;
  public btnFavCls = this.btnUstCls;
  public btnStarIcon = "star_border";
  public showResults = true;
  public showFavorites = false;
  public submitted = false;
  public loaded = false;
  public inputInvalid = false;
  public get inputStreet() { return this.inputForm.get('inputStreet'); }
  public get inputCity() { return this.inputForm.get('inputCity'); }
  public get inputState() { return this.inputForm.get('inputState'); }
  public get inputCheckBox() { return this.inputForm.get('inputCheckBox'); }
  public get ButtonSearch() { return this.inputForm.get('ButtonSearch'); }

  // change the checkbox status
  public changeInputCheckBox() {
    this.inputCheckBoxChecked = !this.inputCheckBoxChecked;
    this.checkFormValid();
    this.inputInvalid = false;
    this.submitted = false;
    // this.clearForm();
    if (this.inputCheckBoxChecked) {
      this.disableForm();
      this.getCurLocation();
    } else {
      this.enableForm();
    }
    console.log("inputCheckBoxChecked", this.inputCheckBoxChecked);
  }

  // clear form
  public defaultStateVal = "default";
  public defaultState = "default";
  public clearForm() {
    this.inputStreet.reset("");
    this.inputCity.reset("");
    this.inputState.reset("default");
    this.inputCheckBoxChecked = false;
    this.inputCheckBox.setValue(false);
    this.enableForm();
    this.submitted = false;
    this.loaded = false;
    this.inputInvalid = false;
    this.clickBtnRes();
    this.clearTabSelection();

    console.log("clearForm");
  }
  // clear tab selection
  activeTab = "current";
  public clearTabSelection() {
    this.activeTab = "current";
    console.log("clear activeTab as", this.activeTab);
  }
  public searchTab(tab) {
    this.activeTab = tab;
    console.log("change activeTab as", this.activeTab);
    if (tab == 'weekly') {
      this.loadWeeklyChart();
      console.log("this.weeklychart.render();");
    } else if (tab == 'hourly') {
      this.initHourChart();
    }
  }

  // disable form
  public disableForm() {
    this.inputStreet.disable();
    this.inputCity.disable();
    this.inputState.disable();
    console.log("disableForm");
  }

  // enable form
  public enableForm() {
    this.inputStreet.enable();
    this.inputCity.enable();
    this.inputState.enable();
    console.log("enableForm");
  }

  // check the form validation
  private checkFormValid() {
    if (this.inputCheckBoxChecked) {
      this.inputFormValid = true;
    } else if (this.inputStreet.value != null && this.inputCity.value != null
      && this.inputStreet.value.length > 0 && this.inputCity.value.length > 0
      && this.inputState.value != this.defaultStateVal){
      this.inputFormValid = true;
    } else {
      this.inputFormValid = false;
    }
    console.log("this.inputStreet.value != null && this.inputCity.value != null\n" +
      "      && this.inputStreet.value.length > 0 && this.inputCity.value.length > 0\n" +
      "      && this.inputState.value != this.defaultStateVal", this.inputStreet.value != null, this.inputCity.value != null,
      this.inputStreet.value.length > 0, this.inputCity.value.length > 0,
      this.inputState.value != this.defaultStateVal, this.inputState.value, this.defaultStateVal);
    console.log("inputFormValid", this.inputFormValid);
  }

  // city autocomplete
  public autoCities: string[] = [];
  private showAutoCities(input: string)  {
    let configUrl: string = environment.serverURL + "/cityauto?input=" + input;
    console.log(configUrl);
    this.http.get(configUrl).subscribe(value => {
      this.autoCities = [];
      if ('predictions' in value) {
        let pred = <Array<any>>value['predictions'];
        console.log(pred, pred.length);
        for (let i = 0; i < 5 && i < pred.length; ++i) {
          this.autoCities.push(pred[i]['structured_formatting']['main_text']);
        }
      }
    });
  }

  // click on button results
  public clickBtnRes() {
    this.btnResCls = this.btnSltCls;
    this.btnFavCls = this.btnUstCls;
    this.showResults = true;
    this.showFavorites = false;
    this.checkBtnStar();
  }

  // click on button results
  favContent = [];
  public clickBtnFav() {
    console.log("local storage", this.storage);
    this.btnResCls = this.btnUstCls;
    this.btnFavCls = this.btnSltCls;
    this.showResults = false;
    this.showFavorites = true;
    this.syncStorage();
    console.log("showFavorites", this.showFavorites);
  }

  // click on button search
  public async clickSearch() {
    this.submitted = true;
    this.loaded = false;
    this.showResults = true;
    this.showFavorites = false;
    this.clickBtnRes();
    this.activeTab = "current";
    await this.getLocation();
    await this.getWeather();
  }

  // get location
  street = ""; city = ""; state = ""; lat = ""; lng = "";
  public async getLocation() {
    if (!this.inputCheckBoxChecked) {
      this.street = this.inputStreet.value;
      this.city = this.inputCity.value;
      this.state = this.inputState.value;

      const data = this.getSearchLocation();
      await data.then(value => this.getSearchLocationCallback(value));
    }
  }

  public async getSearchLocation() {
    let configUrl: string = environment.serverURL + "/search/geocode?street=" + this.street + "&city=" + this.city + "&state=" + this.state;
    console.log(configUrl);
    let res = await fetch(configUrl, {
      method: "GET",
      mode: 'cors',
      cache: 'no-cache',
      credentials: "same-origin",
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: "follow",
      referrer: "no-referrer",
    });
    return await res.json();
  }
  public async getSearchLocationCallback(value: any) {
    console.log(value);
    if (value == "Not Found" || !value.hasOwnProperty('results') || value['status'] == "ZERO_RESULTS") {
      this.inputInvalid = true;
    } else {
      this.inputInvalid = false;
      this.lat = value['results'][0]['geometry']['location']['lat'];
      this.lng = value['results'][0]['geometry']['location']['lng'];
      console.log("getSearchLocationCallback", this.city, this.state, this.lat, this.lng);
    }
  }

  // get current location
  // public getCurLocation() {
  //   this.inputInvalid = false;
  //   var xmlhttp = new XMLHttpRequest();
  //   xmlhttp.open("GET", "http://ip-api.com/json", true);
  //   xmlhttp.send();
  //   var value = JSON.parse(xmlhttp.responseText);
  //   console.log(value);
  //   this.city = value['city'];
  //   this.state = value['region'];
  //   this.lat = value['lat'];
  //   this.lng = value['lon'];
  //   console.log("out", this.city, this.state, this.lat, this.lng);
  // }
  public async getCurLocation() {
      this.inputInvalid = false;
      const url = "http://ip-api.com/json";
      let res = await fetch(url);
      res.json().then(res => this.getCurLocationCallback(res));
  }
  public getCurLocationCallback(value) {
    this.city = value['city'];
    this.state = value['region'];
    this.lat = value['lat'];
    this.lng = value['lon'];
    console.log("out", this.city, this.state, this.lat, this.lng);
  }

  // get weather info
  timezone; curTemp; curSum;
  curhum; curprs; curwid; curvib; curcld; curozo;
  sealImg = "";
  weekData = [];
  hourTemp = []; hourPres = []; hourHumd = []; hourOzon = []; hourVisb = []; hourWind = [];
  hourTime = [];
  TweetText = "https://twitter.com/intent/tweet?text=";
  public getWeather() {
    if (this.inputInvalid) return;

    const seal = this.getStateSeal();
    seal.then(value => this.getStateSealCallback(value));

    const data = this.getWeatherData();
    data.then(value => this.getWeatherDataCallback(value));

    this.showWeatherResult();
  }
  public async getWeatherData() {
    let configUrl: string = environment.serverURL + "/search/weather?lat=" + this.lat + "&lng=" + this.lng;
    console.log(configUrl);
    let res = await fetch(configUrl, {
      method: "GET",
      mode: 'cors',
      cache: 'no-cache',
      credentials: "same-origin",
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: "follow",
      referrer: "no-referrer",
    });
    return await res.json();
  }
  public getWeatherDataCallback(value: any) {
    console.log(value);
    this.timezone = value['timezone'];
    this.curTemp = Math.round(value['currently']['temperature']);
    this.curSum = value['currently']['summary'];
    this.curhum = value['currently']['humidity'];
    this.curprs = value['currently']['pressure'];
    this.curwid = value['currently']['windSpeed'];
    this.curvib = value['currently']['visibility'];
    this.curcld = value['currently']['cloudCover'];
    this.curozo = value['currently']['ozone'];

    console.log(value['daily']['data']);
    this.weekData = [];
    for (let i = 0; i < 8; ++i) {
      let date = new Date(value['daily']['data'][i]['time'] * 1000);
      this.weekData.push([
        this.datepipe.transform(date, 'dd/M/yyyy'),
        Math.round(value['daily']['data'][i]['temperatureLow']),
        Math.round(value['daily']['data'][i]['temperatureHigh']),
        value['daily']['data'][i]['time']]);
    }
    this.loadWeeklyChart();

    console.log("hourly data", value['hourly']['data']);
    this.hourTemp = []; this.hourPres = []; this.hourHumd = []; this.hourOzon = [];
    this.hourVisb = []; this.hourWind = []; this.hourTime = [];
    for (let i = 0; i < 24; ++i) {
      this.hourTime.push(i);
      this.hourTemp.push(Math.round(value['hourly']['data'][i]['temperature']));
      this.hourPres.push(value['hourly']['data'][i]['pressure']);
      this.hourHumd.push(value['hourly']['data'][i]['humidity'] * 100);
      this.hourOzon.push(value['hourly']['data'][i]['ozone']);
      this.hourVisb.push(value['hourly']['data'][i]['visibility']);
      this.hourWind.push(value['hourly']['data'][i]['windSpeed']);
    }
    this.initHourChart();

    let tweet = "The current temperature at " + this.city + " is " + this.curTemp + "° F. The weather condition is " + this.curSum + ".&hashtags=CSCI571WeatherSearch";
    // console.log("tweet text", tweet.split(' ').join('%20'));
    // this.TweetText = "https://twitter.com/intent/tweet?text=" + tweet.split(' ').join('%20');
    this.TweetText = "https://twitter.com/intent/tweet?text=" + tweet;
    console.log("tweet text", this.TweetText);

    this.checkBtnStar();

    // set loaded as true
    this.loaded = true;
  }
  public checkBtnStar() {
    // favorite button
    if (this.storage.has(this.city)) {
      this.btnStarIcon = "star";
    } else {
      this.btnStarIcon = "star_border";
    }
  }
  public async getStateSeal() {
    let sealUrl: string = environment.serverURL + "/stateseal?state=" + this.state;
    console.log(sealUrl);
    let res = await fetch(sealUrl, {
      method: "GET",
      mode: 'cors',
      cache: 'no-cache',
      credentials: "same-origin",
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: "follow",
      referrer: "no-referrer",
    });
    return await res.json();
  }
  sealImgDisplay = false;
  public getStateSealCallback(value: any) {
    console.log(value);
    console.log(value['items']);
    if ('items' in value) {
      this.sealImg = value['items'][0]['link'];
      this.sealImgDisplay = true;
    } else {
      this.sealImg = "";
      this.sealImgDisplay = false;
    }
    console.log(this.sealImg);
  }
  public async getWeatherTimeData(time) {
    let configUrl: string = environment.serverURL + "/search/weather?lat=" + this.lat + "&lng=" + this.lng + '&time=' + time;
    let res = await fetch(configUrl, {
      method: "GET",
      mode: 'cors',
      cache: 'no-cache',
      credentials: "same-origin",
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: "follow",
      referrer: "no-referrer",
    });
    return await res.json();
  }
  public getWeatherTimeDataCallback(value: any) {
    console.log(value);
    let dateUnix = value['daily']['data'][0]['time'];
    let date = new Date(dateUnix * 1000);
    console.log(dateUnix, date);
    this.cardDate = this.datepipe.transform(date, 'dd/MM/yyyy');

    this.cardTemp = Math.round(value['currently']['temperature']);
    this.cardSum = value['currently']['summary'];
    this.cardIcon = value['currently']['icon'];
    this.cardPrep = Math.round(value['currently']['precipIntensity'] * 10000) / 100;
    this.cardRain = Math.round(value['currently']['precipProbability'] * 100) / 100;
    this.cardWind = Math.round(value['currently']['windSpeed'] * 100) / 100;
    this.cardHumd = Math.round(value['currently']['humidity'] * 10000) / 100;
    this.cardVisb = Math.round(value['currently']['visibility'] * 100) / 100;

    if (this.cardIcon == "clear-day" || this.cardIcon == "clear-night"){
      this.cardIconSrc = "https://cdn3.iconfinder.com/data/icons/weather-344/142/sun-512.png";
    } else if (this.cardIcon == "rain"){
      this.cardIconSrc = "https://cdn3.iconfinder.com/data/icons/weather-344/142/rain-512.png";
    } else if (this.cardIcon == "snow"){
      this.cardIconSrc = "https://cdn3.iconfinder.com/data/icons/weather-344/142/snow-512.png";
    } else if (this.cardIcon == "sleet"){
      this.cardIconSrc = "https://cdn3.iconfinder.com/data/icons/weather-344/142/lightning-512.png";
    } else if (this.cardIcon == "wind"){
      this.cardIconSrc = "https://cdn4.iconfinder.com/data/icons/the-weather-is-nice-today/64/weather_10-512.png";
    } else if (this.cardIcon == "fog"){
      this.cardIconSrc = "https://cdn3.iconfinder.com/data/icons/weather-344/142/cloudy-512.png";
    } else if (this.cardIcon == "cloudy"){
      this.cardIconSrc = "https://cdn3.iconfinder.com/data/icons/weather-344/142/cloud-512.png";
    } else if (this.cardIcon == "partly-cloudy-day" || this.cardIcon == "partly-cloudy-night"){
      this.cardIconSrc = "https://cdn3.iconfinder.com/data/icons/weather-344/142/sunny-512.png";
    }
  }

  // show weather result
  @ViewChild('weatherResults', { static: true }) weatherResults: ElementRef;
  @ViewChild('sealImgBox', { static: true }) sealImgBox: ElementRef;
  @ViewChild('hourMenu', { static: false }) hourMenu: ElementRef;
  public showWeatherResult() {

  }

  // hourly chart
  hourlyChartOptions; hourlyChartLabels; hourlyChartType; hourlyChartLegend; hourlyChartData;
  hourlyChartReady = false;
  public initHourChart() {
    // initial as temp vs time
    this.hourMenu.nativeElement.value = 'temperature';
    console.log("initHourChart: temp", this.hourTemp);
    this.hourlyChartOptions = {
      scaleShowVerticalLines: false,
      responsive: true,
      color: "Blue",
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: "Time difference from current hour",
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: "Fahrenheit",
          },
          ticks: {
            suggestedMax: Math.max(...this.hourTemp) + 2,
            suggestedMin: Math.min(...this.hourTemp) - 5,
          }
        }]
      },
      legend: {
        onClick: (e) => e.stopPropagation()
      },
    };
    this.hourlyChartLabels = this.hourTime;
    this.hourlyChartType = 'bar';
    this.hourlyChartLegend = true;
    this.hourlyChartData = [{
      data: this.hourTemp,
      label: 'temperature',
      backgroundColor: 'rgba(137,189,221)',
      borderColor: 'rgba(137,189,221)',
      hoverBackgroundColor: 'rgba(137,189,221)',
    }];
    this.hourlyChartReady = true;
  }
  public updateHourChart() {
    let content = this.hourMenu.nativeElement.value;
    console.log(content);
    if (content == "temperature") {
      this.initHourChart();
    } else if (content == "pressure") {
      this.hourlyChartData[0].label = "pressure";
      this.hourlyChartData[0].data = this.hourPres;
      this.hourlyChartOptions = {scaleShowVerticalLines: false, responsive: true, color: "Blue",
        scales: {xAxes: [{scaleLabel: {display: true, labelString: "Time difference from current hour",}}],
          yAxes: [{scaleLabel: {display: true, labelString: "Millibars",},
            ticks: {suggestedMax: Math.max(...this.hourPres) + 2, suggestedMin: Math.min(...this.hourPres) - 5}}]},
        legend: {onClick: (e) => e.stopPropagation()}};
    } else if (content == "humidity") {
      this.hourlyChartOptions.scales.yAxes[0].scaleLabel.labelString = "%";
      this.hourlyChartData[0].label = "humidity";
      this.hourlyChartData[0].data = this.hourHumd;
      this.hourlyChartOptions = {scaleShowVerticalLines: false, responsive: true, color: "Blue",
        scales: {xAxes: [{scaleLabel: {display: true, labelString: "Time difference from current hour",}}],
          yAxes: [{scaleLabel: {display: true, labelString: "% Humidity",},
            ticks: {suggestedMax: Math.max(...this.hourHumd) + 5, suggestedMin: Math.min(...this.hourHumd) - 5,}}]},
        legend: {onClick: (e) => e.stopPropagation()}};
    } else if (content == "ozone") {
      this.hourlyChartOptions.scales.yAxes[0].scaleLabel.labelString = "Dobson Units";
      this.hourlyChartData[0].label = "ozone";
      this.hourlyChartData[0].data = this.hourOzon;
      this.hourlyChartOptions = {scaleShowVerticalLines: false, responsive: true, color: "Blue",
        scales: {xAxes: [{scaleLabel: {display: true, labelString: "Time difference from current hour",}}],
          yAxes: [{scaleLabel: {display: true, labelString: "Dobson Units",},
            ticks: {suggestedMax: Math.max(...this.hourOzon) + 2, suggestedMin: Math.min(...this.hourOzon) - 5,}}]},
        legend: {onClick: (e) => e.stopPropagation()}};
    } else if (content == "visibility") {
      this.hourlyChartOptions.scales.yAxes[0].scaleLabel.labelString = "Miles";
      this.hourlyChartData[0].label = "visibility";
      this.hourlyChartData[0].data = this.hourVisb;
      this.hourlyChartOptions = {scaleShowVerticalLines: false, responsive: true, color: "Blue",
        scales: {xAxes: [{scaleLabel: {display: true, labelString: "Time difference from current hour",}}],
          yAxes: [{scaleLabel: {display: true, labelString: "Miles (Maximum 10)",}, ticks: {max: 12, stepSize: 1, beginAtZero: true}}]},
        legend: {onClick: (e) => e.stopPropagation()}};
    } else if (content == "wind speed") {
      this.hourlyChartOptions.scales.yAxes[0].scaleLabel.labelString = "Miles per hour";
      this.hourlyChartData[0].label = "wind speed";
      this.hourlyChartData[0].data = this.hourWind;
      this.hourlyChartOptions = {scaleShowVerticalLines: false, responsive: true, color: "Blue",
        scales: {xAxes: [{scaleLabel: {display: true, labelString: "Time difference from current hour",}}],
          yAxes: [{scaleLabel: {display: true, labelString: "Miles per hour",},
            ticks: {suggestedMax: Math.max(...this.hourWind) + 2, beginAtZero: true}}]},
        legend: {onClick: (e) => e.stopPropagation()}};
    }
  }

  // weekly chart
  // weeklychart;
  public async loadWeeklyChart() {
    console.log('week data for chart', this.weekData);
    let weeklychart = new CanvasJS.Chart("chartContainer", {
      animationEnabled: true,
      title: {
        text: "Weekly Weather"
      },
      legend: {
        verticalAlign: "top"
      },
      axisX: {
        title: "Days",
      },
      axisY: {
        includeZero: false,
        title: "Temperature in Fahrenheit",
        interval: 10,
      },
      data: [{
        type: "rangeBar",
        color: 'rgba(137,189,221)',
        showInLegend: true,
        yValueFormatString: "#0.#",
        indexLabel: "{y[#index]}",
        legendText: "Day wise temperature range",
        toolTipContent: "<b>{label}</b>: {y[0]} to {y[1]}",
        dataPoints: [
          { x: 80, y:[this.weekData[0][1], this.weekData[0][2]], label: this.weekData[0][0], name: this.weekData[0][3] },
          { x: 70, y:[this.weekData[1][1], this.weekData[1][2]], label: this.weekData[1][0], name: this.weekData[0][3] },
          { x: 60, y:[this.weekData[2][1], this.weekData[2][2]], label: this.weekData[2][0], name: this.weekData[0][3] },
          { x: 50, y:[this.weekData[3][1], this.weekData[3][2]], label: this.weekData[3][0], name: this.weekData[0][3] },
          { x: 40, y:[this.weekData[4][1], this.weekData[4][2]], label: this.weekData[4][0], name: this.weekData[0][3] },
          { x: 30, y:[this.weekData[5][1], this.weekData[5][2]], label: this.weekData[5][0], name: this.weekData[0][3] },
          { x: 20, y:[this.weekData[6][1], this.weekData[6][2]], label: this.weekData[6][0], name: this.weekData[0][3] },
          { x: 10, y:[this.weekData[7][1], this.weekData[7][2]], label: this.weekData[7][0], name: this.weekData[0][3] }
        ],
        click: this.showPopModal = (e) => {
          console.log(e);
          const data = this.getWeatherTimeData(e.dataPoint.name);
          data.then(value => this.getWeatherTimeDataCallback(value));
          this.modalService.open(this.popCard, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
        },
      }],
      dataPointWidth: 20,
      scales: {
        xAxes: [{
          gridLines: {
            display: false,
          },
        }],
          yAxes: [{
          gridLines: {
            display: false,
          },
        }],
      }
    });
    // weeklychart.render();
    setTimeout(function(){
      weeklychart.render();
    },500);
  }

  @ViewChild('popCard', { static: true }) public popCard: TemplateRef<any>;
  closeResult: string;
  cardDate; cardTemp; cardSum; cardIcon; cardIconSrc; cardPrep; cardRain; cardWind; cardHumd; cardVisb;
  public showPopModal(e) {
      console.log(e);
      this.modalService.open(this.popCard, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  // click on button star
  public clickBtnStar() {
    if (this.btnStarIcon == "star_border") {
      this.btnStarIcon = "star";
      let content = {
        "img": this.sealImg,
        "city": this.city,
        "state": this.state,
      };
      this.storage.set(String(this.city), JSON.stringify(content));
      this.favContent.push(content);
      console.log(this.storage);
    } else {
      this.btnStarIcon = "star_border";
      this.clickBtnDel(this.city);
    }
  }
  // check local storage is empty or not
  public islocalStorageEmpty() {
    console.log("check this.storage is empty or not:", this.storage);
    return this.storage['storage'].length == 0;
  }
  // delete favorite city
  public clickBtnDel(key) {
    this.storage.remove(key);
    this.syncStorage();
  }
  // sync storage and favContent
  public syncStorage() {
    this.favContent = [];
    let storageKeys = Object.keys(this.storage['storage']);
    for (let key of storageKeys) {
      let val = this.storage.get(key);
      this.favContent.push(JSON.parse(val));
    }
    console.log('syncStorage', this.favContent);
  }
  // click on specific city
  public async clickBtnCity(city, state) {
    this.submitted = true;
    this.btnResCls = this.btnSltCls;
    this.btnFavCls = this.btnUstCls;
    this.showResults = true;
    this.showFavorites = false;
    this.activeTab = "current";

    this.street = "";
    this.city = city;
    this.state = state;
    const locData = this.getSearchLocation();
    console.log("get search location: ", locData);
    await locData.then(value => this.getSearchLocationCallback(value));

    this.getWeather();
  }

  progressPercept = 20;
}
