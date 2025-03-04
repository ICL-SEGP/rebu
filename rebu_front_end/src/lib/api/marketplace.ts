import { API_BASE_URL } from "@/lib/constants";
import { Product, Review, Purchase } from "@/types/app";

// 📌 Get all marketplace products
export async function getMarketplaceProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/marketplace/products`, {
    method: "GET",
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }
  return response.json();
}

//Fetches only the products created by the logged-in affiliate.
export async function getAffiliateProducts(token: string): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/marketplace/products`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch affiliate products: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching affiliate products:", error);
    return []; // Return an empty array if the request fails
  }
}


// 📌 Add or update a product (Seller only)
export async function saveProduct(token: string, product: Product): Promise<Product> {
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
export async function deleteProduct(token: string, productId: number) {
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
export async function getReviews(productId: number): Promise<Review[]> {
  const response = await fetch(`${API_BASE_URL}/marketplace/products/${productId}/reviews`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch reviews: ${response.statusText}`);
  }
  return response.json();
}

// 📌 Delete a review (Seller only)
export async function deleteReview(token: string, reviewId: number) {
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

// 📌 Create a new purchase (Buyer purchase)
export async function createPurchase(token: string, order: Partial<Purchase>): Promise<Purchase> {
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

// 📌 Get user purchases (For buyers)
export async function getUserPurchases(token: string, userId: number): Promise<Purchase[]> {
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

export async function uploadProductFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/marketplace/upload-file`, {
      method: "POST",
      body: formData,
  });

  if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
  }

  const data = await response.json();
  return data.fileUrl; // Backend should return the generated URL
}
  
  
  // 📌 Get a single product by ID (For Buyers)
export async function getSingleProduct(productId: number): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/marketplace/products/${productId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }
    return response.json();
  }
  
  async function updateProductStatus(productId: number, newStatus: ProductStatus) {
    await fetch(`/api/products/${productId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
      headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json" },
    });
  }