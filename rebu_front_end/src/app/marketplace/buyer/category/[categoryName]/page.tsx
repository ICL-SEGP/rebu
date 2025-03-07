"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/forms/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/helpers/card";
import { StarIcon } from "lucide-react";
import { Product } from "@/types/app";
import { useSession } from "next-auth/react";
import { getAllProducts, getProducts } from "@/lib/api/marketplace";

const dummyProducts: Product[] = [
  {
    id: 1,
    name: "AI-Powered Design Tool",
    desc: "A powerful design tool for creators.",
    price: 49.99,
    imageUrls: ["https://via.placeholder.com/400"],
    fileUrl: "",
    fileType: "pdf",
    fileSize: 5000,
    category: { name: "Software", imageUrl: "https://via.placeholder.com/400" },
    status: "active",
    createdAt: "2024-01-01T10:00:00Z",
    sellerId: 101,
    reviews: [
      {
        id: 1,
        userId: 201,
        productId: 1,
        rating: 4,
        comment: "Great tool!",
        createdAt: "2024-01-02T10:00:00Z",
      },
      {
        id: 2,
        userId: 202,
        productId: 1,
        rating: 5,
        comment: "Amazing!",
        createdAt: "2024-01-03T10:00:00Z",
      },
    ],
    sellerPubKey: "123",
  },
  {
    id: 2,
    name: "Digital Marketing Course",
    desc: "Learn the secrets of digital marketing.",
    price: 79.99,
    imageUrls: ["https://via.placeholder.com/400"],
    fileUrl: "",
    fileType: "mp4",
    fileSize: 100000,
    category: {
      name: "Education",
      imageUrl: "https://via.placeholder.com/400",
    },
    status: "active",
    createdAt: "2024-01-05T10:00:00Z",
    sellerId: 102,
    reviews: [
      {
        id: 3,
        userId: 203,
        productId: 2,
        rating: 5,
        comment: "Highly informative!",
        createdAt: "2024-01-06T10:00:00Z",
      },
    ],
    sellerPubKey: "123",
  },
];

export default function CategoryPage() {
  const { data: session } = useSession();
  const { categoryName } = useParams();
  const normalizedCategory = decodeURIComponent(
    Array.isArray(categoryName) ? categoryName[0] : categoryName || ""
  ).toLowerCase();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recency");

  const fetchProducts = async () => {
    const fetchProducts = await getAllProducts(session!.accessToken);

    console.log("fetched", fetchProducts);

    const filteredProducts = fetchProducts.filter(
      (p) => p.category?.name.toLowerCase() === normalizedCategory
    );

    console.log("filter", filteredProducts);

    setProducts(filteredProducts);
  };

  useEffect(() => {
    if (!categoryName) return;

    fetchProducts();
  }, [normalizedCategory, categoryName]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "review_avg") {
      const avgA =
        a.reviews.reduce((sum, r) => sum + r.rating, 0) /
        (a.reviews.length || 0);
      const avgB =
        b.reviews.reduce((sum, r) => sum + r.rating, 0) /
        (b.reviews.length || 0);
      return avgB - avgA;
    } else if (sortBy === "review_count") {
      return b.reviews.length - a.reviews.length;
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="inline-flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-lg font-medium">
        <span className="text-gray-600">Category:</span>
        <span className="font-semibold text-gray-800">{categoryName}</span>
      </div>
      <div className="flex justify-between items-center">
        <Input
          type="text"
          placeholder="Search for products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xl text-lg p-4 border rounded-full shadow-md"
          aria-label="Search products"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border p-2 rounded-md shadow-sm"
          aria-label="Sort products"
        >
          <option value="recency">Newest</option>
          <option value="review_avg">Highest Rated</option>
          <option value="review_count">Most Reviews</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {sortedProducts
          .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
          .map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const averageRating = product.reviews.length
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
      product.reviews.length
    : 0;

  return (
    <Card
      className="shadow-md cursor-pointer hover:shadow-lg transition-all p-4"
      onClick={() => router.push(`/marketplace/buyer/product/${product.id}`)}
    >
      <img
        src={product.imageUrls[0]}
        alt={product.name}
        className="w-full h-40 object-cover rounded-md"
      />
      <CardHeader className="p-2">
        <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-2 space-y-2">
        <p className="text-xl font-bold text-green-600">${product.price}</p>
        <div className="flex items-center space-x-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon
              key={i}
              size={14}
              className="text-yellow-500"
              fill={i < Math.round(averageRating) ? "currentColor" : "none"}
            />
          ))}
          <span className="text-xs font-medium ml-1">
            {averageRating.toFixed(1)} / 5
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
