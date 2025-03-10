"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Purchase, Product, OrderStatus, Review } from "@/types/types";
import {
  deleteReview,
  getPurchases,
  getReviewsForProduct,
  saveReview,
} from "@/lib/api/marketplace";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/ui/star-rating";
import { StarIcon, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

const PurchaseHistory = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null
  );
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");

  const {
    data: purchases,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["purchases"],
    queryFn: () => getPurchases(session!.accessToken),
    enabled: !!session?.accessToken,
  });

  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [session, router]);

  const handleOpenModal = async (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsModalOpen(true);
    const fetchedReviews = await getReviewsForProduct(
      session?.accessToken,
      purchase.product.id
    );
    console.log(fetchedReviews);
    setReviews(fetchedReviews.reviews || []);
  };

  const handleOpenReviewModal = async (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedPurchase) return;
    console.log(selectedPurchase);

    const newReview: Review = {
      productId: selectedPurchase.product.id,
      rating,
      comment,
    };

    try {
      await saveReview(session?.accessToken || "", newReview);
      setReviews([...reviews, newReview]);
      setIsReviewModalOpen(false);
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const handleDeleteReview = async (delReview) => {
    try {
      console.log(delReview);
      await deleteReview(session?.accessToken, delReview.id); // Replace deleteReview with your actual API call

      // Update the reviews state
      setReviews(reviews.filter((review) => review.id !== delReview.id));

      // Optional: Show a success message
      toast.success("Review deleted successfully.");
    } catch (error) {
      console.error("Error deleting review:", error);
      // Optional: Show an error message to the user
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading purchase history.</div>;
  if (!purchases) return <div>No purchases found.</div>;

  return (
    <div className="container mx-auto p-6">
      <Card className="shadow-md border border-gray-200">
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-xl font-bold">Purchase History</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead>Review</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>{purchase.product?.name}</TableCell>
                  <TableCell>
                    {parseFloat(purchase.product?.price.toString()).toFixed(2)}
                  </TableCell>
                  <TableCell>{purchase.status}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleOpenModal(purchase)}
                      className="bg-black text-white"
                    >
                      View Details
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleOpenReviewModal(purchase)}
                      className="bg-gray-700 text-white"
                    >
                      {reviews.some((r) => r.productId === purchase.product?.id)
                        ? "Edit Review"
                        : "Leave Review"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase Details</DialogTitle>
          </DialogHeader>
          {selectedPurchase ? (
            <div className="space-y-4">
              <img
                src={selectedPurchase.product.imageUrls[0]}
                alt={selectedPurchase.product.name}
                className="w-full h-64 object-cover rounded-md"
              />
              <div>
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedPurchase.product.name}
                  </h2>
                  <Link
                    href={`/marketplace/product/${selectedPurchase.product.id}`}
                    passHref
                  >
                    <span className="text-sm text-blue-600 hover:underline flex items-center gap-1 cursor-pointer mt-1">
                      View Product <ExternalLink size={14} />
                    </span>
                  </Link>
                </div>
                <p className="text-gray-700">{selectedPurchase.product.desc}</p>
              </div>
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Price:</strong> {selectedPurchase.product.price} token
                </p>
                <p>
                  <strong>Seller ID:</strong>{" "}
                  {selectedPurchase.product.sellerId}
                </p>
                <p>
                  <strong>Purchase Date:</strong>{" "}
                  {selectedPurchase.orderDate
                    ? new Date(selectedPurchase.orderDate).toDateString()
                    : "N/A"}
                </p>
                <p>
                  <strong>Status:</strong> {selectedPurchase.status}
                </p>
              </div>
              <a
                href={selectedPurchase.product.fileUrl}
                download
                className="block"
              >
                <Button className="w-auto bg-black text-white py-1 px-3 rounded-md hover:bg-gray-800 transition">
                  Download File ({selectedPurchase.product.fileType})
                </Button>
              </a>
              <div>
                <h3 className="text-md font-semibold text-gray-900">
                  Your Reviews
                </h3>
                <div className="space-y-3 mt-2">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-gray-50 p-3 rounded-lg flex flex-col shadow-sm"
                      >
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-800">
                            {review.comment}
                          </p>
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <StarIcon
                                key={i}
                                size={14}
                                className={
                                  i < review.rating
                                    ? "text-yellow-500"
                                    : "text-gray-300"
                                }
                                fill={
                                  i < review.rating ? "currentColor" : "none"
                                }
                                stroke={
                                  i < review.rating ? "currentColor" : "gray"
                                }
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={() => handleDeleteReview(review)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Delete Review
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No reviews yet.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p>Loading details...</p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <StarRating value={rating} onChange={setRating} />
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your review..."
            />
            <Button
              onClick={handleSubmitReview}
              className="w-full bg-black text-white"
            >
              Submit Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseHistory;
