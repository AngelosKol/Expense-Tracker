import { Injectable, signal } from '@angular/core';
import { Observable, Subject, catchError, of, tap } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SortEvent } from '../shared/sortable.directive';
import { environment } from 'src/environments/environment';
import { ProductDTO, CategoryDTO } from '../shared/dto';
import { Product } from './product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  productSource = signal<Product | null>(null);
  productsUpdated = new Subject<void>();
  private apiUrl = environment.apiBaseUrl;

  productEndpoint = `${this.apiUrl}/products`;
  categoryEndpoint = `${this.apiUrl}/categories`;
  private categories: CategoryDTO[] = [];
  private categoriesLoaded = false;
  constructor(private http: HttpClient) {}

  setProduct(product: Product) {
    this.productSource.update(() => product);
  }

  addProduct(product: Partial<Product>): Observable<any> {
    return this.http.post(`${this.productEndpoint}`, product).pipe(
      tap(() => this.productsUpdated.next()),
      catchError((err) => {
        // console.log('Error adding product',err)
        throw err;
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
        // console.log('Error deleting product',err)
        throw err;
      })
    );
  }

  updateProduct(
    productId: number,
    updatedProduct: Partial<ProductDTO>
  ): Observable<any> {
    console.log(
      `productID: ${productId} , ${updatedProduct.categoryName}. ${updatedProduct.categoryId}`
    );
    return this.http
      .put(`${this.productEndpoint}/id/${productId}`, updatedProduct)
      .pipe(
        tap(() => this.productsUpdated.next()),
        catchError((err) => {
          // console.log('Error updating product',err)
          throw err;
        })
      );
  }

  getCategories(): Observable<any> {
    if (this.categoriesLoaded) {
      return of(this.categories);
    }
    let params = new HttpParams().set('sort', 'name' + ',' + 'asc');

    return this.http
      .get<CategoryDTO[]>(`${this.categoryEndpoint}`, { params })
      .pipe(
        tap((categories: CategoryDTO[]) => {
          console.log(categories);
          this.categories = categories;
          this.categoriesLoaded = true;
        })
      );
  }
}
