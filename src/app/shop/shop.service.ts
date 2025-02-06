import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, catchError, tap } from 'rxjs';
import { Shop } from './shop.model';

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  private shopSource = new BehaviorSubject<Shop | null>(null);
  currentShop = this.shopSource.asObservable();
  shopsUpdated = new Subject<void>();
  apiRoot = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) {}

  setShop(shop: Shop) {
    this.shopSource.next(shop);
  }

  getShops(size: number, page: number): Observable<any> {
    return this.http.get(`${this.apiRoot}/shops?size=${size}&page=${page - 1}`);
  }

  getAllShops(): Observable<any> {
    return this.http.get(`${this.apiRoot}/shops/all`);
  }

  addShop(shop: Shop): Observable<any> {
    return this.http.post(`${this.apiRoot}/shops`, shop).pipe(
      tap(() => this.shopsUpdated.next()),
      catchError((err) => {
        // console.log("Error adding shop", err)
        throw err;
      })
    );
  }

  updateShop(shopId: number, updatedShop: Partial<Shop>): Observable<any> {
    return this.http
      .put(`${this.apiRoot}/shops/id/${shopId}`, updatedShop)
      .pipe(
        tap(() => this.shopsUpdated.next()),
        catchError((err) => {
          console.log('Error updating shop', err);
          throw err;
        })
      );
  }

  deleteShop(shopId: number): Observable<any> {
    return this.http.delete(`${this.apiRoot}/shops/id/${shopId}`).pipe(
      tap(() => this.shopsUpdated.next()),
      catchError((err) => {
        // console.log("Error deleting Shop", err)
        throw err;
      })
    );
  }
}
