import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppResultComponent } from './app-result.component';

describe('AppResultComponent', () => {
  let component: AppResultComponent;
  let fixture: ComponentFixture<AppResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
