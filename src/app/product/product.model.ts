export class Product {
  public id: number;
  public name: string;
  public quantity: number;
  public price: number;

  constructor(name: string) {
    this.name = name;
  }
}
