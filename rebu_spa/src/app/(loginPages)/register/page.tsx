import { Suspense } from "react";
import Register from "@/components/owned/register";

export default function RegisterWrapper() {
  return (
    <Suspense fallback={<div>Loading registration...</div>}>
      <Register />
    </Suspense>
  );
}
