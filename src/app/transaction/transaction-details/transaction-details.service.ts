import { Injectable } from '@angular/core';
import { Subject, tap, catchError, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TransactionDetailsService {
  transactionUpdated = new Subject<void>();
  private apiUrl = `${environment.apiBaseUrl}/transaction-details/transaction`;

  constructor(private http: HttpClient) {}

  getAllProducts(transactionId: number) {
    return this.http.get(`${this.apiUrl}/${transactionId}/all`);
  }

  getProducts(transactionId: number, size: number, page: number) {
    return this.http.get(
      `${this.apiUrl}/${transactionId}?size=${size}&page=${page - 1}`
    );
  }

  addProductTotransaction(
    transactionId: number,
    productId: number,
    price: number,
    quantity: number
  ) {
    return this.http
      .post(`${this.apiUrl}/${transactionId}/product`, {
        productId,
        price,
        quantity,
      })
      .pipe(
        tap(() => this.transactionUpdated.next()),
        catchError((error) => {
          console.error('Error adding product to transaction');
          return throwError(() => error);
        })
      );
  }
  addProductsBatch(products: any[], transactionId: number) {
    return this.http
      .post(`${this.apiUrl}/${transactionId}/products`, products)
      .pipe(
        tap(() => this.transactionUpdated.next()),
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  deleteProduct(transactionId: number, detailId: number) {
    return this.http
      .delete(`${this.apiUrl}/${transactionId}/product/${detailId}`)
      .pipe(
        tap(() => this.transactionUpdated.next()),
        catchError((error) => {
          console.error('Error on removing product from transaction', error);
          return throwError(() => error);
        })
      );
  }
}
