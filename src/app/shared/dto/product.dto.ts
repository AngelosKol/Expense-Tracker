export interface ProductDTO {
  id: number;
  name: string;
  categoryName: string;
  categoryId: number;
  measuringType: number;
}

export interface ProductDetailsDTO {
  productId: number;
  price: number;
  quantity: number;
}
