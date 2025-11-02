import { Injectable, signal } from '@angular/core';
import { Observable, Subject, catchError, of, tap, throwError } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SortEvent } from '../shared/sortable.directive';
import { environment } from 'src/environments/environment';
import { ProductDTO, CategoryDTO, MeasuringType } from '../shared/dto';
import { Product } from './product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = environment.apiBaseUrl;
  productSource = signal<ProductDTO | null>(null);
  productsUpdated = new Subject<void>();
  private categories: CategoryDTO[] = [];
  private measuringTypes: MeasuringType[] = [];
  private categoriesLoaded = false;
  private measuringTypesLoaded = false;
  productEndpoint = `${this.apiUrl}/products`;
  categoryEndpoint = `${this.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  setProduct(product: ProductDTO) {
    console.log(product);
    this.productSource.update(() => product);
  }

  addProduct(product: Partial<Product>): Observable<any> {
    return this.http.post(`${this.productEndpoint}`, product).pipe(
      tap(() => this.productsUpdated.next()),
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }
  getAllProducts(): Observable<any> {
    return this.http.get(`${this.productEndpoint}/all`);
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
    return this.http.get<any>(`${this.productEndpoint}`, { params });
  }

  deleteProduct(productId: number): Observable<any> {
    return this.http.delete(`${this.productEndpoint}/id/${productId}`).pipe(
      tap(() => this.productsUpdated.next()),
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }

  updateProduct(
    productId: number,
    updatedProduct: Partial<ProductDTO>
  ): Observable<any> {
    return this.http
      .put(`${this.productEndpoint}/id/${productId}`, updatedProduct)
      .pipe(
        tap(() => this.productsUpdated.next()),
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }

  getCategories(): Observable<any> {
    return this.http.get<CategoryDTO[]>(`${this.categoryEndpoint}`);
  }

  getMeasuringTypes(): Observable<any> {
    return this.http.get<any>(`${this.productEndpoint}/measuring-types`);
  }
}
