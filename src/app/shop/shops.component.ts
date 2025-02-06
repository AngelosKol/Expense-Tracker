import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { NgbdSortableHeader, SortEvent } from '../shared/sortable.directive';
import {
  NgbHighlight,
  NgbModal,
  NgbPagination,
} from '@ng-bootstrap/ng-bootstrap';
import { Shop } from './shop.model';
import { ShopService } from './shop.service';
import { CreateShopModalComponent } from '../modals/create-shop-modal/create-shop-modal.component';
import {
  BehaviorSubject,
  Observable,
  catchError,
  combineLatest,
  debounceTime,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { compare } from '../shared/utils';
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
  ],
  selector: 'app-shops',
  templateUrl: './shops.component.html',
})
export class ShopsComponent implements OnInit {
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  shops$: Observable<Shop[]>;
  isLoading: boolean = false;
  error: string;
  currentPage: number = 1;
  itemsPerPage: number = 8;
  collectionSize: number;
  filter = new FormControl('', { nonNullable: true });

  private pagination$ = new BehaviorSubject<number>(this.currentPage);
  private sorting$ = new BehaviorSubject<SortEvent>({
    column: '',
    direction: '',
  });
  constructor(
    private shopService: ShopService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    //Observable for filter changes
    const filter$ = this.filter.valueChanges.pipe(
      startWith(''),
      debounceTime(100)
    );

    // Observable for shop updates (additions/deletions)
    const shopsUpdated$ = this.shopService.shopsUpdated.pipe(startWith(null));

    this.shops$ = combineLatest([
      filter$,
      shopsUpdated$,
      this.pagination$,
      this.sorting$,
    ]).pipe(
      switchMap(([filterText, _, currentPage, sortEvent]) => {
        this.isLoading = true;
        return this.shopService.getShops(this.itemsPerPage, currentPage).pipe(
          map((data: any) => {
            this.collectionSize = data.totalElements;
            return data.content;
          }),
          map((shops: Shop[]) => {
            // Apply filtering
            shops = shops.filter((product) =>
              product.name.toLowerCase().includes(filterText.toLowerCase())
            );
            // Apply sorting
            if (sortEvent.column && sortEvent.direction) {
              shops = [...shops].sort((a, b) => {
                const res = compare(a[sortEvent.column], b[sortEvent.column]);
                return sortEvent.direction === 'asc' ? res : -res;
              });
            }
            return shops;
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

  onSort({ column, direction }: any) {
    this.sorting$.next({ column, direction });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.pagination$.next(page);
  }

  //Modal Methods
  addShop() {
    const modalRef = this.modalService.open(CreateShopModalComponent, {
      size: 'xl',
    });
    modalRef.componentInstance.mode = 'add';
  }

  onEdit(shop: Shop) {
    this.shopService.setShop(shop);
    const modalRef = this.modalService.open(CreateShopModalComponent, {
      size: 'xl',
    });
    modalRef.componentInstance.mode = 'edit';
  }

  onDelete(shop: Shop) {
    if (window.confirm('Delete shop?')) {
      this.shopService.deleteShop(shop.id).subscribe({
        next: () => {
          console.log('Shop deleted');
        },
        error: (err) => {
          console.log(err);
          this.setError(err.error.message);
        },
      });
    }
  }

  setError(errMsg: string) {
    this.error = errMsg;
    setTimeout(() => (this.error = null), 8000);
  }
}
