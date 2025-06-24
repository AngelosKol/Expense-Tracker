export interface TransactionDTO {
  id: number;
  shopName: string;
  date: string; // ISO date string format
}

export interface TransactionDetailsDTO {
  name: string;
  price: number;
  quantity: number;
}
