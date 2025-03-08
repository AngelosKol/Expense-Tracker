import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbActiveModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { ProductService } from '../../product/products.service';
import {
  Observable,
  OperatorFunction,
  debounceTime,
  distinctUntilChanged,
  map,
} from 'rxjs';
import { Product } from '../../product/product.model';
import { Currency, CurrencyService } from 'src/app/shared/currency.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgbTypeahead, FormsModule],
  selector: 'app-transactionProducts-modal',
  templateUrl: './add-product-to-transaction-modal.component.html',
})
export class AddProductToTransactionModalComponent implements OnInit {
  products: Product[];
  selectedProduct: Product;
  transactionProductForm: FormGroup;
  transactionId: number;
  currency: Currency;
  mode: string;
  error: string;
  existingProducts: Product[];
  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private productService: ProductService,
    private currencyService: CurrencyService
  ) {}

  ngOnInit() {
    this.currencyService.currencies$.subscribe((data) => {
      this.currency = data;
    });

    this.initializeForm();
    this.fetchProducts();
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
          : this.products
              .filter(
                (product) =>
                  product.name.toLowerCase().indexOf(term.toLowerCase()) > -1
              )
              .map((product) => product.name)
              .slice(0, 10)
      )
    );

  fetchProducts() {
    this.productService.getAllProducts().subscribe({
      next: (data: any) => {
        this.products = data;
      },
      error: (err) => {
        console.error(err.message);
      },
    });
  }

  onSubmit() {
    const formValue = this.transactionProductForm.value;
    const newProduct: any = {
      name: this.selectedProduct.name,
      productId: formValue.productId,
      price: formValue.price,
      quantity: formValue.quantity,
    };
    const isExists = this.existingProducts.some(
      (p) => p.name === newProduct.name
    );
    if (isExists) {
      this.setError('Product already exists in the list!');
      return;
    }
    this.activeModal.close(newProduct);
    this.initializeForm();
  }

  onProductSelected(selectedProductName: string) {
    this.selectedProduct = this.products.find(
      (product) => product.name === selectedProductName
    );
    if (this.selectedProduct) {
      this.transactionProductForm.patchValue({
        productId: this.selectedProduct.id,
      });
    }
  }

  handleSuccess() {
    this.activeModal.close();
    this.initializeForm();
  }

  handleError(error) {
    this.initializeForm();
    this.setError(error.error.message);
  }

  initializeForm() {
    this.transactionProductForm = this.fb.group({
      product: ['', Validators.required],
      price: [
        '',
        [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)],
      ],
      quantity: [
        1,
        [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)],
      ],
      productId: [],
    });
  }

  setError(errMsg: string) {
    this.error = errMsg;
    setTimeout(() => (this.error = null), 8000);
  }
}
