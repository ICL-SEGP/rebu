import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { UploadIcon, XCircleIcon } from "lucide-react";
import { Product, ProductStatus, Category } from "@/types/types";
import { addNewCategory, fetchCategoryImageFile } from "@/lib/api/marketplace";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { compress, processAndUploadFile, uploadFile } from "@/lib/api/aws";
import toast from "react-hot-toast";
import { file } from "jszip";

export function EditProductForm({
  product,
  onSave,
  currentUserToken,
  categories,
  setCategories,
}) {
  console.log("testprod", product);

  const [name, setName] = useState(product?.name);
  const [desc, setDesc] = useState(product?.desc);
  const [category, setCategory] = useState(product?.category?.name);
  const [price, setPrice] = useState(product?.price.toString());
  const [status, setStatus] = useState<ProductStatus>(
    product?.status || ProductStatus.ACTIVE
  );

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    product?.imageUrls || []
  );

  // uploads
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const digitalFileInputRef = useRef<HTMLInputElement | null>(null);

  const [digitalFile, setDigitalFile] = useState<File | null>(null);

  const [digitalFileUrl, setDigitalFileUrl] = useState<String | null>(null);
  const [digitalFileType, setDigitalFileType] = useState<String | null>(null);

  // for searching category
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDigitalFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setDigitalFile(file);
    }
  };

  useEffect(() => {
    setName(product?.name || "");
    setDesc(product?.desc || "");
    setCategory(product?.category?.name || "");
    setPrice(product?.price?.toString() || "");
    setImagePreviews(product?.imageUrls || []);
    setStatus(product?.status || ProductStatus.ACTIVE);
    setDigitalFileUrl(product?.fileUrl || "");
    setDigitalFileType(product?.fileType || "");
  }, [product]);

  useEffect(() => {
    const updatedCategories = categories.filter((cat) =>
      cat.name.toLowerCase().includes((category || "").toLowerCase())
    );

    if (
      JSON.stringify(updatedCategories) !== JSON.stringify(filteredCategories)
    ) {
      setFilteredCategories(updatedCategories);
    }
  }, [category, categories]);

  function isNewCategory(categoryName: string, products: Product[]): boolean {
    const existingCategories = new Set(
      categories.map((p) => p.name.toLowerCase())
    );

    return !existingCategories.has(categoryName.toLowerCase()); // ✅ Returns true if it's a new category
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCategory = e.target.value;
    if (newCategory !== category) {
      setCategory(newCategory);
      setShowDropdown(true);
    }
  };

  const handleCategorySelect = (selected: string) => {
    setCategory(selected);
    setShowDropdown(false);
  };

  const handleCategoryConfirm = async () => {
    if (!category.trim()) return;

    if (isNewCategory(category, categories)) {
      const imageFile = await fetchCategoryImageFile(category);

      const compressedImageFile = await compress([imageFile]);

      const imageFileUrl = await uploadFile(
        currentUserToken,
        "image",
        compressedImageFile[0]
      );

      try {
        const newCategory = await addNewCategory(currentUserToken, {
          name: category,
          imageUrl: imageFileUrl?.url,
        });

        if (newCategory) {
          setCategories((prevCategories) => [...prevCategories, newCategory]);
        }
      } catch (error) {
        console.error("Failed to add new category:", error);
        return;
      }
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    const validFiles = files.filter((file) =>
      ["image/png", "image/jpeg", "image/jpg"].includes(file.type)
    );

    if (validFiles.length + imagePreviews.length > 3) {
      alert("You can upload a maximum of 3 images.");
      return;
    }

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));

    setImageFiles((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    console.log("trying to rmeove image...");
    setImagePreviews((prevPreviews) => {
      const updatedPreviews = prevPreviews.filter((_, i) => i !== index);
      setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
      return updatedPreviews;
    });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = imagePreviews.findIndex((url) => url === active.id);
      const newIndex = imagePreviews.findIndex((url) => url === over.id);

      setImagePreviews((prev) => arrayMove(prev, oldIndex, newIndex));
      setImageFiles((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  };

  const handleSubmit = async () => {
    let imagesUrlsNew = [];

    if (
      !name.trim() ||
      !desc.trim() ||
      !category.trim() ||
      !price ||
      imagePreviews.length === 0 ||
      (!digitalFile && !product.fileUrl)
    ) {
      toast.error("Please fill out all fields before submitting.");
      return;
    }

    await handleCategoryConfirm();

    let uploadedFileUrl = null;
    let uploadedFileType = null;

    try {
      const compressedImageFiles = await compress(imageFiles);

      const urls = await Promise.all(
        compressedImageFiles.map(async (file) => {
          return await uploadFile(currentUserToken, "image", file);
        })
      );

      imagesUrlsNew = urls.map((url) => url!.url);

      if (digitalFile) {
        const toastId = toast.loading(
          "Adding digital file to the marketplace.",
          {
            id: "adding digital file",
          }
        );
        const digitalUploadResult = await processAndUploadFile(
          currentUserToken,
          "file",
          [digitalFile!]
        );
        console.log("ret", digitalUploadResult);
        uploadedFileUrl = digitalUploadResult.url;
        uploadedFileType = digitalUploadResult.type;
        toast.dismiss(toastId);
      }

      console.log("digital file");
    } catch (error) {
      console.error("File upload failed", error);
      return;
    }

    const toSave = {
      name,
      desc,
      category: category,
      price: Number(price),
      status,
      imageUrls: imagesUrlsNew,
      fileUrl: uploadedFileUrl, // <-- use local variable
      fileType: uploadedFileType, // <-- use local variable
    };

    console.log("tosave new ", toSave);
    console.log("Url", uploadedFileUrl);
    console.log("type", uploadedFileType);

    onSave(toSave);
  };

  const isValid =
    name.trim() &&
    desc.trim() &&
    category.trim() &&
    price &&
    imagePreviews.length > 0 &&
    (digitalFile || product?.fileUrl);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-gray-700 text-sm">
          Upload up to 3 images (PNG, JPG, JPEG). Drag to reorder.
        </p>
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={imagePreviews}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex space-x-2">
              {imagePreviews.map((preview, index) => (
                <SortableImage
                  key={preview}
                  id={preview}
                  src={preview}
                  onRemove={() => removeImage(index)}
                />
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
            <Button
              variant="outline"
              onClick={() => imageInputRef.current?.click()}
            >
              <UploadIcon size={16} className="mr-2" /> Upload Images
            </Button>
          </>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-gray-700 text-sm">Upload a digital product file.</p>
        <input
          type="file"
          ref={digitalFileInputRef}
          onChange={handleDigitalFileChange}
          className="hidden"
        />
        <Button
          variant="outline"
          onClick={() => digitalFileInputRef.current?.click()}
        >
          <UploadIcon size={16} className="mr-2" /> Upload File
        </Button>
        {digitalFile ? (
          <p className="text-sm text-gray-500">
            Selected: {digitalFile.name} (
            {(digitalFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        ) : product.fileUrl ? (
          <p className="text-sm text-gray-500">{product.fileUrl}</p>
        ) : null}
      </div>

      <Input
        placeholder="Product Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        placeholder="Description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        required
      />
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder="Enter category"
          value={category || product?.category?.name || ""}
          onChange={handleCategoryChange}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        />
        {showDropdown && filteredCategories.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-md max-h-40 overflow-y-auto">
            {filteredCategories.map((cat) => (
              <div
                key={cat.name}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleCategorySelect(cat.name);
                }}
              >
                {cat.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <Input
        type="number"
        placeholder="Price (Tokens)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />

      <div className="space-y-2">
        <h3 className="text-md font-semibold text-gray-900">Product Status</h3>
        <Select
          onValueChange={(newStatus) => setStatus(newStatus as ProductStatus)}
          defaultValue={status}
        >
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

      <div className="py-2 bg-white flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!isValid}
          className="px-6 py-2"
        >
          Confirm
        </Button>
      </div>
    </div>
  );
}

function SortableImage({
  id,
  src,
  onRemove,
}: {
  id: string;
  src: string;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative"
    >
      <img
        src={src}
        alt="Preview"
        className="w-24 h-24 object-cover rounded-md shadow-md cursor-move"
      />
      <button className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1">
        <XCircleIcon
          onClick={() => {
            console.log("Remove button clicked for ID:", id); // Add this line
            onRemove();
          }}
          size={16}
        />
      </button>
    </div>
  );
}
