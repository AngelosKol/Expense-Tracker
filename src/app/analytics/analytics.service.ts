import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AnalyticsDTO, MonthCostDTO, YearCostsDTO } from '../shared/dto';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getTotalSpent(fromDate: string, toDate: string): Observable<AnalyticsDTO[]> {
    return this.http.get<AnalyticsDTO[]>(
      `${this.apiUrl}/analytics/${fromDate}/to/${toDate}`
    );
  }

  getYearTotalSpent(year: string): Observable<YearCostsDTO[]> {
    return this.http.get<YearCostsDTO[]>(
      `${this.apiUrl}/analytics/totalSpent/year/${year}`
    );
  }

  getMonthTotalSpent(year: string, month: string): Observable<MonthCostDTO[]> {
    return this.http.get<MonthCostDTO[]>(
      `${this.apiUrl}/analytics/totalSpent/year/${year}/month/${month}`
    );
  }
}
