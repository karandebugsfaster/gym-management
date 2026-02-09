import { Suspense } from "react";
import ManagerClient from "./ManagerClient";

export default function ManagerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      }
    >
      <ManagerClient />
    </Suspense>
  );
}
