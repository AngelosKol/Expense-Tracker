import { Injectable, signal } from '@angular/core';
import { Observable, Subject, catchError, tap } from 'rxjs';
import { Product } from './product.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SortEvent } from '../shared/sortable.directive';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  productSource = signal<Product | null>(null);
  productsUpdated = new Subject<void>();
  apiRoot = 'http://localhost:8080/api/v1/products';

  constructor(private http: HttpClient) {}

  setProduct(product: Product) {
    this.productSource.update(() => product);
  }

  addProduct(product: Partial<Product>): Observable<any> {
    return this.http.post(`${this.apiRoot}`, product).pipe(
      tap(() => this.productsUpdated.next()),
      catchError((err) => {
        // console.log('Error adding product',err)
        throw err;
      })
    );
  }
  getAllProducts(): Observable<any> {
    return this.http.get(`${this.apiRoot}/all`);
  }

  getProducts(
    itemsPerPage: number,
    currentPage: number,
    filterText: string,
    sortEvent: SortEvent
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', currentPage - 1)
      .set('size', itemsPerPage)
      .set('filter', filterText);

    if (sortEvent.column && sortEvent.direction) {
      params = params.set('sort', `${sortEvent.column},${sortEvent.direction}`);
    }
    return this.http.get<any>(`${this.apiRoot}`, { params });
  }

  deleteProduct(productId: number): Observable<any> {
    return this.http.delete(`${this.apiRoot}/id/${productId}`).pipe(
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
      .put(`${this.apiRoot}/id/${productId}`, updatedProduct)
      .pipe(
        tap(() => this.productsUpdated.next()),
        catchError((err) => {
          // console.log('Error updating product',err)
          throw err;
        })
      );
  }
}
