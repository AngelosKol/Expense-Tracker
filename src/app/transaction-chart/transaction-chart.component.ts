import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { Transaction } from '../transactions/transaction.model';
import { AnalyticsService } from '../analytics/analytics.service';
import { TransactionChartService } from './transaction-chart.service';
import { Subscription } from 'rxjs';


type AnalyticsData = {
  [key: number]: any[];
};

@Component({
  selector: 'app-transaction-chart',
  templateUrl: './transaction-chart.component.html',
})
export class TransactionChartComponent  implements OnInit{
  chartMode : String
  transactions : Transaction[];
  private subscriptions : Subscription = new Subscription();
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
    //   y: {
    //     beginAtZero: true,
    //     title: {
    //       display: true,
    //       text: 'Total Spent',
    //       font: {
    //         size: 16,
    //         weight: 'bold',
    //       },
    //     },
    //   },
    // },
    // plugins: {
    //   legend: {
    //     display: true,
    //     labels: {
    //       font: {
    //         size: 14,
    //       },
    //     },
    //   },
    },

  };
  public barChartLabels: string[] = [];

  constructor(private analyticsService: AnalyticsService, private chartService : TransactionChartService) {}


  ngOnInit(){
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear().toString()
    this.chartService.chartDatas$.subscribe((data)=>{
      this.updateChartData(data)      
    })




    this.analyticsService.getMonthTotalSpent(currentYear, currentMonth).subscribe({
      next: (data) =>{
        this.chartService.setChartData(data)
      }
    })
    

  


  }

  private updateChartData(data: any[]) {
    if (!data) {
      return;
    }
  
    const accumulatedValues = data.reduce((acc, curr) => {
      if (curr[1] !== null) { 
        if (data[0].length > 2) {
          acc.labels.push(`${curr[0].replace(' ', '-')}  ${curr[1]}`);
          acc.totals.push(curr[2]);
        } else {
          acc.labels.push(curr[0]);
          acc.totals.push(curr[1]);
        }
      }
      return acc;
    }, { labels: [], totals: [] });
  
  
    this.barChartLabels = accumulatedValues.labels;
    this.barChartData = {
      labels: this.barChartLabels,
      datasets: [
        {
          data: accumulatedValues.totals,
          label: 'Money Spent',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };
  }
  




  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

    



}
