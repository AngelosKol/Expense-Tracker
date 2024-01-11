import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../modal/modal.component';
import { Product } from './product.model';
import { ProductService } from './products.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
  products: Product[];
  isLoading: boolean = false;
  error = null;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  total: number;

  constructor(private productsService: ProductService, private modalService: NgbModal) {}

  ngOnInit() {
    this.productsService.dataUpdated.subscribe(() => {
      this.isLoading = true;
      this.fetchProducts();
    });
    this.fetchProducts();
  }

  fetchProducts() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.productsService.getProducts(startIndex, this.itemsPerPage).subscribe({
      next: (data: Product[]) => {
        this.products = data;
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.message;
        console.error(error.message);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  open() {
    this.modalService.open(ModalComponent, { size: 'xl' });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.fetchProducts();
  }
}