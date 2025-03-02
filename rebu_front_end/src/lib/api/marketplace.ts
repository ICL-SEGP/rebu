import { API_BASE_URL } from "@/lib/constants";
import { Product, Review, MarketplaceOrder } from "@/types/app";

// 📌 Get all marketplace products
export async function getMarketplaceProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/marketplace/products`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }
  return response.json();
}

// 📌 Add or update a product (Seller only)
export async function saveProduct(token: string, product: Partial<Product>): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/marketplace/products/${product.id || ""}`, {
    method: product.id ? "PATCH" : "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    throw new Error(`Failed to save product: ${response.statusText}`);
  }
  return response.json();
}

// 📌 Delete a product (Seller only)
export async function deleteProduct(token: string, productId: string) {
  const response = await fetch(`${API_BASE_URL}/marketplace/products/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete product: ${response.statusText}`);
  }
}

// 📌 Get product reviews
export async function getReviews(productId: string): Promise<Review[]> {
  const response = await fetch(`${API_BASE_URL}/marketplace/products/${productId}/reviews`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch reviews: ${response.statusText}`);
  }
  return response.json();
}

// 📌 Delete a review (Seller only)
export async function deleteReview(token: string, reviewId: string) {
  const response = await fetch(`${API_BASE_URL}/marketplace/reviews/${reviewId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete review: ${response.statusText}`);
  }
}

// 📌 Create a new order (Buyer purchase)
export async function createOrder(token: string, order: Partial<MarketplaceOrder>): Promise<MarketplaceOrder> {
  const response = await fetch(`${API_BASE_URL}/marketplace/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(order),
  });

  if (!response.ok) {
    throw new Error(`Failed to create order: ${response.statusText}`);
  }
  return response.json();
}

// 📌 Get user orders (For buyers)
export async function getUserOrders(token: string, userId: number): Promise<MarketplaceOrder[]> {
  const response = await fetch(`${API_BASE_URL}/marketplace/orders/user/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch orders: ${response.statusText}`);
  }
  return response.json();
}

// 📌 Upload image and return URL (Seller only)
export async function uploadProductImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
  
    const response = await fetch(`${API_BASE_URL}/marketplace/upload`, {
      method: "POST",
      body: formData, // Send file as FormData
    });
  
    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.statusText}`);
    }
  
    const data = await response.json();
    return data.imageUrl; // Backend should return the generated URL
  }
  