import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductData {
  id: number;
  name: string;
  price: number;
  category: string;
  location: string;
  image: string;
  rating: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = 'https://localhost:7181/api/Product';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<ProductData[]> {
    return this.http.get<ProductData[]>(this.apiUrl);
  }
}