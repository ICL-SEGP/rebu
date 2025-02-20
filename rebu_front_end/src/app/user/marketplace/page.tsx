"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  description: string;
}

const dummyProducts: Product[] = [
  { id: "1", name: "JavaScript Guide", price: 100, imageUrl: "/images/js-guide.png", category: "Ebooks", description: "A complete guide to JavaScript." },
  { id: "2", name: "React Masterclass", price: 200, imageUrl: "/images/react-masterclass.png", category: "Courses", description: "Master React with this in-depth course." },
  { id: "3", name: "AI Fundamentals", price: 300, imageUrl: "/images/ai-fundamentals.png", category: "Ebooks", description: "Understand the fundamentals of AI and Machine Learning." },
  { id: "4", name: "Next.js Advanced", price: 250, imageUrl: "/images/nextjs-advanced.png", category: "Courses", description: "Learn advanced techniques in Next.js." },
];

export default function MarketplaceUser() {
  const [products, setProducts] = useState<Product[]>(dummyProducts);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const uniqueCategories = Array.from(new Set(dummyProducts.map(p => p.category)));
    setCategories(uniqueCategories);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Marketplace</h1>

      <div className="flex items-center space-x-3">
        <Input
          type="text"
          placeholder="Search for products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-lg"
        />
      </div>

      <div className="flex space-x-4 overflow-auto py-2">
        {categories.map((category) => (
          <Button key={category} variant="outline" onClick={() => setSearch(category)}>
            {category}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products
          .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.includes(search))
          .map(product => (
            <Card
              key={product.id}
              className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer"
              onClick={() => { setSelectedProduct(product); setShowDialog(true); }}
            >
              <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover rounded-t-lg" />
              <CardHeader className="p-4">
                <CardTitle className="text-lg font-semibold text-gray-800">{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex flex-col items-start">
                <p className="text-xl font-bold text-green-600">{product.price} Tokens</p>
              </CardContent>
            </Card>
          ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          {selectedProduct && (
            <div>
              <DialogTitle className="text-2xl font-bold">{selectedProduct.name}</DialogTitle>
              <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-60 object-cover rounded-lg" />
              <p className="text-gray-700 mt-4">{selectedProduct.description}</p>
              <p className="text-xl font-bold text-green-600 mt-2">{selectedProduct.price} Tokens</p>
              <Button className="w-full mt-4">Buy</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
