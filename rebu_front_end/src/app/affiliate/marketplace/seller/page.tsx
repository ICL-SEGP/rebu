"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/forms/input";
import { Button } from "@/components/ui/helpers/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/helpers/card";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/modals/dialog";
import { PlusIcon, TrashIcon, PencilIcon, StarIcon } from "lucide-react";
import { Product, Review } from "@/types/app";
import { getMarketplaceProducts, saveProduct, deleteProduct, getReviews, deleteReview, uploadProductImage } from "@/lib/api/marketplace";


// ✅ Final version is now API-ready – dummy data is still there but can be easily replaced.
// ✅ Backend Dev Can Replace Calls:

// getMarketplaceProducts()
// saveProduct()
// deleteProduct()
// getReviews()
// deleteReview()
// uploadProductImage()

// 🔹 Dummy Data (To Be Replaced with API Calls)
const dummyProducts: Product[] = [
  {
    id: "1",
    name: "Crypto Hoodie",
    description: "A limited edition hoodie for crypto enthusiasts.",
    price: 50,
    imageUrl: "https://via.placeholder.com/300",
    category: "Clothing",
    status: "ACTIVE",
    createdAt: new Date(),
    sellerId: 101,
    reviews: [
      { id: "r1", userId: 201, productId: "1", rating: 5, comment: "Awesome hoodie!", createdAt: new Date() },
      { id: "r2", userId: 202, productId: "1", rating: 4, comment: "Good quality but a bit pricey.", createdAt: new Date() },
    ],
  },
];

export default function SellerMarketplace() {
  const [products, setProducts] = useState<Product[]>(dummyProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [search, setSearch] = useState("");

  // 🔹 Fetch Products (Dummy for now, API ready)
  useEffect(() => {
    async function fetchProducts() {
      try {
        // Replace with: const products = await getMarketplaceProducts();
        const products = dummyProducts; 
        setProducts(products);
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    }
    fetchProducts();
  }, []);

  // 🔹 Add / Edit Product
  const handleSaveProduct = async (product: Partial<Product>) => {
    try {
      let updatedProduct;
      if (product.id) {
        updatedProduct = { ...product, reviews: product.reviews || [] }; ;
        // Replace with: updatedProduct = await saveProduct(product);
      } else {
        updatedProduct = { ...product, id: Date.now().toString(), createdAt: new Date(), sellerId: 999, reviews: [] };
      }

      setProducts((prev) =>
        prev.some((p) => p.id === updatedProduct.id)
          ? prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
          : [...prev, updatedProduct]
      );
      setShowDialog(false);
    } catch (error) {
      console.error("Failed to save product", error);
    }
  };

  // 🔹 Delete Product
  const handleDeleteProduct = async (id: string) => {
    try {
      // Replace with: await deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
  
      // ✅ Force UI Update by closing modal if deleting selected product
      if (selectedProduct?.id === id) {
        setSelectedProduct(null);
      }
    } catch (error) {
      console.error("Failed to delete product", error);
    }
  };
  

  // 🔹 Delete Review
  const handleDeleteReview = async (productId: string, reviewId: string) => {
    try {
      // Replace with: await deleteReview(reviewId);
      setProducts(products.map((product) =>
        product.id === productId
          ? { ...product, reviews: product.reviews.filter((review) => review.id !== reviewId) }
          : product
      ));
  
      // ✅ Force UI Update by updating `selectedProduct`
      if (selectedProduct?.id === productId) {
        setSelectedProduct((prev) =>
          prev ? { ...prev, reviews: prev.reviews.filter((review) => review.id !== reviewId) } : prev
        );
      }
    } catch (error) {
      console.error("Failed to delete review", error);
    }
  };
  

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Seller Marketplace</h1>

      <div className="flex items-center space-x-3">
        <Input type="text" placeholder="Search for products..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full max-w-lg" />
        <Button variant="default" onClick={() => { setSelectedProduct(null); setShowDialog(true); }}>
          <PlusIcon size={16} /> Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(product => (
          <ProductCard key={product.id} product={product} onEdit={handleSaveProduct} onDelete={handleDeleteProduct} onView={() => setSelectedProduct(product)} />
        ))}
      </div>

      {/* Add/Edit Product Modal */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogTitle>{selectedProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          <ProductForm product={selectedProduct} onSave={handleSaveProduct} />
        </DialogContent>
      </Dialog>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent>
            <div className="flex justify-between items-center">
              <DialogTitle>{selectedProduct.name}</DialogTitle>
              <div className="flex space-x-2">
                <Button size="icon" variant="ghost" className="hover:bg-gray-100 p-2 rounded-full" onClick={() => setShowDialog(true)}>
                  <PencilIcon size={16} />
                </Button>
                <Button size="icon" variant="ghost" className="hover:bg-gray-100 p-2 rounded-full" onClick={() => handleDeleteProduct(selectedProduct.id)}>
                  <TrashIcon size={16} className="text-red-500" />
                </Button>
              </div>
            </div>

            <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-60 object-cover rounded-lg" />
            <p className="text-lg font-semibold text-gray-700 mt-4">{selectedProduct.description}</p>
            <p className="text-xl font-bold text-green-600 mt-2">{selectedProduct.price} Tokens</p>
            <p className="text-gray-500">Category: {selectedProduct.category}</p>

            {/* Reviews */}
            <h3 className="mt-4 font-semibold">Reviews:</h3>
            <div className="space-y-2">
              {selectedProduct.reviews.length > 0 ? (
                selectedProduct.reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} onDelete={() => handleDeleteReview(selectedProduct.id, review.id)} />
                ))
              ) : (
                <p className="text-gray-500 text-sm">No reviews yet.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ✅ Product Form Component (Handles Adding & Editing)
function ProductForm({ product, onSave }: { product: Product | null; onSave: (product: Partial<Product>) => void }) {
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [category, setCategory] = useState(product?.category || "");
  const [price, setPrice] = useState(product?.price || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl || null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setName(product?.name || "");
    setDescription(product?.description || "");
    setCategory(product?.category || "");
    setPrice(product?.price?.toString() || "");
    setImagePreview(product?.imageUrl || null);
  }, [product]);

  const isValid = name && category && price;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Show preview before upload
    }
  };

  const handleSubmit = async () => {
    let imageUrl = imagePreview;

    if (imageFile) {
      try {
        // Replace with: imageUrl = await uploadProductImage(imageFile);
        imageUrl = "https://via.placeholder.com/300"; 
      } catch (error) {
        console.error("Image upload failed", error);
      }
    }

    onSave({ id: product?.id || Date.now().toString(), name, description, category, price: Number(price), imageUrl });
  };

  return (
    <div className="space-y-4">
      <Input placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
      <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} required />
      <Input type="number" placeholder="Price (Tokens)" value={price} onChange={(e) => setPrice(e.target.value)} required />

      {/* Image Upload */}
      <div className="space-y-2">
        {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />}
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
          Upload Image
        </Button>
      </div>

      <Button onClick={handleSubmit} disabled={!isValid}>
        Confirm
      </Button>
    </div>
  );
}

