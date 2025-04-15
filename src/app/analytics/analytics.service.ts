import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getTotalSpent(fromDate: String, toDate: String): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/${fromDate}/to/${toDate}`);
  }

  getYearTotalSpent(year: String) {
    return this.http.get(`${this.apiUrl}/analytics/totalSpent/year/${year}`);
  }

  getMonthTotalSpent(year: string, month: string) {
    return this.http.get(
      `${this.apiUrl}/analytics/totalSpent/year/${year}/month/${month}`
    );
  }
}
