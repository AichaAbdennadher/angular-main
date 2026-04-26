import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuppComponent } from './supp.component';

describe('SuppComponent', () => {
  let component: SuppComponent;
  let fixture: ComponentFixture<SuppComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuppComponent]
    });
    fixture = TestBed.createComponent(SuppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