// ✅ Product Card Component (Displays Product & Controls)
function ProductCard({ product, onEdit, onDelete, onView }: { product: Product; onEdit: (product: Product) => void; onDelete: (id: string) => void; onView: () => void }) {
  const averageRating = product.reviews.length
    ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
    : "N/A";

  return (
    <Card className="relative shadow-lg rounded-xl overflow-hidden transition-all hover:shadow-2xl cursor-pointer" onClick={onView}>
      <div className="relative">
        <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover rounded-t-lg" />
        <div className="absolute top-3 right-3 flex space-x-2">
          <Button size="icon" variant="ghost" className="hover:bg-gray-100 p-2 rounded-full" onClick={(e) => { e.stopPropagation(); onEdit(product); }}>
            <PencilIcon size={16} />
          </Button>
          <Button size="icon" variant="ghost" className="hover:bg-gray-100 p-2 rounded-full" onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}>
            <TrashIcon size={16} className="text-red-500" />
          </Button>
        </div>
      </div>

      <CardHeader className="p-4">
        <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        <p className="text-xl font-bold text-green-600">{product.price} Tokens</p>
        <div className="flex items-center space-x-1 mt-2">
          <StarIcon size={16} className="text-yellow-500" />
          <span className="text-sm font-medium">{averageRating} / 5</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ✅ Review Card Component (Includes Delete & Star Rating)
function ReviewCard({ review, onDelete }: { review: Review; onDelete: () => void }) {
  return (
    <div className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
      <div className="flex items-center space-x-2">
        <span className="text-yellow-500 flex">
          {Array(review.rating).fill(null).map((_, i) => <StarIcon key={i} size={14} />)}
        </span>
        <p className="text-sm">{review.comment}</p>
      </div>
      <Button size="icon" variant="ghost" className="hover:bg-red-100 p-2 rounded-full text-red-500" onClick={onDelete}>
        <TrashIcon size={14} />
      </Button>
    </div>
  );
}
