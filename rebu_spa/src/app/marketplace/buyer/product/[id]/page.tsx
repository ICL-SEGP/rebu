"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  StarIcon,
  ShoppingCartIcon,
  ChevronRight,
  XIcon,
  CheckCircleIcon,
  ChevronLeft,
  MailIcon,
} from "lucide-react";
import { Product } from "@/types/types";
import { createPurchase, getProductById } from "@/lib/api/marketplace";

import { getBalance, getPublicKey, useMakePurchase } from "@/lib/api/solana";
import toast from "react-hot-toast";

interface ImageCarouselModalProps {
  imageUrls: string[];
  productName: string;
}

const ImageCarouselModal: React.FC<ImageCarouselModalProps> = ({
  imageUrls,
  productName,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length
    );
  };

  return (
    <Dialog>
      <DialogTrigger>
        <img
          src={imageUrls[0]}
          alt={productName}
          className="w-full h-56 object-cover rounded-lg cursor-pointer"
        />
      </DialogTrigger>
      <DialogContent className="max-w-3xl p-0 rounded-lg flex flex-col items-center">
        <DialogTitle className="absolute w-1 h-1 p-0 m-[-1px] overflow-hidden whitespace-nowrap border-0 clip:rect(0,0,0,0)">
          {productName} Image Carousel
        </DialogTitle>
        <div className="relative w-full">
          <img
            src={imageUrls[currentImageIndex]}
            alt={productName}
            className="w-full object-contain max-h-[80vh]"
          />
          {imageUrls.length > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10"
                onClick={prevImage}
              >
                <ChevronLeft size={24} />
              </button>
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10"
                onClick={nextImage}
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function ProductPage() {
  const { data: session } = useSession();
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [isPurchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: makePurchase } = useMakePurchase();

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    setError(null);
    async function fetchProductData() {
      try {
        if (id) {
          const foundProduct = await getProductById(
            session!.accessToken,
            id?.toString()
          );

          const bal = await getBalance(session!.accessToken);
          setBalance(bal.balance);

          setProduct(foundProduct);
        }
      } catch (fetchError: any) {
        console.error("Failed to fetch product data", fetchError);
        setError(fetchError.message || "Failed to fetch product.");
      } finally {
        setLoading(false);
      }
    }
    fetchProductData();
  }, [id, session]);

  if (!session) {
    return (
      <div className="p-8 text-center">Please log in to view this page.</div>
    );
  }

  if (error) {
    toast.error("An wallet error occured.", { id: "wallet-error" });
  }

  if (!product) return <div className="p-8 text-center"></div>;

  const averageRating =
    product.reviews?.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
        product.reviews.length
      : 0;

  const handlePurchase = async () => {
    if (!session) {
      alert("You need to log in to make a purchase.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const seller = await getPublicKey(session!.accessToken, {
        sellerId: product.sellerId,
        sellerType: product.sellerType,
      });

      console.log("seller", seller);
      // todo
      console.log("product id", product.id);

      await makePurchase({
        seller_str: "CSWoyRACpM1tFJaCAZGKqytMjCXrT6iWJgkgpPHRZCPx",
        productId: product.id,
      });

      const purchaseData = {
        productId: product.id,
        userId: session.user.id,
        amount: product.price,
        seller: seller.seller,
      };

      const simulatePurchaseProgress = async () => {
        // Stage 1: Validation
        toast.loading("Validating purchase details...", {
          id: "purchase-progress",
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Stage 2: Submitting transaction
        toast.loading("Submitting transaction to blockchain...", {
          id: "purchase-progress",
        });
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Stage 3: Confirmation
        toast.loading("Waiting for blockchain confirmation...", {
          id: "purchase-progress",
        });
        await new Promise((resolve) => setTimeout(resolve, 18000));
        toast.dismiss("purchase-progress");
      };

      // Run the simulated progress in parallel with the actual createPurchase
      await Promise.all([
        createPurchase(session!.accessToken, purchaseData),
        simulatePurchaseProgress(),
      ]);

      toast.success("Purchase completed successfully!", {
        id: "purchase-progress",
        duration: 3000,
      });

      // await createPurchase(session!.accessToken, purchaseData);
      setIsPurchased(true);
      setTimeout(() => {
        setPurchaseModalOpen(false);
        setIsPurchased(false);
      }, 10000);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBalance(balance - product.price);
      setLoading(false);
    }
  };

  const isBuyable = product.status === "active";

  return (
    <div className="p-8 flex flex-col md:flex-row gap-8 max-w-6xl mx-auto relative">
      <div className="w-full md:w-1/3">
        {product.imageUrls && product.imageUrls.length > 0 && (
          <ImageCarouselModal
            imageUrls={product.imageUrls}
            productName={product.name}
          />
        )}
      </div>
      <div className="w-full md:w-2/3 flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <span
            className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
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

        <div
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 cursor-pointer transition"
          onClick={() => setReviewModalOpen(true)}
        >
          <span className="text-lg font-semibold">
            {averageRating.toFixed(1)}
          </span>
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon
                key={i}
                size={20}
                className={
                  i < Math.round(averageRating)
                    ? "text-yellow-500"
                    : "text-gray-300"
                }
                fill={i < Math.round(averageRating) ? "currentColor" : "none"}
              />
            ))}
          </div>
          <span className="text-sm">{`(${
            product.reviews?.length || 0
          } reviews)`}</span>
          <ChevronRight size={18} />
        </div>

        <div className="max-h-20 overflow-hidden relative text-gray-700">
          <p className="line-clamp-3">{product.desc}</p>
        </div>

        <p className="text-xl font-bold text-green-600">
          {product.price} Tokens
        </p>

        {isBuyable ? (
          <Button
            variant="default"
            className="w-full"
            onClick={() => setPurchaseModalOpen(true)}
            disabled={loading}
          >
            {loading ? (
              "Processing..."
            ) : (
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

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      <Dialog open={isPurchaseModalOpen} onOpenChange={setPurchaseModalOpen}>
        <DialogContent className="p-6 text-center rounded-lg shadow-lg">
          {!isPurchased ? (
            <>
              <DialogTitle>Confirm Purchase</DialogTitle>
              {balance >= product.price ? (
                <>
                  <p className="text-sm text-gray-500 mt-2">
                    Purchase <strong>{product.name}</strong> for{" "}
                    <strong>{product.price} Tokens</strong>?
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Your balance will be{" "}
                    <strong>{balance - product.price} Tokens</strong> after this
                    purchase.
                  </p>
                  <div className="mt-4 flex justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setPurchaseModalOpen(false)}
                      className="flex items-center"
                    >
                      <XIcon size={16} className="mr-1" />
                      No
                    </Button>
                    <Button
                      onClick={() => {
                        handlePurchase();
                      }}
                      className="flex items-center bg-blue-600 text-white"
                    >
                      <CheckCircleIcon size={16} className="mr-1" />
                      Confirm
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-red-500 mt-2">
                    Insufficient funds. You need{" "}
                    <strong>{product.price - balance}</strong> more Tokens to
                    purchase this item.
                  </p>
                  <div className="mt-4 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setPurchaseModalOpen(false)}
                      className="flex items-center"
                    >
                      <XIcon size={16} className="mr-1" />
                      Close
                    </Button>
                  </div>
                </>
              )}
            </>
          ) : (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <CheckCircleIcon size={48} className="text-green-500 mx-auto" />
              <h2 className="text-lg font-semibold mt-2">Thank You!</h2>
              <p className="text-sm text-gray-500">
                Your purchase was successful.
              </p>
              <div className="flex items-center justify-center mt-2">
                <MailIcon size={20} className="text-gray-500 mr-1" />
                <p className="text-sm text-gray-500">
                  An email with your download link has been sent.
                </p>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: -10 }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="mt-4"
              >
                🎉 🎊 🎈
              </motion.div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={isReviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="max-w-lg p-0 rounded-lg flex flex-col">
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            <DialogTitle>Customer Reviews</DialogTitle>

            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-gray-100 p-3 rounded-lg my-2"
                >
                  <p className="text-sm">{review.comment}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        size={14}
                        className={
                          i < review.rating
                            ? "text-yellow-500"
                            : "text-gray-300"
                        }
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
