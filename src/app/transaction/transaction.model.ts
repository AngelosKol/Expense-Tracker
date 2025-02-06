
export class Transaction {
    public id: number;
    public date: string;
    public shopName: string
    constructor(date: string, shopName: string  ) {
      this.date = date;
      this.shopName = shopName
    }

    
  }