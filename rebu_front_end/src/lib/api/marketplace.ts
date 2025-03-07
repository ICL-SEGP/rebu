import { API_BASE_URL } from "@/lib/constants";
import { Product, Review, Purchase, Category, toProduct } from "@/types/app";
import axios from "axios";
import humps from "humps";
import { processFile } from "./aws";

// // 📌 Get all marketplace products
// export async function getMarketplaceProducts(): Promise<Product[]> {
//   const response = await fetch(`${API_BASE_URL}/marketplace/products`, {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//   });

//   if (!response.ok) {
//     throw new Error(`Failed to fetch products: ${response.statusText}`);
//   }
//   return response.json();
// }

// //Fetches only the products created by the logged-in affiliate.
// export function getProducts(token: string): Promise<Product[]> {
//   return fetch(`${API_BASE_URL}/products`, {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//   })
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error(
//           `Failed to fetch affiliate products: ${response.statusText}`
//         );
//       }
//       return response.json();
//     })
//     .then(async (productsData: any[]) => {
//       // Make this .then async
//       const processedProducts = await Promise.all(
//         productsData.map(async (productData) => {
//           productData = humps.camelizeKeys(productData);
//           productData.imageUrls = await processFile(productData.imageUrl);
//           console.log("processed urls", productData.imageUrl);
//           return productData; // Return the processed data
//         })
//       );
//       return processedProducts.map((productData) => toProduct(productData)); // Synchronously map to Product
//     })
//     .catch((error) => {
//       console.error("Error fetching affiliate products:", error);
//       return [];
//     });
// }



export function makePurchase(token: string, id: string): Promise<Product> {
  return fetch(`${API_BASE_URL}/products/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to fetch affiliate products: ${response.statusText}`
        );
      }
      return response.json();
    })
    .then((product) => toProduct(product))
    .catch((error) => {
      console.error("Error fetching seller's products:", error);
      return [];
    });
}

export function getProductById(token: string, id: string): Promise<Product> {
  return fetch(`${API_BASE_URL}/products/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to fetch affiliate products: ${response.statusText}`
        );
      }
      return response.json();
    })
    .then((product) => toProduct(product))
    .catch((error) => {
      console.error("Error fetching seller's products:", error);
      return [];
    });
}

export function getProducts(token: string): Promise<Product[]> {
  return fetch(`${API_BASE_URL}/products`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to fetch affiliate products: ${response.statusText}`
        );
      }
      return response.json();
    })
    .then((productsData: any[]) =>
      productsData.map((productData) => toProduct(productData))
    )
    .catch((error) => {
      console.error("Error fetching seller's products:", error);
      return [];
    });
}

export function getAllProducts(token: string): Promise<Product[]> {
  return fetch(`${API_BASE_URL}/products/all`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch all products: ${response.statusText}`);
      }
      return response.json();
    })
    .then((productsData: any[]) =>
      productsData.map((productData) => toProduct(productData))
    )
    .catch((error) => {
      console.error("Error fetching affiliate products:", error);
      return [];
    });
}

export async function getCategories(token: string): Promise<Category[]> {
  return fetch(`${API_BASE_URL}/category`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch Orders: ${response.statusText}`);
      }
      return response.json();
    })
    .then((categories) =>
      categories.map((category: any) => humps.camelizeKeys(category))
    )
    .catch((error) => {
      console.error("Error fetching categories:", error);
      return [];
    });
}

// // 📌 Add or update a product (Seller only)
export function saveProduct(token: string, product: Product): Promise<Product> {
  return fetch(`${API_BASE_URL}/products/${product.id || ""}`, {
    method: product.id ? "PATCH" : "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ product: humps.decamelizeKeys(product) }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to save product: ${response.statusText}`);
    }
    return response.json();
  });
}

