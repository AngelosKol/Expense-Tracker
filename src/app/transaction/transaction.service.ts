import { Injectable, signal } from '@angular/core';
import { Observable, Subject, tap, catchError, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { TransactionDTO } from '../shared/dto';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private apiUrl = environment.apiBaseUrl;
  transactionsUpdated = new Subject<void>();
  transactionSource = signal<TransactionDTO | null>(null);

  constructor(private http: HttpClient) {}

  setTransaction(transaction: TransactionDTO) {
    this.transactionSource.update(() => transaction);
  }
  getAllTransactions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/all`);
  }

  getTransactions(size: number, page: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/transactions?size=${size}&page=${page - 1}`
    );
  }
  getTransaction(id: number) {
    return this.http.get(`${this.apiUrl}/transactions/id/${id}`);
  }

  addTransaction(transaction: TransactionDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/transactions`, transaction).pipe(
      tap(() => this.transactionsUpdated.next()),
      catchError((err) => {
        console.error('Error adding transaction', err);
        return throwError(() => err);
      })
    );
  }

  updateTransaction(transaction: Partial<TransactionDTO>): Observable<any> {
    return this.http.put(`${this.apiUrl}/transactions`, transaction).pipe(
      tap(() => this.transactionsUpdated.next()),
      catchError((err) => {
        console.error('Error updating transaction', err);
        return throwError(() => err);
      })
    );
  }

  deleteTransaction(id: number) {
    return this.http.delete(`${this.apiUrl}/transactions/id/${id}`).pipe(
      tap(() => this.transactionsUpdated.next()),
      catchError((err) => {
        console.error('Error deleting transaction', err);
        return throwError(() => err);
      })
    );
  }
}
