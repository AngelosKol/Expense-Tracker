import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, catchError, tap } from 'rxjs';
import { Shop } from './shop.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  private shopSource = new BehaviorSubject<Shop | null>(null);
  currentShop = this.shopSource.asObservable();
  shopsUpdated = new Subject<void>();
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  setShop(shop: Shop) {
    this.shopSource.next(shop);
  }

  getShops(size: number, page: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/shops?size=${size}&page=${page - 1}`);
  }

  getAllShops(): Observable<any> {
    return this.http.get(`${this.apiUrl}/shops/all`);
  }

  addShop(shop: Shop): Observable<any> {
    return this.http.post(`${this.apiUrl}/shops`, shop).pipe(
      tap(() => this.shopsUpdated.next()),
      catchError((err) => {
        // console.log("Error adding shop", err)
        throw err;
      })
    );
  }

  updateShop(shopId: number, updatedShop: Partial<Shop>): Observable<any> {
    return this.http.put(`${this.apiUrl}/shops/id/${shopId}`, updatedShop).pipe(
      tap(() => this.shopsUpdated.next()),
      catchError((err) => {
        console.log('Error updating shop', err);
        throw err;
      })
    );
  }

  deleteShop(shopId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/shops/id/${shopId}`).pipe(
      tap(() => this.shopsUpdated.next()),
      catchError((err) => {
        // console.log("Error deleting Shop", err)
        throw err;
      })
    );
  }
}
