"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/forms/input";
import { Button } from "@/components/ui/helpers/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/helpers/card";
import { StarIcon } from "lucide-react";
import { Product } from "@/types/app";
import axios from "axios";


const UNSPLASH_ACCESS_KEY = "TPFS6bS1JKJaCrphzZHJUUwGigQ1ClvFPZhfUKbi-nY";

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

// Fetch Products (TODO: Replace with backend API call)
const fetchProducts = async () => {
  try {
    // TODO: Replace dummy products with real API call
    // const response = await axios.get('/api/products');
    // return response.data;
    
    // Dummy Products for now:
    return [
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
        status: "scheduled",
        createdAt: "",
        sellerId: 101,
        reviews: [{ id: 1, userId: 201, productId: 1, rating: 5, comment: "Super comfortable!", createdAt: "" }],
        sellerPubKey: "123"
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
        status: "active",
        createdAt: "",
        sellerId: 102,
        reviews: [{ id: 2, userId: 203, productId: 2, rating: 5, comment: "Love the material!", createdAt: "" }],
        sellerPubKey: "123"
      },
    ];
  } catch (error) {
    console.error("Failed to fetch products", error);
    return []; // Fallback in case of error
  }
};

export default function BuyerMarketplace() {
  const { data : session } = useSession();
  const [search, setSearch] = useState("");
  const [filteredCategory, setFilteredCategory] = useState<string | null>(null);
  const [categoryImages, setCategoryImages] = useState<{ [key: string]: string }>({});
  const [showScheduled, setShowScheduled] = useState(false); // 🔹 Toggle to show scheduled products
  const [categories, setCategories] = useState<string[]>([]); // New state to store unique categories
  const [products, setProducts] = useState<Product[]>([]); // Using the products state here
  const router = useRouter();


  if (!session) {
    throw new Error("No user logged in.");
  }

  // Fetch products and categories
  useEffect(() => {
    const fetchMarketplaceData = async () => {
      const fetchedProducts = await fetchProducts();
      setProducts(fetchedProducts);
      
      const categories = [...new Set(fetchedProducts.map((p) => p.category.name))];
      setCategories(categories);

      // Fetch category images
      const newCategoryImages: { [key: string]: string } = {};
      for (const category of categories) {
        if (!categoryImages[category]) {
          newCategoryImages[category] = await fetchCategoryImage(category);
        }
      }
      setCategoryImages((prev) => ({ ...prev, ...newCategoryImages }));
    };

    fetchMarketplaceData();
  }, []);

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

      {/* 🔹 Filter Toggle for Scheduled Products */}
      <div className="flex justify-end">
        <label className="flex items-center space-x-2 cursor-pointer">
          <span className="text-sm font-medium text-gray-700">Show Upcoming (Scheduled) Products</span>
          <div className="relative">
            <input
              type="checkbox"
              checked={showScheduled}
              onChange={() => setShowScheduled((prev) => !prev)}
              className="sr-only" // Hide the checkbox
            />
            <div
              className={`w-11 h-6 bg-gray-200 rounded-full transition-all ${showScheduled ? 'bg-blue-500' : 'bg-gray-300'}`}
              style={{
                position: 'relative',
                cursor: 'pointer',
              }}
              onClick={() => setShowScheduled((prev) => !prev)} // Toggle on click
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-all transform ${showScheduled ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </div>
          </div>
        </label>
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
        {products
          .filter((p) => p.status === "active" || (showScheduled && p.status === "scheduled")) // Toggle for scheduled products
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
  const { data: session } = useSession(); 
  const averageRating = product.reviews.length
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 0;

  return (
    <Card
      className="relative shadow-md cursor-pointer hover:shadow-lg transition-all p-4"
      onClick={() => {
        const role = session?.user?.role; // Assuming session is defined somewhere

        if (role === 'affiliate') {
          // If the user is an affiliate, go to the affiliate marketplace page
          router.push(`/affiliate/marketplace/buyer/${product.id}`);
        } else if (role === 'user') {
          // If the user is a regular user, go to the user marketplace page
          router.push(`/user/marketplace/${product.id}`);
        } else {
            router.push(`/marketplace/product/${product.id}`); // Default route
        } 
      }}
    >
      {/* Show "Upcoming" Badge if the product is scheduled */}
      {product.status === "scheduled" && (
        <div className="absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded-md bg-blue-500 text-white">
          Upcoming
        </div>
      )}
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
