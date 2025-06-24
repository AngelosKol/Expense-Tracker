export interface ProductDTO {
  id: number;
  name: string;
  categoryName: string;
  categoryId: number;
}

export interface ProductDetailsDTO {
  productId: number;
  price: number;
  quantity: number;
}
