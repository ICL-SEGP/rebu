"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/helpers/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/modals/dialog";
import { StarIcon, ShoppingCartIcon, ChevronRight } from "lucide-react";
import { Product } from "@/types/app";
import { createPurchase, getSingleProduct } from "@/lib/api/marketplace";


export default function ProductPage() {
  const { data: session } = useSession();
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);




  if (!session) {
    throw new Error("No user logged in.");
  }

  /**
   * Fetch product data from the backend.
   * TODO: Replace dummy data with actual backend fetch
   */
  useEffect(() => {
    async function fetchProductData() {
      try {
        // TODO: Uncomment when backend is ready
        // const fetchedProduct = await getSingleProduct(Number(id));
        // setProduct(fetchedProduct);

        // Dummy data for now - Replace with backend API
        const dummyProducts: Product[] = [
          {
            id: 1,
            name: "Crypto Hoodie",
            desc: "A premium hoodie for blockchain lovers. Stay warm and stylish while showing your love for blockchain technology.",
            price: 50,
            imageUrl: "https://picsum.photos/200/300",
            category: { name: "Ebooks", imageUrl: new URL("https://example.com/category.png") },
            status: "active",
            createdAt: new Date(),
            sellerId: 101,
            reviews: [
              { id: 1, userId: 201, productId: 1, rating: 5, comment: "Super comfortable!", createdAt: "" },
              { id: 2, userId: 202, productId: 1, rating: 4, comment: "Great design, a bit expensive.", createdAt: "" },
            ],
          },
        ];

        const foundProduct = dummyProducts.find((p) => p.id === Number(id));
        if (foundProduct) setProduct(foundProduct);
      } catch (error) {
        console.error("Failed to fetch product data", error);
      }
    }

    fetchProductData();
  }, [id]);

  if (!product) return <div className="p-8 text-center">Product not found</div>;


  // 🔹 Calculate Average Rating
  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  // 🔹 Handle Buy Now Purchase
  const handleBuyNow = async () => {
    if (!session) {
      alert("You need to log in to make a purchase.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = session.accessToken; // Ensure token is available
      const orderData = {
        productId: product.id,
        userId: session.user.id, 
        amount: product.price, // Price in tokens
      };

      const response = await createPurchase(token, orderData);
      alert(`Purchase successful! Order ID: ${response.id}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

   // 🔹 Determine Buy Button State
   const isBuyable = product.status === "active";


       return (
        <div className="p-8 flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
          {/* Left - Product Image */}
          <div className="w-full md:w-1/3 flex justify-center">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full max-w-md rounded-lg shadow-lg"
            />
          </div>
      
          {/* Right - Product Details */}
          <div className="w-full md:w-2/3 flex flex-col space-y-4">      
            {/* Product Name & Status */}
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold">{product.name}</h1>
      
              {/* Status Badge */}
              <span
                className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full
                  ${
                    product.status === "active"
                      ? "bg-green-100 text-green-700"
                      : product.status === "scheduled"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
              >
                {product.status.replace("_", " ")}
              </span>
            </div>
      
            {/* ⭐ Average Rating (Clickable) */}
            <div 
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 cursor-pointer transition"
              onClick={() => setReviewModalOpen(true)}
            >
              <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    size={20}
                    className={i < Math.round(averageRating) ? "text-yellow-500" : "text-gray-300"}
                    fill={i < Math.round(averageRating) ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <span className="text-sm">{`(${product.reviews.length} reviews)`}</span>
              <ChevronRight size={18} />
            </div>
      
            {/* 📌 Standardized Description Box */}
            <div className="max-h-20 overflow-hidden relative text-gray-700">
              <p className="line-clamp-3">{product.desc}</p>
            </div>
      
            <p className="text-xl font-bold text-green-600">{product.price} Tokens</p>
      
           {/* 🔹 TODO: Buy Button with API Integration */}
            {isBuyable ? (
              <Button 
                variant="default" 
                className="w-full" 
                onClick={handleBuyNow} 
                disabled={loading}
              >
                {loading ? "Processing..." : (
                  <>
                    <ShoppingCartIcon size={16} className="mr-2" /> Buy Now
                  </>
                )}
              </Button>
            ) : (
              <div className="w-full p-3 bg-gray-200 text-gray-600 text-center rounded-md">
                This product is unavailable.
              </div>
            )}

            {/* Show error message if purchase fails */}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
      
         {/* 🔹 Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="max-w-lg p-0 rounded-lg flex flex-col">
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            <DialogTitle>Customer Reviews</DialogTitle>

            {product.reviews.length > 0 ? (
              product.reviews.map((review) => (
                <div key={review.id} className="bg-gray-100 p-3 rounded-lg my-2">
                  <p className="text-sm">{review.comment}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        size={14}
                        className={i < review.rating ? "text-yellow-500" : "text-gray-300"}
                        fill={i < review.rating ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No reviews yet.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}