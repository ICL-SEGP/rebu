"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StarIcon } from "lucide-react";
import { Category, Product } from "@/types/types";
import axios from "axios";
import {
  fetchCategoryImage,
  getCategories,
  getProducts,
} from "@/lib/api/marketplace";

// Fetch Unsplash images
// {
//         id: 1,
//         name: "Crypto Hoodie",
//         desc: "A premium hoodie for blockchain lovers.",
//         price: 50,
//         imageUrls: ["https://via.placeholder.com/400"],
//         fileUrl: "",
//         fileType: "pdf",
//         fileSize: 5000,
//         category: { name: "Clothing", imageUrl: new URL("https://via.placeholder.com/400") },
//         status: "scheduled",
//         createdAt: "",
//         sellerId: 101,
//         reviews: [{ id: 1, userId: 201, productId: 1, rating: 5, comment: "Super comfortable!", createdAt: "" }],
//         sellerPubKey: "123"
//       },
//       {
//         id: 2,
//         name: "Solana Cap",
//         desc: "Stylish cap featuring the Solana logo.",
//         price: 25,
//         imageUrls: ["https://via.placeholder.com/400"],
//         fileUrl: "",
//         fileType: "pdf",
//         fileSize: 5000,
//         category: { name: "Clothing", imageUrl: new URL("https://via.placeholder.com/400") },
//         status: "active",
//         createdAt: "",
//         sellerId: 102,
//         reviews: [{ id: 2, userId: 203, productId: 2, rating: 5, comment: "Love the material!", createdAt: "" }],
//         sellerPubKey: "123"
//       },

export default function BuyerMarketplace() {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [filteredCategory, setFilteredCategory] = useState<Category | null>(
    null
  );
  const [categoryImages, setCategoryImages] = useState<{
    [key: string]: string;
  }>({});
  const [showScheduled, setShowScheduled] = useState(false); // 🔹 Toggle to show scheduled products
  const [categories, setCategories] = useState<Category[]>([]); // New state to store unique categories
  const [products, setProducts] = useState<Product[]>([]); // Using the products state here
  const router = useRouter();

  const getPopularCategories = (products: Product[], maxCount: number = 8) => {
    const categoryCounts: Record<string, number> = {};

    products.forEach((product) => {
      const category = product.category.name;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    return Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1]) // Sort by popularity
      .slice(0, maxCount) // Take the top 8
      .map(([category]) => category);
  };

  if (!session) {
    throw new Error("No user logged in.");
  }

  // Fetch products and categories
  useEffect(() => {
    const fetchMarketplaceData = async () => {
      const fetchedProducts = await getProducts(session!.accessToken);
      setProducts(fetchedProducts);

      console.log(fetchedProducts);

      const topCategories = await getCategories(session!.accessToken);
      setCategories(topCategories);

      // // Fetch category images
      // const newCategoryImages: { [key: string]: string } = {};
      // for (const category of topCategories) {
      //   if (!categoryImages[category]) {
      //     newCategoryImages[category] = await fetchCategoryImage(category);
      //   }
      // }
      // setCategoryImages((prev) => ({ ...prev, ...newCategoryImages }));
    };

    fetchMarketplaceData();
  }, []);

  const handleCategoryClick = (category: Category) => {
    setFilteredCategory((prev) =>
      prev?.name === category.name ? null : category
    ); // Toggle category selection
  };

  return (
    <div
      className="p-8 max-w-6xl mx-auto space-y-12"
      onClick={(e) => {
        if (!e.target.closest(".category-card")) setFilteredCategory(null);
      }}
    >
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.name}
            category={category}
            imageUrl={category.imageUrl || "/fallback-category.jpg"}
            isActive={filteredCategory?.name === category.name}
            onSelect={() => handleCategoryClick(category)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Products</h2>

        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => setShowScheduled((prev) => !prev)} // Make entire div clickable
        >
          <span className="text-sm font-medium text-gray-700">
            Show Upcoming
          </span>
          <div
            className={`w-10 h-5 flex items-center bg-gray-200 rounded-full p-1 transition-all ${
              showScheduled ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-all ${
                showScheduled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
        </div>
      </div>

      {/* 🔹 Product Listings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products
          .filter(
            (p) =>
              p.status === "active" ||
              (showScheduled && p.status === "scheduled")
          ) // Toggle for scheduled products
          .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
          .filter((p) =>
            filteredCategory ? p.category.name === filteredCategory.name : true
          )
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
  onSelect,
  isActive,
}: {
  category: Category;
  imageUrl: string;
  onSelect: () => void;
  isActive: boolean;
}) {
  const router = useRouter();
  const { data: session } = useSession(); // Ensure session is fetched

  const handleClick = () => {
    router.push(
      `/marketplace/buyer/category/${encodeURIComponent(category.name)}`
    );
  };
  return (
    <div
      className="relative cursor-pointer rounded-lg overflow-hidden transition-all shadow-md hover:shadow-lg"
      onClick={handleClick}
    >
      <img
        src={category.imageUrl}
        alt={category.name}
        className="w-full h-60 object-cover"
      />
      <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-white/50 to-transparent flex items-end p-4">
        <h3 className="text-lg font-semibold text-white">{category.name}</h3>
      </div>
    </div>
  );
}

// ✅ Product Card Component
function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { data: session } = useSession();
  const averageRating = product.avgRating || 0;

  return (
    <Card
      className="relative shadow-md cursor-pointer hover:shadow-lg transition-all p-4"
      onClick={() => {
        router.push(`/marketplace/buyer/product/${product.id}`); // Default route
      }}
    >
      {/* Status Badge */}
      {/* Only show badge for upcoming products */}
      {product.status === "scheduled" && (
        <span className="absolute top-2 left-2 px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
          Upcoming
        </span>
      )}

      <img
        src={product.imageUrls[0]}
        alt={product.name}
        className="w-full h-40 object-cover rounded-md"
      />
      <CardHeader className="p-2">
        <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-2 space-y-2">
        <p className="text-xl font-bold text-green-600">
          {product.price} Tokens
        </p>
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
