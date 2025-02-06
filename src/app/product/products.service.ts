import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, Subject, catchError, tap } from 'rxjs';
import { Product } from './product.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  productSource = signal<Product | null>(null);
  productsUpdated = new Subject<void>();
  apiRoot = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) {}

  setProduct(product: Product) {
    // this.productSource.next(product);
    this.productSource.update(() => product);
  }

  addProduct(product: Product): Observable<any> {
    return this.http.post(`${this.apiRoot}/products`, product).pipe(
      tap(() => this.productsUpdated.next()),
      catchError((err) => {
        // console.log('Error adding product',err)
        throw err;
      })
    );
  }
  getAllProducts(): Observable<any> {
    return this.http.get(`${this.apiRoot}/products/all`);
  }

  getProducts(size: number, page: number): Observable<any> {
    return this.http.get(
      `${this.apiRoot}/products?size=${size}&page=${page - 1}`
    );
  }

  deleteProduct(productId: number): Observable<any> {
    return this.http.delete(`${this.apiRoot}/products/id/${productId}`).pipe(
      tap(() => this.productsUpdated.next()),
      catchError((err) => {
        // console.log('Error deleting product',err)
        throw err;
      })
    );
  }

  updateProduct(
    productId: number,
    updatedProduct: Partial<Product>
  ): Observable<any> {
    return this.http
      .put(`${this.apiRoot}/products/id/${productId}`, updatedProduct)
      .pipe(
        tap(() => this.productsUpdated.next()),
        catchError((err) => {
          // console.log('Error updating product',err)
          throw err;
        })
      );
  }
}
