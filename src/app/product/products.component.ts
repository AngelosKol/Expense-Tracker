import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import {
  NgbHighlight,
  NgbModal,
  NgbPagination,
} from '@ng-bootstrap/ng-bootstrap';
import { Product } from './product.model';
import { CreateProductModalComponent } from '../modals/create-product-modal/create-product-modal.component';
import { ProductService } from './products.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgbdSortableHeader, SortEvent } from '../shared/sortable.directive';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import { LoadingSpinnerComponent } from '../shared/loading-spinner/loading-spinner.component';
import { AsyncPipe } from '@angular/common';
@Component({
  standalone: true,
  imports: [
    NgbPagination,
    NgbHighlight,
    LoadingSpinnerComponent,
    ReactiveFormsModule,
    AsyncPipe,
    NgbdSortableHeader,
  ],
  selector: 'app-products',
  templateUrl: './products.component.html',
})
export class ProductsComponent implements OnInit {
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  products$: Observable<Product[]>;
  isLoading: boolean = false;
  error: string;
  currentPage: number = 1;
  itemsPerPage: number = 8;
  collectionSize: number;
  filter = new FormControl('', { nonNullable: true });

  // Subjects for pagination and sorting
  private pagination$ = new BehaviorSubject<number>(this.currentPage);
  private sorting$ = new BehaviorSubject<SortEvent>({
    column: '',
    direction: '',
  });

  constructor(
    private modalService: NgbModal,
    private productService: ProductService
  ) {}

  ngOnInit() {
    // Observable for filter changes
    const filter$ = this.filter.valueChanges.pipe(
      startWith(''),
      debounceTime(100)
    );

    // Observable for product updates (additions/deletions)
    const productsUpdated$ = this.productService.productsUpdated.pipe(
      startWith(null)
    );

    // Combine filter, pagination, sorting, and product updates into one stream
    this.products$ = combineLatest([
      filter$,
      productsUpdated$,
      this.pagination$,
      this.sorting$,
    ]).pipe(
      switchMap(([filterText, _, currentPage, sortEvent]) => {
        this.isLoading = true;
        return this.productService
          .getProducts(this.itemsPerPage, currentPage, filterText, sortEvent)
          .pipe(
            map((data: any) => {
              this.collectionSize = data.totalElements;
              console.log(data);
              return data.content;
            }),
            tap(() => (this.isLoading = false)),
            catchError((error) => {
              this.isLoading = false;
              this.setError(error.error.message || 'Error fetching products');
              return of([]);
            })
          );
      })
    );
  }

  onSort({ column, direction }: SortEvent) {
    this.sorting$.next({ column, direction });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    // Emits the new page number to the pagination$ observable, triggering the data fetch for the new page via the reactive pipeline.
    this.pagination$.next(page);
  }

  // Modal Methods
  addProduct() {
    const modalRef = this.modalService.open(CreateProductModalComponent, {
      size: 'xl',
    });
    modalRef.componentInstance.mode = 'add';
  }

  onEdit(prod: Product) {
    this.productService.setProduct(prod);
    const modalRef = this.modalService.open(CreateProductModalComponent, {
      size: 'xl',
    });
    modalRef.componentInstance.mode = 'edit';
  }

  onDelete(prod: Product) {
    if (window.confirm('Delete Item?')) {
      this.productService.deleteProduct(prod.id).subscribe({
        next: () => console.log('Product deleted.'),
        error: (err) => this.setError(err.error.message),
      });
    }
  }

  setError(errMsg: string) {
    this.error = errMsg;
    setTimeout(() => (this.error = null), 8000);
  }
}
