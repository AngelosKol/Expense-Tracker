import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Transaction } from '../../transaction/transaction.model';
import { NgbActiveModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { TransactionService } from '../../transaction/transaction.service';
import {
  OperatorFunction,
  Observable,
  debounceTime,
  distinctUntilChanged,
  map,
} from 'rxjs';
import { Shop } from '../../shop/shop.model';
import { ShopService } from '../../shop/shop.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgbTypeahead],
  selector: 'app-transaction-modal',
  templateUrl: './create-transaction-modal.component.html',
})
export class CreateTransactionModalComponent {
  transactionForm: FormGroup;
  shops: Shop[];
  selectedShop: Shop;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private shopService: ShopService
  ) {}

  ngOnInit() {
    this.getShops();
    this.initializeForm();
  }

  search: OperatorFunction<string, readonly string[]> = (
    text$: Observable<string>
  ) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 2
          ? []
          : this.shops
              .filter(
                (product) =>
                  product.name.toLowerCase().indexOf(term.toLowerCase()) > -1
              )
              .map((product) => product.name)
              .slice(0, 10)
      )
    );

  onSubmit() {
    const formValue = this.transactionForm.value;
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
  }

  getShops() {
    this.shopService.getAllShops().subscribe({
      next: (data) => {
        this.shops = data;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  initializeForm() {
    const today = new Date().toISOString().split('T')[0];

    this.transactionForm = this.fb.group({
      transactionDate: [today, Validators.required],
      shopName: ['', Validators.required],
      shopId: [''],
    });
  }

  handleSuccess() {
    this.activeModal.close();
    this.initializeForm();
  }

  handleError(error) {
    this.initializeForm();
    console.log(error);
  }

  onShopSelected(selectedShopName: string) {
    this.selectedShop = this.shops.find(
      (shop) => shop.name === selectedShopName
    );
    if (this.selectedShop) {
      this.transactionForm.patchValue({
        shopId: this.selectedShop.id,
      });
    }
  }
}
