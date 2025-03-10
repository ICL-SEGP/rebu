"use client";

import { useEffect, useState, useRef } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { User, Product, ProductStatus, Category } from "@/types/types";
import {
  deleteProduct,
  createProduct,
  updateProduct,
  getProducts,
  getCategories,
} from "@/lib/api/marketplace";

import humps from "humps";
import toast from "react-hot-toast";
import { NewProductForm } from "@/components/owned/new-product-form";
import {
  ProductCard,
  ProductDetailModal,
} from "@/components/owned/product-card";
import { EditProductForm } from "@/components/owned/edit-product-form";

export default function SellerMarketplace() {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>();
  const [showDialog, setShowDialog] = useState(false);
  const [newProductDialog, setNewProductDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [categories, setCategories] = useState<Category[]>([]);

  if (!session) {
    throw new Error("No user logged in.");
  }

  useEffect(() => {
    async function fetchSellerProducts() {
      try {
        const userProducts = await getProducts(session!.accessToken);
        const cats = await getCategories(session!.accessToken);
        setCategories(cats);
        setProducts(userProducts);
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    }
    fetchSellerProducts();
  }, [session?.accessToken]);

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm("Are you sure you want to mark this product expired?"))
      return;

    try {
      await deleteProduct(session.accessToken, productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success("Product set as expired!");
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Unable to modify product at this time.");
    }
  };

  const handleCreateProduct = async (updatedProduct: Product) => {
    try {
      console.log("about to save", updatedProduct);

      const savedProduct = await toast.promise(
        createProduct(session.accessToken, updatedProduct),
        {
          loading: "Saving product to the blockchain...",
          success: "Product saved successfully!",
          error: (error) =>
            `Failed to save product: ${error.message || "Unknown error"}`,
        }
      );

      const newProduct = humps.camelizeKeys(savedProduct);

      setProducts((prev) =>
        prev.some((p) => p.id === newProduct.id)
          ? prev.map((p) => (p.id === newProduct.id ? newProduct : p))
          : [...prev, newProduct]
      );

      setShowDialog(false);
    } catch (error) {
      console.error("Failed to save product", error);
      toast.error("Failed to save product. Try again.");
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      const savedProduct = await toast.promise(
        updateProduct(session.accessToken, updatedProduct),
        {
          loading: "Updating product listing on blockchain...",
          success: "Product updated successfully!",
          error: (error) =>
            `Failed to update product: ${error.message || "Unknown error"}`,
        }
      );

      const newProduct = humps.camelizeKeys(savedProduct);

      setProducts((prev) =>
        prev.some((p) => p.id === newProduct.id)
          ? prev.map((p) => (p.id === newProduct.id ? newProduct : p))
          : [...prev, newProduct]
      );

      setShowDialog(false);
    } catch (error) {
      console.error("Failed to save product", error);
      alert("Failed to save product. Try again.");
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Seller Marketplace</h1>

      <div className="flex items-center space-x-3">
        <Input
          type="text"
          placeholder="Search for products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-lg"
        />

        <Select
          onValueChange={(status) => setFilterStatus(status)}
          defaultValue="all"
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value={ProductStatus.ACTIVE}>Active</SelectItem>
            <SelectItem value={ProductStatus.SCHEDULED}>Scheduled</SelectItem>
            <SelectItem value={ProductStatus.SOLD_OUT}>Sold Out</SelectItem>
            <SelectItem value={ProductStatus.EXPIRED}>Expired</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="default"
          onClick={() => {
            setSelectedProduct(null);
            setShowDialog(true);
          }}
        >
          <PlusIcon size={16} /> Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products
          .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
          .filter((p) => filterStatus === "all" || p.status === filterStatus)
          .map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onView={() => setSelectedProduct(product)}
            />
          ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogTitle>"Add Product"</DialogTitle>
          {products.length >= 0 ? (
            <NewProductForm
              onSave={handleCreateProduct}
              currentUserToken={session.accessToken}
              categories={categories}
              setCategories={setCategories}
            />
          ) : (
            <p>Loading...</p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={newProductDialog} onOpenChange={setNewProductDialog}>
        <DialogContent>
          <DialogTitle>"Edit Product"</DialogTitle>
          {products.length >= 0 ? (
            <EditProductForm
              product={selectedProduct}
              onSave={handleUpdateProduct}
              currentUserToken={session.accessToken}
              categories={categories}
              setCategories={setCategories}
            />
          ) : (
            <p>Loading...</p>
          )}
        </DialogContent>
      </Dialog>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onEdit={() => {
            setSelectedProduct(selectedProduct);
            setShowDialog(true);
          }}
          onDelete={() => {
            handleDeleteProduct(selectedProduct.id);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
