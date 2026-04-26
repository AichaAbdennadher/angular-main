import { Component, Input, Output, EventEmitter } from '@angular/core';
import { animate, group, query, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-supp-cat',
  templateUrl: './supp-cat.component.html',
  styleUrls: ['./supp-cat.component.css'],
  animations: [
    trigger('modalTrigger', [
      transition(':enter', [
        group([
          query('.backdrop', [
            style({ opacity: 0 }),
            animate('200ms ease-out', style({ opacity: 1 }))
          ], { optional: true }),
          query('.modal-content', [
            style({ transform: 'scale(0.95) translateY(20px)', opacity: 0 }),
            animate('300ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ transform: 'scale(1) translateY(0)', opacity: 1 }))
          ], { optional: true })
        ])
      ]),
      transition(':leave', [
        group([
          query('.backdrop', [
            animate('200ms ease-in', style({ opacity: 0 }))
          ], { optional: true }),
          query('.modal-content', [
            animate('200ms ease-in', style({ transform: 'scale(0.95) translateY(20px)', opacity: 0 }))
          ], { optional: true })
        ])
      ])
    ])
  ],
  host: { '[@modalTrigger]': '' }
})
export class SuppCatComponent {
  @Input() statutId: number | null = null;
  @Output() confirmDelete = new EventEmitter<number>();
  @Output() cancel = new EventEmitter<void>();

  confirm() {
    if (this.statutId !== null) {
      this.confirmDelete.emit(this.statutId);
    }
  }

  close() {
    this.cancel.emit();
  }
}
