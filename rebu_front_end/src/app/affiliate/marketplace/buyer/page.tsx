"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/forms/input";
import { Button } from "@/components/ui/helpers/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/helpers/card";
import { StarIcon } from "lucide-react";
import { Product } from "@/types/app";
import axios from "axios";


const UNSPLASH_ACCESS_KEY = "TPFS6bS1JKJaCrphzZHJUUwGigQ1C1vFPZhfUKbi-nY";

// Fetch Unsplash images
const fetchCategoryImage = async (categoryName: string): Promise<string> => {
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

// Dummy Products
const dummyProducts: Product[] = [
  {
    id: 1,
    name: "Crypto Hoodie",
    desc: "A premium hoodie for blockchain lovers.",
    price: 50,
    imageUrls: ["https://via.placeholder.com/400"],
    fileUrl: "",
    fileType: "pdf",
    fileSize: 5000,
    category: { name: "Clothing", imageUrl: new URL("https://via.placeholder.com/400") },
    status: "ACTIVE",
    createdAt: new Date(),
    sellerId: 101,
    reviews: [{ id: 1, userId: 201, productId: "1", rating: 5, comment: "Super comfortable!", createdAt: new Date() }],
  },
  {
    id: 2,
    name: "Solana Cap",
    desc: "Stylish cap featuring the Solana logo.",
    price: 25,
    imageUrls: ["https://via.placeholder.com/400"],
    fileUrl: "",
    fileType: "pdf",
    fileSize: 5000,
    category: { name: "Clothing", imageUrl: new URL("https://via.placeholder.com/400") },
    status: "ACTIVE",
    createdAt: new Date(),
    sellerId: 102,
    reviews: [{ id: 2, userId: 203, productId: "2", rating: 5, comment: "Love the material!", createdAt: new Date() }],
  },
];

// Extract Unique Categories
const categories = [...new Set(dummyProducts.map((p) => p.category.name))];

export default function BuyerMarketplace() {
  const [search, setSearch] = useState("");
  const [filteredCategory, setFilteredCategory] = useState<string | null>(null);
  const [categoryImages, setCategoryImages] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  // Fetch category images once
  useEffect(() => {
    const fetchImages = async () => {
      const newCategoryImages: { [key: string]: string } = {};

      for (const category of categories) {
        if (!categoryImages[category]) {
          newCategoryImages[category] = await fetchCategoryImage(category);
        }
      }
      setCategoryImages((prev) => ({ ...prev, ...newCategoryImages }));
    };

    fetchImages();
  }, [categories]);

  const handleCategoryClick = (category: string) => {
    setFilteredCategory((prev) => (prev === category ? null : category)); // Toggle category selection
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8" onClick={(e) => {
      if (!e.target.closest(".category-card")) setFilteredCategory(null);
    }}>
      {/* 🔹 Search Bar (Google-Like) */}
      <div className="flex justify-center">
        <Input
          type="text"
          placeholder="Search for products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xl text-lg p-4 border rounded-full shadow-md"
        />
      </div>

      {/* 🔹 Category Cards (Amazon-Like) */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Categories</h2>
        {filteredCategory && (
          <Button variant="outline" onClick={() => setFilteredCategory(null)}>
            Show All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map((category) => (
          <CategoryCard
            key={category}
            category={category}
            imageUrl={categoryImages[category] || "/fallback-category.jpg"}
            isActive={filteredCategory === category}
            onSelect={() => handleCategoryClick(category)}
          />
        ))}
      </div>

      {/* 🔹 Product Listings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {dummyProducts
          .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
          .filter((p) => (filteredCategory ? p.category.name === filteredCategory : true))
          .map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
      </div>
    </div>
  );
}

// ✅ Category Card Component
function CategoryCard({
  category,
  imageUrl,
  onSelect,
  isActive,
}: {
  category: string;
  imageUrl: string;
  onSelect: () => void;
  isActive: boolean;
}) {
  return (
    <div
      className={`relative cursor-pointer rounded-lg overflow-hidden transition-all shadow-md hover:shadow-lg category-card ${
        isActive ? "border-2 border-blue-500" : ""
      }`}
      onClick={onSelect}
    >
      <img src={imageUrl} alt={category} className="w-full h-40 object-cover" />
      <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-white to-transparent flex items-end p-4">
        <h3 className="text-lg font-semibold">{category}</h3>
      </div>
    </div>
  );
}

// ✅ Product Card Component
function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const averageRating = product.reviews.length
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 0;

  return (
    <Card
      className="relative shadow-md cursor-pointer hover:shadow-lg transition-all p-4"
      onClick={() => router.push(`/affiliate/marketplace/buyer/${product.id}`)}
    >
      <img src={product.imageUrls[0]} alt={product.name} className="w-full h-40 object-cover rounded-md" />
      <CardHeader className="p-2">
        <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-2 space-y-2">
        <p className="text-xl font-bold text-green-600">{product.price} Tokens</p>
        <div className="flex items-center space-x-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon key={i} size={14} className="text-yellow-500" fill={i < Math.round(averageRating) ? "currentColor" : "none"} />
          ))}
          <span className="text-xs font-medium ml-1">{averageRating.toFixed(1)} / 5</span>
        </div>
      </CardContent>
    </Card>
  );
}
