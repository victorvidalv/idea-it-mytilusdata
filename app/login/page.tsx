import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    return (
        <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-background via-background to-primary/5">
            <div className="w-full max-w-sm">
                <Suspense fallback={
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                }>
                    <AuthForm />
                </Suspense>
            </div>
        </div>
    );
}
