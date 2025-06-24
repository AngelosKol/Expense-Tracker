export interface AnalyticsDTO {
  shopName: string;
  transactionDate: string;
  totalSpent: number;
}

export interface MonthCostDTO {
  date: string;
  shop: string;
  cost: number;
}

export interface YearCostsDTO {
  monthName: string;
  totalSpent: number;
}
