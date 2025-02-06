import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Product } from '../../product/product.model';
import { ProductService } from '../../product/products.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  selector: 'app-product-modal',
  templateUrl: './create-product-modal.component.html',
})
export class CreateProductModalComponent implements OnInit {
  product: Product;
  productForm: FormGroup;
  mode: string;
  error: string;
  transactionId: number;
  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private productService: ProductService
  ) {}

  ngOnInit() {
    if (this.mode == 'edit') {
      this.product = this.productService.productSource();
      this.initializeEditForm();
    } else if (this.mode == 'add') {
      this.initializeForm();
    }
  }
  onSubmit() {
    const formValue = this.productForm.value;
    if (this.mode == 'add') {
      const newProduct = new Product(formValue.productName);
      this.productService.addProduct(newProduct).subscribe({
        next: () => {
          this.handleSuccess();
        },
        error: (err) => {
          this.handleError(err);
        },
      });
    } else if (this.mode == 'edit') {
      const updatedProduct: Partial<Product> = {
        name: formValue.productName,
      };
      this.productService
        .updateProduct(this.product.id, updatedProduct)
        .subscribe({
          next: () => {
            this.handleSuccess();
          },
          error: (err) => {
            this.handleError(err);
          },
        });
    }
  }

  initializeEditForm() {
    this.productForm = this.fb.group({
      productName: [this.product.name, Validators.required],
    });
  }
  initializeForm() {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
    });
  }

  handleSuccess() {
    this.activeModal.close();
    this.initializeForm();
  }

  handleError(error) {
    this.initializeForm();
    this.setError(error.error.message);
  }

  setError(errMsg: string) {
    this.error = errMsg;
    setTimeout(() => (this.error = null), 8000);
  }
}
