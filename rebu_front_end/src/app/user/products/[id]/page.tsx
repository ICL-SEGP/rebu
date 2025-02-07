import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
};

const products: Product[] = [
  { id: "1", name: "Laptop", description: "A high-performance laptop", price: 1200 },
  { id: "2", name: "Headphones", description: "Noise-cancelling headphones", price: 200 },
  { id: "3", name: "Smartphone", description: "Latest smartphone model", price: 800 },
];

export default async function ProductDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params; // Fetch the dynamic route parameter

  

  const product = products.find((p) => p.id === id);

  if (!product) {
    return <div className="p-6">Product not found</div>;
  }

  const handleBuyProduct = (id: string) => {
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{product.description}</p>
          <p className="text-lg font-bold text-gray-800">${product.price.toFixed(2)}</p>
          {/* <div className="flex items-center space-x-2"> */}
        <Button /*onClick={() => handleBuyProduct(id)}*/>
        Buy
        </Button>
            {/* <Toaster /> */}
        {/* </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
