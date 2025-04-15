import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-base-modal',
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">{{ title }}</h4>
      <button
        type="button"
        class="btn-close"
        aria-label="Close"
        (click)="activeModal.dismiss()"
      ></button>
    </div>
    <div class="modal-body">
      <ng-content></ng-content>
    </div>
    <div class="modal-footer">
      <button
        type="button"
        class="btn btn-secondary"
        (click)="activeModal.dismiss()"
      >
        Cancel
      </button>
    </div>
  `,
  styles: [
    `
      .modal-header {
        padding: 1rem;
        border-bottom: 1px solid #dee2e6;
      }
      .modal-body {
        padding: 1rem;
      }
      .modal-footer {
        padding: 1rem;
        border-top: 1px solid #dee2e6;
      }
    `,
  ],
})
export class BaseModalComponent {
  title: string = '';

  constructor(public activeModal: NgbActiveModal) {}

  protected handleSuccess() {
    this.activeModal.close();
  }

  protected handleError(error: any) {
    console.error('Error:', error);
  }
} 