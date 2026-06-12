import { Suspense } from "react";
import LoginClient from "@/components/LoginClient";

export const metadata = {
  title: "Login — CEO CaLeads Dashboard",
  description: "Sign in to access the CEO CaLeads management dashboard.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginClient />
    </Suspense>
  );
}
