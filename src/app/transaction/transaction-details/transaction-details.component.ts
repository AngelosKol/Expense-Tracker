import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe, CommonModule, DecimalPipe } from '@angular/common';
import {
  NgbHighlight,
  NgbModal,
  NgbPagination,
} from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import { compare } from '../../shared/utils';
import { Currency, CurrencyService } from '../../shared/currency.service';
import { Product } from 'src/app/product/product.model';
import {
  NgbdSortableHeader,
  SortEvent,
} from 'src/app/shared/sortable.directive';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AddProductToTransactionModalComponent } from 'src/app/modals/add-product-modal/add-product-to-transaction-modal.component';
import { LoadingSpinnerComponent } from 'src/app/shared/loading-spinner/loading-spinner.component';
import { TransactionDetailsService } from './transaction-details.service';
import { TransactionDetailsDTO } from 'src/app/shared/dto';

@Component({
  standalone: true,
  imports: [
    NgbPagination,
    NgbHighlight,
    NgbdSortableHeader,
    LoadingSpinnerComponent,
    AsyncPipe,
    DecimalPipe,
    ReactiveFormsModule,
    CommonModule,
  ],
  selector: 'app-transaction-edit',
  templateUrl: './transaction-details.component.html',
  providers: [DecimalPipe],
})
export class TransactionDetails implements OnInit {
  transactionId: number;
  transactionDetails$: Observable<TransactionDetailsDTO[]>;
  currency: Currency;
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  isLoading: boolean;
  error: string;
  currentPage = 1;
  itemsPerPage = 8;
  collectionSize: number;
  filter = new FormControl('', { nonNullable: true });
  pendingProducts: Product[] = [];

  // Subjects for pagination and sorting
  private pagination$ = new BehaviorSubject<number>(this.currentPage);
  private sorting$ = new BehaviorSubject<SortEvent>({
    column: '',
    direction: '',
  });

  constructor(
    private transactionDetailsService: TransactionDetailsService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private currencyService: CurrencyService
  ) {}

  ngOnInit() {
    this.currencyService.currencies$.subscribe((data) => {
      this.currency = data;
    });

    // Observable for transaction ID
    this.route.params.subscribe(
      (params) => (this.transactionId = params['id'])
    );

    //Observable for filter changes
    const filter$ = this.filter.valueChanges.pipe(
      startWith(''),
      debounceTime(100)
    );

    // Observable for product updates (additions/deletions)
    const transactionUpdated$ =
      this.transactionDetailsService.transactionUpdated.pipe(startWith(null));

    // Combine filter, pagination, sorting, and product updates into one stream
    this.transactionDetails$ = combineLatest([
      filter$,
      transactionUpdated$,
      this.pagination$,
      this.sorting$,
    ]).pipe(
      switchMap(([filterText, _, currentPage, sortEvent]) => {
        this.isLoading = true;
        return this.transactionDetailsService
          .getProducts(this.transactionId, this.itemsPerPage, currentPage)
          .pipe(
            map((data: any) => {
              this.collectionSize = data.totalElements;
              return data.content;
            }),
            map((products: TransactionDetailsDTO[]) => {
              // Apply filtering
              products = products.filter((product) =>
                product.productName
                  .toLowerCase()
                  .includes(filterText.toLowerCase())
              );
              // Apply sorting
              if (sortEvent.column && sortEvent.direction) {
                products = [...products].sort((a, b) => {
                  const res = compare(a[sortEvent.column], b[sortEvent.column]);
                  return sortEvent.direction === 'asc' ? res : -res;
                });
              }
              return products;
            }),
            tap(() => (this.isLoading = false)),
            catchError((error) => {
              this.isLoading = false;
              this.setError(error);
              console.error('Error fetching products', error);
              return of([]);
            })
          );
      })
    );
  }

  // Modal Methods
  addProduct() {
    const modalRef = this.modalService.open(
      AddProductToTransactionModalComponent,
      {
        size: 'lg',
      }
    );
    modalRef.componentInstance.transactionId = this.transactionId;
  }

  onDelete(detailId: number) {
    if (window.confirm('Delete Item?')) {
      this.transactionDetailsService
        .deleteProduct(this.transactionId, detailId)
        .subscribe({
          next: () => console.log('Product removed.'),
          error: (err) => this.setError(err.error.message),
        });
    }
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.pagination$.next(page);
  }

  onSort({ column, direction }: any) {
    this.sorting$.next({ column, direction });
  }

  setError(errMsg: string) {
    this.error = errMsg;
    setTimeout(() => (this.error = null), 8000);
  }
}
