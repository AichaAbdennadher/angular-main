import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuppensionComponent } from './suppension.component';

describe('SuppensionComponent', () => {
  let component: SuppensionComponent;
  let fixture: ComponentFixture<SuppensionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuppensionComponent]
    });
    fixture = TestBed.createComponent(SuppensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
