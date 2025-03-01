"use client";

import { useState } from "react";
import { Input } from "@/components/ui/forms/input";
import { Button } from "@/components/ui/helpers/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/helpers/card";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/modals/dialog";
import { Skeleton } from "@/components/ui/sidebar/helpers/skeleton";
import { PlusIcon, TrashIcon, PencilIcon } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  image: File | null;
  category: string;
}

const dummyProducts: Product[] = [];

export default function MarketplaceAffiliate() {
  const [products, setProducts] = useState<Product[]>(dummyProducts);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const updateCategories = (updatedProducts: Product[]) => {
    const newCategories = Array.from(new Set(updatedProducts.map(p => p.category)));
    setCategories(newCategories);
  };

  const handleAddOrEditProduct = (product: Product) => {
    setProducts(prevProducts => {
      const exists = prevProducts.find(p => p.id === product.id);
      const updatedProducts = exists
        ? prevProducts.map(p => (p.id === product.id ? product : p))
        : [...prevProducts, product];
      updateCategories(updatedProducts);
      return updatedProducts;
    });
    setShowDialog(false);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.filter(p => p.id !== id);
      updateCategories(updatedProducts);
      return updatedProducts;
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Marketplace Management</h1>

      <div className="flex items-center space-x-3">
        <Input
          type="text"
          placeholder="Search for products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-lg"
        />
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={() => setSelectedProduct(null)}>
              <PlusIcon size={16} /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>{selectedProduct ? "Edit Product" : "Add Product"}</DialogTitle>
            <ProductForm
              product={selectedProduct}
              onSave={handleAddOrEditProduct}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex space-x-4 overflow-auto py-2">
        {categories.map((category) => (
          <Button key={category} variant="outline" onClick={() => setSearch(category)}>
            {category}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(product => (
          <Card key={product.id} className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200">
            <img src={product.image ? URL.createObjectURL(product.image) : ""} alt={product.name} className="w-full h-40 object-cover rounded-t-lg" />
            <CardHeader className="p-4">
              <CardTitle className="text-lg font-semibold text-gray-800">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col items-start">
              <p className="text-xl font-bold text-green-600">{product.price} Tokens</p>
              <div className="absolute top-3 right-3 flex space-x-2">
                <Button size="icon" variant="ghost" className="hover:bg-gray-200 p-2 rounded-full" onClick={() => { setSelectedProduct(product); setShowDialog(true); }}>
                  <PencilIcon size={16} />
                </Button>
                <Button size="icon" variant="destructive" className="hover:bg-red-500 p-2 rounded-full" onClick={() => handleDeleteProduct(product.id)}>
                  <TrashIcon size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProductForm({ product, onSave }: { product: Product | null, onSave: (product: Product) => void }) {
  const [name, setName] = useState(product?.name || "");
  const [category, setCategory] = useState(product?.category || "");
  const [price, setPrice] = useState(product?.price || "");
  const [image, setImage] = useState<File | null>(null);

  const isValid = name && category && price && image;

  return (
    <div className="space-y-4">
      <Input placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} required />
      <Input type="number" placeholder="Required Tokens" value={price} onChange={(e) => setPrice(e.target.value)} required />
      <Input type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} required />
      <Button onClick={() => isValid && onSave({ id: product?.id || Date.now().toString(), name, category, price: Number(price), image })} disabled={!isValid}>
        Confirm
      </Button>
    </div>
  );
}
