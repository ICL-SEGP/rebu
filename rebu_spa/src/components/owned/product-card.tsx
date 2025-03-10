"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  StarIcon,
  PencilIcon,
  ChevronLeft,
  ChevronRight,
  DownloadIcon,
  X,
} from "lucide-react";

import { Product } from "@/types/types";

export function ProductCard({
  product,
  onView,
}: {
  product: Product;
  onView: () => void;
}) {
  const totalRatings = product.reviews?.length || 0;
  const averageRating = totalRatings
    ? (
        product.reviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      ).toFixed(1)
    : "N/A";

  return (
    <Card
      className="relative shadow-md cursor-pointer hover:shadow-lg transition-all"
      onClick={onView}
    >
      <img
        src={product.imageUrls[0]}
        alt={product.name}
        className="w-full h-40 object-cover rounded-t-md"
      />
      <CardHeader className="p-4">
        <CardTitle className="h-14 line-clamp-2 text-lg font-semibold">
          {product.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-xl font-bold text-green-600">
          {product.price} Tokens
        </p>
        <div className="flex items-center space-x-1 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon
              key={i}
              size={16}
              className="text-yellow-500"
              fill={
                i < Math.round(parseFloat(averageRating))
                  ? "currentColor"
                  : "none"
              }
              stroke={
                i < Math.round(parseFloat(averageRating))
                  ? "currentColor"
                  : "gray"
              }
            />
          ))}
          <span className="text-sm font-medium">{averageRating} / 5</span>
        </div>
        <div className="mt-2">
          <Badge
            variant={
              product.status === "active"
                ? "success"
                : product.status === "scheduled"
                ? "blue"
                : product.status === "sold_out"
                ? "destructive"
                : "gray"
            }
          >
            {product.status.toUpperCase()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductDetailModal({
  product,
  onClose,
  onEdit,
  onDelete,
}: {
  product: Product;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    if (currentImageIndex < product.imageUrls.length - 1) {
      setCurrentImageIndex((prevIndex) => prevIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex((prevIndex) => prevIndex - 1);
    }
  };

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] p-4 rounded-lg flex flex-col shadow-lg bg-white">
        <div className="overflow-y-auto max-h-[65vh] space-y-4">
          <DialogTitle className="text-xl font-bold text-gray-900">
            {product.name}
          </DialogTitle>

          <div className="relative rounded-lg overflow-hidden">
            <img
              src={product.imageUrls[currentImageIndex]}
              alt={product.name}
              className="w-full h-56 object-cover rounded-lg"
            />
            {product.imageUrls.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md"
                  onClick={prevImage}
                  disabled={currentImageIndex === 0}
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md"
                  onClick={nextImage}
                  disabled={currentImageIndex === product.imageUrls.length - 1}
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          <div className="text-gray-700">
            <h3 className="text-md font-semibold text-gray-900">Description</h3>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              {product.desc}
            </p>

            <div className="mt-2 flex items-center space-x-2">
              <span className="text-sm text-gray-500">Status:</span>
              <Badge
                variant={
                  product.status === "active"
                    ? "success"
                    : product.status === "scheduled"
                    ? "blue"
                    : product.status === "sold_out"
                    ? "destructive"
                    : "gray"
                }
              >
                {product.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          {product.fileUrl && (
            <div className="bg-gray-100 p-3 rounded-lg flex items-center space-x-3">
              <DownloadIcon size={18} className="text-gray-500" />
              <a
                href={product.fileUrl}
                download
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                {product.fileType.toUpperCase()} File (Click to Download)
              </a>
            </div>
          )}

          <div>
            <h3 className="text-md font-semibold text-gray-900">Reviews</h3>
            <div className="space-y-3 mt-2">
              {product.reviews?.length > 0 ? (
                product.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-gray-50 p-3 rounded-lg flex flex-col shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-800">{review.comment}</p>
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

        <div className="p-4 border-t bg-white flex gap-4">
          <Button
            variant="outline"
            onClick={onEdit}
            className="flex-1 flex items-center justify-center px-6 py-2"
          >
            <PencilIcon size={16} className="mr-2" /> Edit
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            className="flex-1 flex items-center justify-center px-6 py-2"
          >
            <X size={16} className="mr-2" /> Mark Expired
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
