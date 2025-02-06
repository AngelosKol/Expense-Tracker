import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { Transaction } from '../../transaction/transaction.model';
import { AnalyticsService } from '../analytics.service';
import { TransactionChartService } from './transaction-chart.service';
import { Subscription } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  standalone: true,
  selector: 'app-transaction-chart',
  templateUrl: './transaction-chart.component.html',
  imports: [BaseChartDirective],
})
export class TransactionChartComponent implements OnInit {
  chartMode: String;
  transactions: Transaction[];
  private subscriptions: Subscription = new Subscription();
  public barChartData: ChartData<'bar'>;
  public barChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 16,
            weight: 'bold',
          },
        },
      },
    },
  };
  public barChartLabels: string[] = [];
  destroyRef = inject(DestroyRef);

  constructor(
    private analyticsService: AnalyticsService,
    private chartService: TransactionChartService
  ) {}

  ngOnInit() {
    const currentYear = new Date().getFullYear().toString();
    this.subscriptions.add(
      this.chartService.chartDatas$.subscribe((data) => {
        this.updateChartData(data);
      })
    );

    this.subscriptions.add(
      this.analyticsService.getYearTotalSpent(currentYear).subscribe({
        next: (data) => {
          this.chartService.setChartData(data);
        },
      })
    );
    this.destroyRef.onDestroy(() => this.subscriptions.unsubscribe());
  }

  private updateChartData(data: any) {
    let accumulatedValues;
    if (!data) {
      return;
    }
    if (data.length === 0) {
      this.barChartData = {
        labels: [],
        datasets: [
          {
            data: [],
            label: 'No results',
          },
        ],
      };
      return;
    }

    if (data[0].date) {
      const dateOptions: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
      };
      accumulatedValues = data.reduce(
        (acc, curr) => {
          let formatedDate = new Intl.DateTimeFormat(
            'en-GB',
            dateOptions
          ).format(new Date(curr.date));
          acc.labels.push(`${formatedDate} - ${curr.shop}`);
          acc.totals.push(curr.cost);
          return acc;
        },
        { labels: [], totals: [] }
      );
    } else if (data[0].monthName) {
      accumulatedValues = data.reduce(
        (acc, curr) => {
          acc.labels.push(curr.monthName);
          acc.totals.push(curr.totalSpent);
          return acc;
        },
        { labels: [], totals: [] }
      );
    }

    this.barChartData = {
      labels: accumulatedValues.labels,
      datasets: [
        {
          data: accumulatedValues.totals,
          label: 'Money Spent',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  }
}
