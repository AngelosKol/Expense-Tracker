import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Transaction } from '../../transaction/transaction.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TransactionService } from '../../transaction/transaction.service';
import { Observable } from 'rxjs';
import { Shop } from '../../shop/shop.model';
import { ShopService } from '../../shop/shop.service';
import { CommonModule } from '@angular/common';
import { TransactionDTO } from 'src/app/shared/dto';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  selector: 'app-transaction-modal',
  templateUrl: './manage-transaction-modal.component.html',
})
export class ManageTransactionModalComponent {
  transactionForm: FormGroup;
  shops$: Observable<Shop[]>;
  selectedShop: Shop;
  currentTransaction: Transaction;
  mode: string;
  error: string;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private shopService: ShopService
  ) {}

  ngOnInit() {
    this.shops$ = this.shopService.getAllShops();
    if (this.mode == 'edit') {
      this.currentTransaction = this.transactionService.transactionSource();
      this.initializeEditForm();
    } else if (this.mode == 'add') {
      this.initializeForm();
    }
  }

  onSubmit() {
    const formValue = this.transactionForm.value;

    if (this.mode === 'add') {
      const newTransaction = new Transaction(
        formValue.transactionDate,
        formValue.shopName
      );
      this.transactionService.addTransaction(newTransaction).subscribe({
        next: () => {
          this.handleSuccess();
        },
        error: (err) => {
          this.handleError(err);
        },
      });
    } else if (this.mode === 'edit') {
      const updatedTransaction: Partial<TransactionDTO> = {
        date: formValue.transactionDate,
        shopName: formValue.shopName,
      };

      this.transactionService.updateTransaction(updatedTransaction).subscribe({
        next: () => {
          this.handleSuccess();
        },
        error: (err) => {
          this.handleError(err);
        },
      });
    }
  }

  initializeForm() {
    const today = new Date().toISOString().split('T')[0];

    this.transactionForm = this.fb.group({
      transactionDate: [today, Validators.required],
      shopName: ['', Validators.required],
      shopId: [''],
    });
  }

  initializeEditForm() {
    this.transactionForm = this.fb.group({
      transactionDate: [this.currentTransaction.date, Validators.required],
      shopName: [this.currentTransaction.shopName, Validators.required],
      shopId: [''],
    });
  }

  handleSuccess() {
    this.activeModal.close();
    this.initializeForm();
  }

  handleError(error) {
    this.initializeEditForm();
    this.setError(error.error.message);
  }

  setError(errMsg: string) {
    this.error = errMsg;
    setTimeout(() => (this.error = null), 8000);
  }
}
