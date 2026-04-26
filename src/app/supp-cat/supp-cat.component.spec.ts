import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuppCatComponent } from './supp-cat.component';

describe('SuppCatComponent', () => {
  let component: SuppCatComponent;
  let fixture: ComponentFixture<SuppCatComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuppCatComponent]
    });
    fixture = TestBed.createComponent(SuppCatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
