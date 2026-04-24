import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostesMComponent } from './postes-m.component';

describe('PostesMComponent', () => {
  let component: PostesMComponent;
  let fixture: ComponentFixture<PostesMComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PostesMComponent]
    });
    fixture = TestBed.createComponent(PostesMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
