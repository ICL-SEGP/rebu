"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Purchase, Product, OrderStatus } from "@/types/app";
import { getUserPurchases, getSingleProduct } from "@/lib/api/marketplace";
import { Button } from "@/components/ui/helpers/button";
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/tables/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/modals/dialog";
import { useRouter } from "next/navigation";

const PurchaseHistory = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [productDetails, setProductDetails] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }

    // TODO: Fetch purchases from backend
    // getUserPurchases(session.token, session.user.id).then(setPurchases).catch(console.error);
    
    // Dummy Data
    setPurchases([
      {
        id: 1,
        buyerId: 123,
        sellerId: 456,
        productId: 789,
        totalAmount: 49.99,
        orderDate: "",
        status: OrderStatus.COMPLETED,
      },
    ]);
  }, [session, router]);

  const handleOpenModal = async (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsModalOpen(true);
    
    // TODO: Fetch product details from backend
    // const product = await getSingleProduct(purchase.productId);
    // setProductDetails(product);
    
    // Dummy Data
    setProductDetails({
      id: 789,
      name: "Digital Art Pack",
      desc: "A collection of high-resolution digital artworks.",
      price: 49.99,
      imageUrls: ["/placeholder.png"],
      fileUrl: "https://example.com/download.zip",
      fileType: "zip",
      fileSize: 10485760,
      category: { name: "Art", imageUrl: new URL("https://example.com/category.png") },
      status: "active",
      createdAt: "",
      sellerId: 456,
      reviews: [],
      sellerPubKey: "abcdef123456",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Purchase History</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((purchase) => (
            <TableRow key={purchase.id}>
              <TableCell>{purchase.productId}</TableCell>
              <TableCell>${purchase.totalAmount.toFixed(2)}</TableCell>
              <TableCell>{purchase.status}</TableCell>
              <TableCell>
                <Button onClick={() => handleOpenModal(purchase)}>View Details</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Details</DialogTitle>
          </DialogHeader>
          {selectedPurchase && productDetails ? (
            <div className="space-y-4">
              <img src={productDetails.imageUrls[0]} alt={productDetails.name} className="w-full h-64 object-cover rounded-md" />
              <div>
                <h2 className="text-xl font-bold">{productDetails.name}</h2>
                <p className="text-gray-700">{productDetails.desc}</p>
              </div>
              <div className="text-sm text-gray-600">
                <p><strong>Price:</strong> {productDetails.price} token</p>
                <p><strong>Seller ID:</strong> {productDetails.sellerId}</p>
                <p><strong>Purchase Date:</strong> {new Date(selectedPurchase.orderDate).toDateString()}</p>
                <p><strong>Status:</strong> {selectedPurchase.status}</p>
              </div>
              <a href={productDetails.fileUrl} download className="block">
                <Button className="w-auto bg-black text-white py-1 px-3 rounded-md hover:bg-gray-800 transition">
                  Download File ({productDetails.fileType})
                </Button>
              </a>
            </div>
          ) : (
            <p>Loading details...</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseHistory;
