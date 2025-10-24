export interface TransactionDTO {
  id: number;
  shopName: string;
  date: string;
}

export interface TransactionDetailsDTO {
  transactionDetailsId: number;
  productName: string;
  price: number;
  quantity: number;
  unitCount: number;
}
