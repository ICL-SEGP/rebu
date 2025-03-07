"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Purchase, Product, OrderStatus, Review } from "@/types/app";
import { getUserPurchases, getSingleProduct, getReviews, saveReview } from "@/lib/api/marketplace";
import { Button } from "@/components/ui/helpers/button";
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/tables/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/modals/dialog";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/helpers/card";
import { Textarea } from "@/components/ui/forms/textarea";
import { StarRating } from "@/components/ui/forms/star-rating";
import { StarIcon, ExternalLink } from "lucide-react";
import Link from "next/link"

const dummyPurchases: Purchase[] = [
  { id: 1, buyerId: 123, sellerId: 456, productId: 789, totalAmount: 49.99, orderDate: "", status: OrderStatus.COMPLETED },
  { id: 2, buyerId: 124, sellerId: 454, productId: 7894, totalAmount: 49.99, orderDate: "", status: OrderStatus.COMPLETED },
  { id: 3, buyerId: 125, sellerId: 455, productId: 7589, totalAmount: 495.99, orderDate: "", status: OrderStatus.COMPLETED },
];

const dummyProduct: Product = {
  id: 789,
  name: "Digital Art Pack",
  desc: "A collection of high-resolution digital artworks.",
  price: 49.99,
  imageUrls: ["/placeholder.png"],
  fileUrl: "https://example.com/download.zip",
  fileType: "zip",
  fileSize: 10485760,
  category: { name: "Art", imageUrl: new URL("https://example.com/category.png") },
  status: "active",
  createdAt: "",
  sellerId: 456,
  reviews: [],
  sellerPubKey: "abcdef123456",
};

const dummyReviews: Review[] = [
  { id: 1, userId: 123, productId: 789, rating: 5, comment: "Amazing artwork!", createdAt: "" },
  { id: 2, userId: 124, productId: 789, rating: 4, comment: "Very detailed, but could be improved.", createdAt: "" },
];

const PurchaseHistory = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [productDetails, setProductDetails] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }

    //TODO: getUserPurchases api call
  //   getUserPurchases(session.accessToken, Number(session.user.id))
  //     .then(setPurchases)
  //     .catch(console.error);
     setPurchases(dummyPurchases);
   }, [session, router]);

  const handleOpenModal = async (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsModalOpen(true);

    //TODO: fetch product details from backend
    // const product = await getSingleProduct(purchase.productId);
    // setProductDetails(product);
    setProductDetails(dummyProduct);

    //TODO: fetch product reviews from backend
    // const productReviews = await getReviews(purchase.productId);
    // setReviews(productReviews);
  };

  const handleOpenReviewModal = () => {
    setIsReviewModalOpen(true);
  };

  //TODO: delete this when backend integrated
  const handleSubmitReview = async () => {
    if (!selectedPurchase || !productDetails) return;

    const newReview: Review = {
      id: Math.random(),
      userId: Number(session?.user.id) || 0,
      productId: selectedPurchase.productId,
      rating,
      comment,
      createdAt: new Date(),
    };

    //TODO: Send review to backend
  // const handleSubmitReview = async () => {
  //   if (!selectedPurchase || !productDetails) return;

  //   const newReview: Review = {
  //     id: Math.random(),
  //     userId: Number(session?.user.id) || 0,
  //     productId: selectedPurchase.productId,
  //     rating,
  //     comment,
  //     createdAt: "",
  //   };

    try {
      await saveReview(session?.accessToken || "", newReview);
      setReviews([...reviews, newReview]); // Update UI immediately
      setIsReviewModalOpen(false);
    } catch (error) {
      console.error("Error submitting review:", error);
    }

    //TODO: delete these when backend integrated
    setReviews([...reviews, newReview]); // Simulate API response
    setIsReviewModalOpen(false);
  };

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
                  <TableCell>{purchase.productId}</TableCell>
                  <TableCell>${purchase.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>{purchase.status}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleOpenModal(purchase)} className="bg-black text-white">
                      View Details
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button onClick={handleOpenReviewModal} className="bg-gray-700 text-white">
                      {reviews.some((r) => r.productId === purchase.productId) ? "Edit Review" : "Leave Review"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Purchase Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase Details</DialogTitle>
          </DialogHeader>
          {selectedPurchase && productDetails ? (
            <div className="space-y-4">
              <img src={productDetails.imageUrls[0]} alt={productDetails.name} className="w-full h-64 object-cover rounded-md" />
              <div>
              <div>
  <h2 className="text-xl font-bold">{productDetails.name}</h2>
  <Link href={`/marketplace/product/${productDetails.id}`} passHref>
    <span className="text-sm text-blue-600 hover:underline flex items-center gap-1 cursor-pointer mt-1">
      View Product <ExternalLink size={14} />
    </span>
  </Link>
</div>
                <p className="text-gray-700">{productDetails.desc}</p>
              </div>
              <div className="text-sm text-gray-600">
                <p><strong>Price:</strong> {productDetails.price} token</p>
                <p><strong>Seller ID:</strong> {productDetails.sellerId}</p>
                <p><strong>Purchase Date:</strong> {selectedPurchase.orderDate ? new Date(selectedPurchase.orderDate).toDateString() : "N/A"}</p>
                <p><strong>Status:</strong> {selectedPurchase.status}</p>
              </div>
              <a href={productDetails.fileUrl} download className="block">
                <Button className="w-auto bg-black text-white py-1 px-3 rounded-md hover:bg-gray-800 transition">
                  Download File ({productDetails.fileType})
                </Button>
              </a>
              <div>
              <h3 className="text-md font-semibold text-gray-900">Reviews</h3>
            <div className="space-y-3 mt-2">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 p-3 rounded-lg flex flex-col shadow-sm">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-800">{review.comment}</p>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon
                            key={i}
                            size={14}
                            className={i < review.rating ? "text-yellow-500" : "text-gray-300"}
                            fill={i < review.rating ? "currentColor" : "none"}
                            stroke={i < review.rating ? "currentColor" : "gray"}
                          />
                        ))}
                      </div>
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

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <StarRating value={rating} onChange={setRating} />
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write your review..." />
            <Button onClick={handleSubmitReview} className="w-full bg-black text-white">Submit Review</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};


export default PurchaseHistory;
