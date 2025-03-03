"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/helpers/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/helpers/card";
import { Input } from "@/components/ui/forms/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/modals/dialog";
import { StarIcon } from "lucide-react";
import { MarketplaceOrder, Product, Review } from "@/types/app";
import { getUserOrders, getSingleProduct, saveReview } from "@/lib/api/marketplace";

// Simulate authentication (Replace with actual auth context)
const user = { id: 999, token: "USER_AUTH_TOKEN" }; // Get actual user from auth context

export default function OrderHistory() {
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      try {
        setLoading(true);
        const fetchedOrders = await getUserOrders(user.token, user.id);
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Order History</h1>
      <p className="text-gray-600">Track your marketplace purchases.</p>

      {loading ? (
        <p className="text-gray-500">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: MarketplaceOrder }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchProductDetails() {
      try {
        setLoading(true);
        const productData = await getSingleProduct(order.productId);
        setProduct(productData);
        setReviews(productData.reviews || []);
      } catch (error) {
        console.error("Failed to fetch product details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProductDetails();
  }, [order.productId]);

  const handleAddReview = async () => {
    if (!newReview.trim() || !product) return;
    const review: Review = {
      id: Date.now().toString(),
      userId: order.buyerId,
      productId: product.id,
      rating,
      comment: newReview,
      createdAt: new Date(),
    };

    try {
      await saveReview(user.token, review);
      setReviews([...reviews, review]); // Update UI after backend confirmation
      setNewReview("");
      setReviewDialogOpen(false);
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("Failed to submit review. Try again.");
    }
  };

  return (
    <Card className="shadow-lg rounded-xl overflow-hidden transition-all hover:shadow-2xl">
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-semibold">Order #{order.id}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-sm text-gray-600">Total: {order.totalAmount} Tokens</p>
        <p className="text-sm text-gray-600">Status: {order.status}</p>

        {loading ? (
          <p className="text-gray-500">Loading product details...</p>
        ) : product ? (
          <>
            <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover rounded-md" />
            <p className="text-lg font-semibold">{product.name}</p>
            <p className="text-sm text-gray-600">{product.description}</p>

            {/* 🔹 Reviews Section */}
            <h3 className="mt-4 font-semibold">Reviews:</h3>
            <div className="space-y-2">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
                    <p className="text-sm">{review.comment}</p>
                    <div className="flex items-center space-x-1">
                      {Array(review.rating)
                        .fill(null)
                        .map((_, i) => (
                          <StarIcon key={i} size={14} className="text-yellow-500" />
                        ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No reviews yet.</p>
              )}
            </div>

            {/* 🔹 Add Review (Only if Order is Completed) */}
            {order.status === "COMPLETED" && (
              <>
                <Button variant="outline" onClick={() => setReviewDialogOpen(true)} className="mt-4">
                  Leave a Review
                </Button>
                <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                  <DialogContent>
                    <DialogTitle>Leave a Review</DialogTitle>
                    <div className="space-y-2">
                      <select className="border p-2 rounded-lg w-full" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                        {[5, 4, 3, 2, 1].map((r) => (
                          <option key={r} value={r}>
                            {r} Stars
                          </option>
                        ))}
                      </select>
                      <Input type="text" placeholder="Write your review..." value={newReview} onChange={(e) => setNewReview(e.target.value)} />
                      <Button onClick={handleAddReview}>Submit Review</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </>
        ) : (
          <p className="text-gray-500">Product not found.</p>
        )}
      </CardContent>
    </Card>
  );
}
