"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/forms/input";
import { Button } from "@/components/ui/helpers/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/helpers/card";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/modals/dialog";
import { StarIcon, ShoppingCartIcon } from "lucide-react";
import { Product, Review, MarketplaceOrder, ProductStatus } from "@/types/app";
import { createOrder } from "@/lib/api/marketplace";

// 🔹 Dummy Products for Testing
// TODO: delete this when backend integrated
const dummyProducts: Product[] = [
  {
    id: "1",
    name: "Crypto Hoodie",
    description: "A premium hoodie for blockchain lovers.",
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
  {
    id: "2",
    name: "Solana Cap",
    description: "Stylish cap featuring the Solana logo.",
    price: 25,
    imageUrl: "https://picsum.photos/200/300",
    category: "Clothing",
    status: "ACTIVE",
    createdAt: new Date(),
    sellerId: 102,
    reviews: [{ id: "r3", userId: 203, productId: "2", rating: 5, comment: "Love the material!", createdAt: new Date() }],
  },
];
// TODO: uncomment this to dynamically fetch marketplaceproducts
// const [products, setProducts] = useState<Product[]>([]);
// useEffect(() => {
//   async function fetchProducts() {
//     try {
//       const products = await getMarketplaceProducts();
//       setProducts(products);
//     } catch (error) {
//       console.error("Failed to fetch products", error);
//     }
//   }
//   fetchProducts();
// }, []);


// 🔹 Dummy Orders for Testing
// TODO: delete this when backend integrated
const dummyOrders: MarketplaceOrder[] = [];

// TODO: uncomment this to fetch read orders
// const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
// useEffect(() => {
//   async function fetchOrders() {
//     try {
//       if (!user) return;
//       const token = user.token;
//       const orders = await getUserOrders(token, user.id);
//       setOrders(orders);
//     } catch (error) {
//       console.error("Failed to fetch orders", error);
//     }
//   }
//   fetchOrders();
// }, [user]);


export default function BuyerMarketplace() {
  const [orders, setOrders] = useState<MarketplaceOrder[]>(dummyOrders);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [newOrderId, setNewOrderId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filteredCategory, setFilteredCategory] = useState<string | null>(null);
  const router = useRouter();

  const handlePurchase = async (product: Product) => {
    try {
      const token = "USER_AUTH_TOKEN"; // TODO: Replace with actual auth token
      const newOrder = await createOrder(token, {
        buyerId: 999, // TODO: Dummy user ID, replace with actual logged-in user
        productId: product.id,
        totalAmount: product.price,
        orderDate: new Date(),
        status: "PENDING",
      });

      setOrders([...orders, newOrder]);
      setNewOrderId(newOrder.id);
      setPurchaseSuccess(true);
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Purchase failed. Try again.");
    }
  };

  const handleRedirectToOrder = () => {
    if (newOrderId) {
      router.push(`/affiliate/marketplace/buyer/order-history?orderId=${newOrderId}`);
    }
  };

  // 🔹 Extract Unique Categories
  const categories = Array.from(new Set(dummyProducts.map((p) => p.category)));

  return (
    <div className="p-8 space-y-6">
      {/* Search & Order History */}
      <div className="flex justify-between items-center">
        <Input
          type="text"
          placeholder="Search for products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-2xl"
        />
        <Button variant="outline" className="ml-4" onClick={() => router.push("/affiliate/marketplace/buyer/order-history")}>
          View My Order History
        </Button>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {categories.map((category) => (
          <CategoryCard
            key={category}
            category={category}
            products={dummyProducts.filter((p) => p.category === category).slice(0, 4)}
            onSelect={() => setFilteredCategory(category)}
          />
        ))}
      </div>

      {/* Product Listings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {dummyProducts
          .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
          .filter((p) => (filteredCategory ? p.category === filteredCategory : true))
          .map((product) => (
            <ProductCard key={product.id} product={product} onView={() => setSelectedProduct(product)} />
          ))}
      </div>

        {/* Product Detail Modal */}
        {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onBuy={() => handlePurchase(selectedProduct)} 
        />
      )}

      {/* 🔹 Purchase Success Modal */}
      {purchaseSuccess && (
        <Dialog open={purchaseSuccess} onOpenChange={() => setPurchaseSuccess(false)}>
          <DialogContent>
            <DialogTitle>Purchase Successful!</DialogTitle>
            <p className="text-gray-600">Your order has been placed successfully.</p>
            <Button onClick={handleRedirectToOrder} className="mt-4">
              View Order Details
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ✅ Category Card Component (Displays Top Products in Each Category)
function CategoryCard({ category, products, onSelect }: { category: string; products: Product[]; onSelect: () => void }) {
    return (
      <Card className="p-4 shadow-md cursor-pointer hover:shadow-lg transition-all" onClick={onSelect}>
        <CardTitle className="text-lg font-semibold">{category}</CardTitle>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {products.map((product) => (
            <div key={product.id} className="flex items-center space-x-2">
              <img src={product.imageUrl} alt={product.name} className="w-10 h-10 object-cover rounded-md" />
              <p className="text-sm">{product.name}</p>
            </div>
          ))}
        </div>
      </Card>
    );
  }

// Product Card Component (Displays Product Overview with Average Rating & Purchase Count)
function ProductCard({ product, onView }: { product: Product; onView: () => void }) {
    // Calculate Average Rating
    const averageRating = product.reviews.length
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;
  
    return (
      <Card className="relative shadow-md cursor-pointer hover:shadow-lg transition-all p-4" onClick={onView}>
        <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover rounded-md" />
        <CardHeader className="p-2">
          <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
        </CardHeader>
        <CardContent className="p-2 space-y-2">
          <p className="text-xl font-bold text-green-600">{product.price} Tokens</p>
  
          {/* 🔹 Average Review Rating */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon
                key={i}
                size={14} // ✅ Reduce size slightly to prevent overflow
                className="text-yellow-500"
                fill={i < Math.round(averageRating) ? "currentColor" : "none"}
                stroke={i < Math.round(averageRating) ? "currentColor" : "gray"}
              />
            ))}
            <span className="text-xs font-medium ml-1">{averageRating.toFixed(1)} / 5</span> {/* ✅ Adjust text size & spacing */}
          </div>
  
          {/* 🔹 Purchase Count */}
          <p className="text-xs text-gray-500">
            {product.reviews.length > 0 ? `${product.reviews.length}+ bought recently` : "No recent purchases"}
          </p>
  
          <p className="text-gray-500 text-sm">Non-Refundable</p>
        </CardContent>
      </Card>
    );
  }
  
  

function ProductDetailModal({
    product,
    onClose,
    onBuy,
  }: {
    product: Product;
    onClose: () => void;
    onBuy: () => void;
  }) {
    return (
      <Dialog open={!!product} onOpenChange={onClose}>
        <DialogContent className="max-w-lg max-h-[80vh] p-0 rounded-lg flex flex-col">
          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[60vh] p-6">
            <DialogTitle>{product.name}</DialogTitle>
            <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover rounded-lg" />
            <p className="text-lg font-semibold text-gray-700 mt-4">{product.description}</p>
            <p className="text-xl font-bold text-green-600 mt-2">{product.price} Tokens</p>
            <p className="text-gray-500">Category: {product.category}</p>
  
            {/* 🔹 Reviews Section */}
            <h3 className="mt-4 font-semibold">Reviews:</h3>
            <div className="space-y-2">
              {product.reviews.length > 0 ? (
                product.reviews.map((review) => (
                  <div key={review.id} className="bg-gray-100 p-3 rounded-lg flex flex-col">
                    <div className="flex justify-between items-center">
                      <p className="text-sm">{review.comment}</p>
                      <div className="flex items-center space-x-1">
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
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No reviews yet.</p>
              )}
            </div>
          </div>
  
          {/* 🔹 Sticky Buy Button */}
          <div className="p-4 border-t bg-white">
            <Button variant="default" onClick={onBuy} className="w-full">
              <ShoppingCartIcon size={16} className="mr-2" /> Buy Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  