import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import {
  NgbHighlight,
  NgbModal,
  NgbPagination,
  NgbPaginationModule,
} from '@ng-bootstrap/ng-bootstrap';
import { CreateTransactionModalComponent } from '../../modals/create-transaction-modal/create-transaction-modal.component';
import { TransactionService } from '../transaction.service';
import { Transaction } from '../transaction.model';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
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
import { NgbdSortableHeader } from 'src/app/shared/sortable.directive';
import { AsyncPipe } from '@angular/common';
import { LoadingSpinnerComponent } from 'src/app/shared/loading-spinner/loading-spinner.component';

@Component({
  standalone: true,
  imports: [
    NgbPagination,
    NgbHighlight,
    AsyncPipe,
    NgbPaginationModule,
    LoadingSpinnerComponent,
    ReactiveFormsModule,
  ],
  selector: 'app-transactions-list',
  templateUrl: './transaction-list.component.html',
})
export class TransactionsListComponent implements OnInit {
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  transactions$: Observable<Transaction[]>;
  isLoading: boolean = false;
  error: string;
  currentPage: number = 1;
  itemsPerPage: number = 8;
  collectionSize: number;
  filter = new FormControl('', { nonNullable: true });

  // Subject for pagination
  private pagination$ = new BehaviorSubject<number>(this.currentPage);

  constructor(
    private modalService: NgbModal,
    private transactionService: TransactionService,
    private router: Router
  ) {}

  ngOnInit() {
    //Observable for filter changes
    const filter$ = this.filter.valueChanges.pipe(
      startWith(''),
      debounceTime(100)
    );

    // Observable for product updates (additions/deletions)
    const transactionsUpdated$ =
      this.transactionService.transactionsUpdated.pipe(startWith(null));

    this.transactions$ = combineLatest([
      filter$,
      transactionsUpdated$,
      this.pagination$,
    ]).pipe(
      switchMap(([filterText, _, currentPage]) => {
        this.isLoading = true;
        return this.transactionService
          .getTransactions(this.itemsPerPage, currentPage)
          .pipe(
            map((data: any) => {
              this.collectionSize = data.totalElements;
              return data.content;
            }),
            map((transactions: Transaction[]) => {
              transactions = transactions.filter((transaction) =>
                transaction.shopName
                  .toLowerCase()
                  .includes(filterText.toLowerCase())
              );
              return transactions;
            }),
            tap(() => (this.isLoading = false)),
            catchError((error) => {
              this.isLoading = false;
              this.setError(error);
              console.error('Error fetching transactions', error);
              return of([]);
            })
          );
      })
    );
  }

  navigateToTransactionItem(id: number) {
    this.router.navigate(['/home', 'transactions', id, 'edit'], {});
  }

  onPageChange(page: number) {
    this.currentPage = page;
    // Emits the new page number to the pagination$ observable, triggering the data fetch for the new page via the reactive pipeline.
    this.pagination$.next(page);
  }

  //Modal Methods

  open() {
    this.modalService.open(CreateTransactionModalComponent, {
      size: 'xl',
      animation: true,
    });
  }

  onDelete(id: number) {
    if (window.confirm('Delete transaction?')) {
      this.transactionService.deleteTransaction(id).subscribe({
        next: () => {
          console.log('item deleted');
        },
        error: (err) => console.log(err),
      });
    }
  }

  setError(message: string) {
    this.error = message;
    setTimeout(() => (this.error = null), 8000);
  }
}
