import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuppCommentaireComponent } from './supp-commentaire.component';

describe('SuppCommentaireComponent', () => {
  let component: SuppCommentaireComponent;
  let fixture: ComponentFixture<SuppCommentaireComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuppCommentaireComponent]
    });
    fixture = TestBed.createComponent(SuppCommentaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
