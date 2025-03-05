"use client";

import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/helpers/badge";
import { Input } from "@/components/ui/forms/input";
import { Button } from "@/components/ui/helpers/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/shadcn/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/helpers/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/modals/dialog";
import { 
  UploadIcon, XCircleIcon, PlusIcon, StarIcon, 
  PencilIcon, TrashIcon, ChevronLeft, ChevronRight, DownloadIcon 
} from "lucide-react";
import { useSession } from "next-auth/react";
import { User, Product, ProductStatus } from "@/types/app";
import { 
  uploadProductImage, uploadProductFile,
  getAffiliateProducts, saveProduct, deleteProduct 
} from "@/lib/api/marketplace";
import { ActiveDraggableContext } from "@dnd-kit/core/dist/components/DndContext";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SellerMarketplace() {
  const { data : session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  if (!session) {
    throw new Error("No user logged in.");
  }

  /**
 * Fetches the seller's products from the backend.
 * TODO: Replace dummy data with actual backend fetch
 */
  useEffect(() => {
    async function fetchSellerProducts() {
      try {
        // TODO: Uncomment when backend is ready
        // const userProducts = await getAffiliateProducts(session.accessToken);
        // setProducts(userProducts);

        // Dummy data for now
        const dummyProducts: Product[] = [
          {
            id: 1,
            name: "Ebook: Mastering Next.js",
            desc: "A comprehensive guide to building scalable Next.js applications.",
            price: 29.99,
            imageUrls: ["/images/nextjs-ebook.png"],
            fileUrl: "https://example.com/ebook.pdf",
            fileType: "pdf",
            fileSize: 1048576,
            category: { name: "Ebooks", imageUrl: new URL("https://example.com/category.png") },
            status: "active",
            createdAt: "",
            sellerId: 1,
            reviews: [],
          },
          {
            id: 2,
            name: "UI Kit for Designers",
            desc: "A modern UI kit for Figma and Sketch users.",
            price: 49.99,
            imageUrls: ["/images/ui-kit.png"],
            fileUrl: "/Users/roypark337/Downloads/codingclub_week6",
            fileType: "zip",
            fileSize: 2048576,
            category: { name: "Design Assets", imageUrl: new URL("https://example.com/category.png") },
            status: "active",
            createdAt: "",
            sellerId: 1,
            reviews: [],
          },
        ];

        setProducts(dummyProducts);
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    }
    fetchSellerProducts();
  }, [session?.accessToken]);

  /**
   * Handles product deletion by calling the API and updating the local state.
   */
  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await deleteProduct(session.accessToken, productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product. Try again.");
    }
  };

  /**
   * Handles adding or updating a product by calling the backend API.
   */
  const handleSaveProduct = async (updatedProduct: Product) => {
    try {
      const savedProduct = await saveProduct(session.accessToken, updatedProduct);
      setProducts((prev) =>
        prev.some((p) => p.id === savedProduct.id)
          ? prev.map((p) => (p.id === savedProduct.id ? savedProduct : p))
          : [...prev, savedProduct]
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

      {/* 🔹 Search & Add Product & Filtering Based On Product Status */}
      <div className="flex items-center space-x-3">
        <Input
          type="text"
          placeholder="Search for products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-lg"
        />

        <Select onValueChange={(status) => setFilterStatus(status)} defaultValue="all">
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

      {/* 🔹 Product Listings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products
          .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
          .filter((p) => filterStatus === "all" || p.status === filterStatus)
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


/**
 * Displays a product card with image, name, price, and rating.
 */
export function ProductCard({ product, onView }: { product: Product; onView: () => void }) {
  const totalRatings = product.reviews?.length || 0;
  const averageRating = totalRatings
    ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1)
    : "N/A";

  return (
    <Card className="relative shadow-md cursor-pointer hover:shadow-lg transition-all" onClick={onView}>
      <img src={product.imageUrls[0]} alt={product.name} className="w-full h-40 object-cover rounded-t-md" />
      <CardHeader className="p-4">
        <CardTitle className="h-14 line-clamp-2 text-lg font-semibold">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-xl font-bold text-green-600">{product.price} Tokens</p>
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
        <div className="mt-2">
          <Badge
            variant={
              product.status === "active"
                ? "success"
                : product.status === "scheduled"
                ? "blue"
                : product.status === "sold_out"
                ? "destructive"
                : "gray"
            }
          >
            {product.status.toUpperCase()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Displays detailed product info with options to edit or delete.
 */
export function ProductDetailModal({
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    if (currentImageIndex < product.imageUrls.length - 1) {
      setCurrentImageIndex((prevIndex) => prevIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex((prevIndex) => prevIndex - 1);
    }
  };

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] p-4 rounded-lg flex flex-col shadow-lg bg-white">
        <div className="overflow-y-auto max-h-[65vh] space-y-4">
          <DialogTitle className="text-xl font-bold text-gray-900">{product.name}</DialogTitle>

          {/* Image Carousel */}
          <div className="relative rounded-lg overflow-hidden">
            <img
              src={product.imageUrls[currentImageIndex]}
              alt={product.name}
              className="w-full h-56 object-cover rounded-lg"
            />
            {product.imageUrls.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md"
                  onClick={prevImage}
                  disabled={currentImageIndex === 0}
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md"
                  onClick={nextImage}
                  disabled={currentImageIndex === product.imageUrls.length - 1}
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

    
          {/* Description & Status */}
          <div className="text-gray-700">
            <h3 className="text-md font-semibold text-gray-900">Description</h3>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{product.desc}</p>

            {/* Ambient Product Status Badge */}
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-sm text-gray-500">Status:</span>
              <Badge
                variant={
                  product.status === "active"
                    ? "success"
                    : product.status === "scheduled"
                    ? "blue"
                    : product.status === "sold_out"
                    ? "destructive"
                    : "gray"
                }
              >
                {product.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* File Download */}
          {product.fileUrl && (
            <div className="bg-gray-100 p-3 rounded-lg flex items-center space-x-3">
              <DownloadIcon size={18} className="text-gray-500" />
              <a href={product.fileUrl} download className="text-blue-600 text-sm font-medium hover:underline">
                {product.fileType.toUpperCase()} File (Click to Download)
              </a>
            </div>
          )}

          {/* Reviews */}
          <div>
            <h3 className="text-md font-semibold text-gray-900">Reviews</h3>
            <div className="space-y-3 mt-2">
              {product.reviews?.length > 0 ? (
                product.reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 p-3 rounded-lg flex flex-col shadow-sm">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-800">{review.comment}</p>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon
                            key={i}
                            size={14}
                            className={i < review.rating ? "text-yellow-500" : "text-gray-300"}
                            fill={i < review.rating ? "currentColor" : "none"}
                            stroke={i < review.rating ? "currentColor" : "gray"}
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
        </div>

        


        {/* Edit & Delete Buttons */}
        <div className="p-4 border-t bg-white flex gap-4">
          <Button variant="outline" onClick={onEdit} className="flex-1 flex items-center justify-center px-6 py-2">
            <PencilIcon size={16} className="mr-2" /> Edit
          </Button>
          <Button variant="destructive" onClick={onDelete} className="flex-1 flex items-center justify-center px-6 py-2">
            <TrashIcon size={16} className="mr-2" /> Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Handles product creation and editing, including file uploads.
 */
export function ProductForm({
  product,
  onSave,
  currentUserToken,
}: {
  product: Product | null;
  onSave: (product: Partial<Product>) => void;
  currentUserToken: string;
}) {
  const [name, setName] = useState(product?.name || "");
  const [desc, setDesc] = useState(product?.desc || "");
  const [category, setCategory] = useState(product?.category.name || "");
  const [price, setPrice] = useState(product?.price.toString() || "");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(product?.imageUrls || []);
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ProductStatus>(product?.status || ProductStatus.ACTIVE);


  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const digitalFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setName(product?.name || "");
    setDesc(product?.desc || "");
    setCategory(product?.category.name || "");
    setPrice(product?.price?.toString() || "");
    setImagePreviews(product?.imageUrls || []);
    setStatus(product?.status || ProductStatus.ACTIVE);
  }, [product]);

  const isValid = name.trim() && desc.trim() && category.trim() && price && imagePreviews.length > 0 && digitalFile;

  /**
   * Handles image selection and previewing.
   */
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    const validFiles = files.filter((file) => ["image/png", "image/jpeg", "image/jpg"].includes(file.type));

    if (validFiles.length + imagePreviews.length > 3) {
      alert("You can upload a maximum of 3 images.");
      return;
    }

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));

    setImageFiles((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  // 🔹 Drag-and-Drop Image Component
function SortableImage({ id, src, onRemove }: { id: string; src: string; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative">
      <img src={src} alt="Preview" className="w-24 h-24 object-cover rounded-md shadow-md cursor-move" />
      <button className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1" onClick={onRemove}>
        <XCircleIcon size={16} />
      </button>
    </div>
  );
}

// 🔹 Drag-and-Drop Logic for Reordering
const handleDragEnd = (event: any) => {
  const { active, over } = event;
  if (active.id !== over.id) {
    const oldIndex = imagePreviews.findIndex((url) => url === active.id);
    const newIndex = imagePreviews.findIndex((url) => url === over.id);

    setImagePreviews((prev) => arrayMove(prev, oldIndex, newIndex));
    setImageFiles((prev) => arrayMove(prev, oldIndex, newIndex));
  }
};

  /**
   * Removes a selected image.
   */
  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Handles digital product file selection.
   */
  const handleDigitalFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDigitalFile(file);
    }
  };

  /**
   * Handles product submission by uploading images & digital files to the backend.
   */
  const handleSubmit = async () => {
    let uploadedImageUrls = [...imagePreviews];
    let fileUrl = "";
    let fileType = "";
    let fileSize = 0;

    try {
      if (imageFiles.length > 0) {
        uploadedImageUrls = await Promise.all(
          imageFiles.map(async (file) => await uploadProductImage(currentUserToken, file))
        );
      }

      if (digitalFile) {
        fileType = digitalFile.type;
        fileSize = digitalFile.size;
        fileUrl = await uploadProductFile(currentUserToken, digitalFile);
      }
    } catch (error) {
      console.error("File upload failed", error);
      return;
    }

    onSave({
      id: product?.id,
      name,
      desc,
      category: { name: category, imageUrl: new URL(uploadedImageUrls[0]) },
      price: Number(price),
      status,
      imageUrls: uploadedImageUrls,
      fileUrl,
      fileType,
      fileSize,
      createdAt: product?.createdAt || "",
    });
  };

  return (
    <div className="space-y-4">
      {/* 🔹 Image Upload Section */}
      <div className="space-y-2">
        <p className="text-gray-700 text-sm">Upload up to 3 images (PNG, JPG, JPEG). Drag to reorder.</p>
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={imagePreviews} strategy={verticalListSortingStrategy}>
          <div className="flex space-x-2">
            {imagePreviews.map((preview, index) => (
              <SortableImage key={preview} id={preview} src={preview} onRemove={() => removeImage(index)} />
            ))}
          </div>
          </SortableContext>
        </DndContext>
        
        
        {imagePreviews.length < 3 && (
          <>
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              ref={imageInputRef}
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
            <Button variant="outline" onClick={() => imageInputRef.current?.click()}>
              <UploadIcon size={16} className="mr-2" /> Upload Images
            </Button>
          </>
        )}
      </div>

      {/* 🔹 Digital Product Upload */}
      <div className="space-y-2">
        <p className="text-gray-700 text-sm">Upload a digital product file.</p>
        <input type="file" ref={digitalFileInputRef} onChange={handleDigitalFileChange} className="hidden" />
        <Button variant="outline" onClick={() => digitalFileInputRef.current?.click()}>
          <UploadIcon size={16} className="mr-2" /> Upload File
        </Button>
        {digitalFile && (
          <p className="text-sm text-gray-500">
            Selected: {digitalFile.name} ({(digitalFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      {/* 🔹 Product Details */}
      <Input placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} required />
      <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} required />
      <Input type="number" placeholder="Price (Tokens)" value={price} onChange={(e) => setPrice(e.target.value)} required />

      {/* Product Status Selector */}
      <div className="space-y-2">
        <h3 className="text-md font-semibold text-gray-900">Product Status</h3>
        <Select onValueChange={(newStatus) => setStatus(newStatus)} defaultValue={status}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ProductStatus.ACTIVE}>Active</SelectItem>
            <SelectItem value={ProductStatus.SCHEDULED}>Scheduled</SelectItem>
            <SelectItem value={ProductStatus.SOLD_OUT}>Sold Out</SelectItem>
            <SelectItem value={ProductStatus.EXPIRED}>Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>
  
      {/* 🔹 Confirm Button */}
      <div className="py-2 bg-white flex justify-end">
        <Button onClick={handleSubmit} disabled={!isValid} className="px-6 py-2">
          Confirm
        </Button>
      </div>
    </div>
  );
}