export function addNewCategory(token: string, category: Category) {
  return fetch(`${API_BASE_URL}/category`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ category: humps.decamelizeKeys(category) }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to create category: ${response.statusText}`);
    }
    return response.json();
  });
}

const UNSPLASH_ACCESS_KEY = "TPFS6bS1JKJaCrphzZHJUUwGigQ1ClvFPZhfUKbi-nY";

export const fetchCategoryImage = async (
  categoryName: string
): Promise<string> => {
  try {
    const response = await axios.get("https://api.unsplash.com/search/photos", {
      params: { query: categoryName, per_page: 1 },
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
    });

    return response.data.results[0]?.urls?.regular || "/fallback-category.jpg";
  } catch (error) {
    console.error(`Error fetching image for ${categoryName}:`, error);
    return "/fallback-category.jpg"; // Fallback image if API fails
  }
};

export const fetchCategoryImageFile = async (
  categoryName: string
): Promise<File | null> => {
  try {
    const response = await axios.get("https://api.unsplash.com/search/photos", {
      params: { query: categoryName, per_page: 1 },
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
    });

    const imageUrl = response.data.results[0]?.urls?.regular;

    if (!imageUrl) {
      console.warn(`No image found for category: ${categoryName}`);
      return null;
    }

    const imageResponse = await axios.get(imageUrl, {
      responseType: "blob",
    });

    const imageBlob: Blob = imageResponse.data;

    // Create a File object from the Blob
    const fileName = `${categoryName}.jpg`; // You might need to determine the correct file extension
    const imageFile = new File([imageBlob], fileName, { type: "image/jpeg" }); // Adjust type if needed

    return imageFile;
  } catch (error) {
    console.error(`Error fetching image for ${categoryName}:`, error);
    return null;
  }
};

// // 📌 Delete a product (Seller only)
// export async function deleteProduct(token: string, productId: number) {
//   const response = await fetch(`${API_BASE_URL}/marketplace/products/${productId}`, {
//     method: "DELETE",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//   });

//   if (!response.ok) {
//     throw new Error(`Failed to delete product: ${response.statusText}`);
//   }
// }

// // 📌 Get product reviews
// export async function getReviews(productId: number): Promise<Review[]> {
//   const response = await fetch(`${API_BASE_URL}/marketplace/products/${productId}/reviews`, {
//     method: "GET",
//     headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", },
//   });

//   if (!response.ok) {
//     throw new Error(`Failed to fetch reviews: ${response.statusText}`);
//   }
//   return response.json();
// }

// // 📌 Delete a review (Seller only)
// export async function deleteReview(token: string, reviewId: number) {
//   const response = await fetch(`${API_BASE_URL}/marketplace/reviews/${reviewId}`, {
//     method: "DELETE",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//   });

//   if (!response.ok) {
//     throw new Error(`Failed to delete review: ${response.statusText}`);
//   }
// }

// // 📌 Create a new purchase (Buyer purchase)
// export async function createPurchase(token: string, order: Partial<Purchase>): Promise<Purchase> {
//   const response = await fetch(`${API_BASE_URL}/marketplace/orders`, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(order),
//   });

//   if (!response.ok) {
//     throw new Error(`Failed to create order: ${response.statusText}`);
//   }
//   return response.json();
// }

// // 📌 Get user purchases (For buyers)
// export async function getUserPurchases(token: string, userId: number): Promise<Purchase[]> {
//   const response = await fetch(`${API_BASE_URL}/marketplace/orders/user/${userId}`, {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//   });

//   if (!response.ok) {
//     throw new Error(`Failed to fetch orders: ${response.statusText}`);
//   }
//   return response.json();
// }

// // 📌 Upload image and return URL (Seller only)
// export async function uploadProductImage(file: File): Promise<string> {
//     const formData = new FormData();
//     formData.append("file", file);

//     const response = await fetch(`${API_BASE_URL}/marketplace/upload`, {
//       method: "POST",
//       body: formData, // Send file as FormData
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to upload image: ${response.statusText}`);
//     }

//     const data = await response.json();
//     return data.imageUrl; // Backend should return the generated URL
//   }

// export async function uploadProductFile(file: File): Promise<string> {
//   const formData = new FormData();
//   formData.append("file", file);

//   const response = await fetch(`${API_BASE_URL}/marketplace/upload-file`, {
//       method: "POST",
//       body: formData,
//   });

//   if (!response.ok) {
//       throw new Error(`Failed to upload file: ${response.statusText}`);
//   }

//   const data = await response.json();
//   return data.fileUrl; // Backend should return the generated URL
// }

//   // 📌 Get a single product by ID (For Buyers)
// export async function getSingleProduct(productId: number): Promise<Product> {
//     const response = await fetch(`${API_BASE_URL}/marketplace/products/${productId}`, {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to fetch product: ${response.statusText}`);
//     }
//     return response.json();
//   }

//   async function updateProductStatus(productId: number, newStatus: ProductStatus) {
//     await fetch(`/api/products/${productId}/status`, {
//       method: "PATCH",
//       body: JSON.stringify({ status: newStatus }),
//       headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json" },
//     });
//   }

export async function deleteProduct(token: string, productId: number) {
  const response = await fetch(
    `${API_BASE_URL}/marketplace/products/${productId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete product: ${response.statusText}`);
  }
}

// 📌 Get product reviews
export async function getReviews(productId: number): Promise<Review[]> {
  const response = await fetch(
    `${API_BASE_URL}/marketplace/products/${productId}/reviews`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch reviews: ${response.statusText}`);
  }
  return response.json();
}

//Save Product Review in PurchaseHistory page (only buyers)
export async function saveReview(
  token: string,
  review: Review
): Promise<Review> {
  const response = await fetch(`${API_BASE_URL}/marketplace/reviews`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: review.userId,
      productId: review.productId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to save review: ${response.statusText}`);
  }

  return response.json();
}

// 📌 Delete a review (Buyer only)
export async function deleteReview(token: string, reviewId: number) {
  const response = await fetch(
    `${API_BASE_URL}/marketplace/reviews/${reviewId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete review: ${response.statusText}`);
  }
}
