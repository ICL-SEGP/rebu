"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/forms/input";
import { Button } from "@/components/ui/helpers/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/helpers/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/modals/dialog";
import { PlusIcon, StarIcon, PencilIcon, TrashIcon } from "lucide-react";
import { Product } from "@/types/app";
import { getMarketplaceProducts, saveProduct, deleteProduct, uploadProductImage, uploadProductFile } from "@/lib/api/marketplace";

// 🔹 Dummy Data (For Testing)
// TODO: delete this when backend integrated
const dummyProducts: Product[] = [
  {
    id: "1",
    name: "Crypto Hoodie",
    description: "A limited edition hoodie for crypto enthusiasts.",
    price: 50,
    imageUrl: "https://picsum.photos/200/300",
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
  // TODO delete the dummy data when api ready
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

  // Open Edit Form
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowDialog(true);
  };

  // 🔹 Add / Edit Product
  const handleSaveProduct = async (product: Partial<Product>) => {
    try {
      let updatedProduct;
      if (product.id) {
        updatedProduct = { ...product, reviews: product.reviews || [] };
        //TODO Replace with API call: await saveProduct(updatedProduct);
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

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Seller Marketplace</h1>

      {/* 🔹 Search & Add Product */}
      <div className="flex items-center space-x-3">
        <Input
          type="text"
          placeholder="Search for products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-lg"
        />
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
      {/* 🔹 Product Listings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products
          .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
          .map((product) => (
            <ProductCard key={product.id} product={product} onView={() => setSelectedProduct(product)} />
          ))}
      </div>

      {/* 🔹 Add/Edit Product Modal */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogTitle>{selectedProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          <ProductForm product={selectedProduct} onSave={handleSaveProduct} />
        </DialogContent>
      </Dialog>

      {/* 🔹 Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onEdit={() => {
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

// ✅ Product Card Component (Displays Product Overview with Average Rating & Purchases)
function ProductCard({ product, onView }: { product: Product; onView: () => void }) {
  // Calculate Average Rating
  const totalRatings = product.reviews.length;
  const averageRating = totalRatings
    ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1)
    : "N/A";

  return (
    <Card className="relative shadow-md cursor-pointer hover:shadow-lg transition-all" onClick={onView}>
      <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover rounded-t-md" />
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-xl font-bold text-green-600">{product.price} Tokens</p>

        {/* ⭐ Display Filled Star Rating */}
        <div className="flex items-center space-x-1 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon
              key={i}
              size={16}
              className="text-yellow-500"
              fill={i < Math.round(parseFloat(averageRating)) ? "currentColor" : "none"}
              stroke={i < Math.round(parseFloat(averageRating)) ? "currentColor" : "gray"}
            />
          ))}
          <span className="text-sm font-medium">{averageRating} / 5</span>
        </div>


        {/* Display Purchase Count */}
        <p className="text-gray-500 text-sm">{totalRatings}+ bought recently</p>

        <p className="text-gray-500 text-sm">Non-Refundable</p>
      </CardContent>
    </Card>
  );
}

function ProductDetailModal({
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
  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] p-0 rounded-lg flex flex-col">
        {/* 🔹 Scrollable Content */}
        <div className="overflow-y-auto max-h-[60vh] p-6">
          <DialogTitle>{product.name}</DialogTitle>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-48 object-cover rounded-lg"
          />
          <p className="text-lg font-semibold text-gray-700 mt-4">
            {product.description}
          </p>

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
                            fill={i < review.rating ? "currentColor" : "none"} // ✅ Fully fills the star
                            stroke={i < review.rating ? "currentColor" : "gray"} // ✅ Keeps outline for empty stars
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


        {/* 🔹 Fixed Edit & Delete Buttons at Bottom (Balanced & Stretched) */}
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
            <TrashIcon size={16} className="mr-2" /> Delete
          </Button>
        </div>

      </DialogContent>
    </Dialog>
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
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const digitalFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setName(product?.name || "");
    setDescription(product?.description || "");
    setCategory(product?.category || "");
    setPrice(product?.price?.toString() || "");
    setImagePreview(product?.imageUrl || null);
  }, [product]);

  const isValid = name.trim() && description.trim() && category.trim() && price && (imagePreview || imageFile) && digitalFile;

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Show preview before upload
    }
  };

  // Handle Digital Product File Selection
  const handleDigitalFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDigitalFile(file);
    }
  };

  const handleSubmit = async () => {
    let imageUrl = imagePreview;
    let fileUrl = "";
    let fileType = "";
    let fileSize = 0;

    try {
      if (imageFile) {
        //TODO Replace with: imageUrl = await uploadProductImage(imageFile);
        imageUrl = "https://via.placeholder.com/300";
      }

      if (digitalFile) {
        fileType = digitalFile.type;
        fileSize = digitalFile.size;
        //TODO Replace with: fileUrl = await uploadProductFile(digitalFile);
        fileUrl = "https://via.placeholder.com/digital-product";
      }
    } catch (error) {
      console.error("File upload failed", error);
      return;
    }

    onSave({
      id: product?.id,
      name,
      description,
      category,
      price: Number(price),
      imageUrl,
      fileUrl,
      fileType,
      fileSize,
      createdAt: product?.createdAt || new Date(),
    });
  };

  return (
    <div className="space-y-4">

      {/* Image Upload */}
      <div className="space-y-2">
        {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />}
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
          Upload Image
        </Button>
      </div>

      {/* Digital Product Upload */}
      <div className="space-y-2">
        <input type="file" ref={digitalFileInputRef} onChange={handleDigitalFileChange} className="hidden" />
        <Button variant="outline" onClick={() => digitalFileInputRef.current?.click()}>
          Upload Digital Product
        </Button>
        {digitalFile && <p className="text-sm text-gray-500">Selected: {digitalFile.name} ({(digitalFile.size / 1024 / 1024).toFixed(2)} MB)</p>}
      </div>

      <Input placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
      <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} required />
      <Input type="number" placeholder="Price (Tokens)" value={price} onChange={(e) => setPrice(e.target.value)} required />


      <div className="py-2 bg-white flex justify-end">
        <Button onClick={handleSubmit} disabled={!isValid} className="px-6 py-2">
          Confirm
        </Button>
      </div>
    </div>
  );
}

