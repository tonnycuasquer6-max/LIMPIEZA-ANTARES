export interface Product {
  id: string;
  name: string;
  category: 'Joya' | 'Ropa';
  price: number;
  stock: number;
  image_url: string;
  custom_options: Record<string, any>;
}
