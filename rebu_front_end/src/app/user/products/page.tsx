import Link from "next/link";
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

export default function ProductsPage() {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <Link href={`products/${product.id}`} key={product.id}>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{product.description}</p>
              <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
