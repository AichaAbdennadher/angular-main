import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModerateurLayoutComponent } from './moderateur-layout.component';

describe('ModerateurLayoutComponent', () => {
  let component: ModerateurLayoutComponent;
  let fixture: ComponentFixture<ModerateurLayoutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModerateurLayoutComponent]
    });
    fixture = TestBed.createComponent(ModerateurLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
