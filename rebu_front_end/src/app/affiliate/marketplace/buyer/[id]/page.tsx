"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/helpers/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/modals/dialog";
import { StarIcon, ShoppingCartIcon, ChevronRight } from "lucide-react";
import { Product } from "@/types/app";

const dummyProducts: Product[] = [
  {
    id: "1",
    name: "Crypto Hoodie",
    description: "A premium hoodie for blockchain lovers. Stay warm and stylish while showing your love for blockchain technology.",
    price: 50,
    imageUrl: "https://picsum.photos/200/300",
    category: "Clothing",
    status: "ACTIVE",
    createdAt: new Date(),
    sellerId: 101,
    reviews: [
      { id: "r1", userId: 201, productId: "1", rating: 5, comment: "Super comfortable!", createdAt: new Date() },
      { id: "r2", userId: 202, productId: "1", rating: 4, comment: "Great design, a bit expensive.", createdAt: new Date() },
    ],
  },
];

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);

  useEffect(() => {
    const foundProduct = dummyProducts.find((p) => p.id === id);
    if (foundProduct) setProduct(foundProduct);
  }, [id]);

  if (!product) return <div className="p-8 text-center">Product not found</div>;

  // 🔹 Calculate Average Rating
  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  return (
    <div className="p-8 flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
      {/* Left - Product Image */}
      <div className="flex flex-col items-center w-full md:w-1/3">
        <img src={product.imageUrl} alt={product.name} className="w-full max-w-md rounded-lg shadow-lg" />
      </div>

      {/* Right - Product Details */}
      <div className="w-full md:w-2/3 space-y-4">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        
        {/* ⭐ Average Rating (Clickable) */}
        <div 
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 cursor-pointer underline transition"
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
          <p className="line-clamp-3">{product.description}</p>
        </div>

        <p className="text-xl font-bold text-green-600">{product.price} Tokens</p>

        {/* 🔹 Buy Button */}
        <Button variant="default" className="w-full">
          <ShoppingCartIcon size={16} className="mr-2" /> Buy Now
        </Button>
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
