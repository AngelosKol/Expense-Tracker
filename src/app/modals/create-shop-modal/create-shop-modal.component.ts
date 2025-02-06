import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Shop } from '../../shop/shop.model';
import { ShopService } from '../../shop/shop.service';
import { CommonModule } from '@angular/common';
@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  selector: 'app-shop-modal',
  templateUrl: './create-shop-modal.component.html',
})
export class CreateShopModalComponent implements OnInit {
  shop: Shop;
  shopForm: FormGroup;
  mode: string;
  error: string;
  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private shopService: ShopService
  ) {}

  ngOnInit() {
    if (this.mode == 'edit') {
      this.shopService.currentShop.subscribe((data) => {
        this.shop = data;
      });
      this.initializeEditForm();
    } else if (this.mode == 'add') {
      this.initializeForm();
    }
  }

  onSubmit() {
    const formValue = this.shopForm.value;
    if (this.mode == 'add') {
      const newShop = new Shop(formValue.shopName);
      this.shopService.addShop(newShop).subscribe({
        next: () => {
          this.handleSuccess();
        },
        error: (err) => {
          this.handleError(err);
        },
      });
    } else if (this.mode == 'edit') {
      const updatedShop: Partial<Shop> = {
        name: formValue.shopName,
      };
      this.shopService.updateShop(this.shop.id, updatedShop).subscribe({
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
    this.shopForm = this.fb.group({
      shopName: ['', Validators.required],
    });
  }

  initializeEditForm() {
    this.shopForm = this.fb.group({
      shopName: [this.shop.name, Validators.required],
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
