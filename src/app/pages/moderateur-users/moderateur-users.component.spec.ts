import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModerateurUsersComponent } from './moderateur-users.component';

describe('ModerateurUsersComponent', () => {
  let component: ModerateurUsersComponent;
  let fixture: ComponentFixture<ModerateurUsersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModerateurUsersComponent]
    });
    fixture = TestBed.createComponent(ModerateurUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
