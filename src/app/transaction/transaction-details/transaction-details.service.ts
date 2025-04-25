import { Injectable } from '@angular/core';
import { Subject, tap, catchError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TransactionDetailsService {
  transactionUpdated = new Subject<void>();
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getAllProducts(transactionId: number) {
    return this.http.get(
      `${this.apiUrl}/transaction-details/id/${transactionId}/all`
    );
  }

  getProducts(transactionId: number, size: number, page: number) {
    return this.http.get(
      `${
        this.apiUrl
      }/transaction-details/id/${transactionId}?size=${size}&page=${page - 1}`
    );
  }

  addProductTotransaction(
    transactionId: number,
    productId: number,
    price: number,
    quantity: number
  ) {
    return this.http
      .post(`${this.apiUrl}/transaction-details/id/${transactionId}/product`, {
        productId,
        price,
        quantity,
      })
      .pipe(
        tap(() => this.transactionUpdated.next()),
        catchError((err) => {
          console.error('Error adding product to transaction');
          throw err;
        })
      );
  }
  addProductsBatch(products: any[], transactionId: number) {
    return this.http
      .post(
        `${this.apiUrl}/transaction-details/id/${transactionId}/products`,
        products
      )
      .pipe(
        tap(() => this.transactionUpdated.next()),
        catchError((err) => {
          console.error('Error adding product batch');
          throw err;
        })
      );
  }

  deleteProduct(transactionId: number, productName: string) {
    return this.http
      .delete(
        `${this.apiUrl}/transaction-details/id/${transactionId}/product/${productName}`
      )
      .pipe(
        tap(() => this.transactionUpdated.next()),
        catchError((error) => {
          console.error('Error on removing product from transaction', error);
          throw error;
        })
      );
  }
}
