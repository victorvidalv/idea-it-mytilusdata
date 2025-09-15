import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
    return (
        <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-background via-background to-primary/5">
            <div className="w-full max-w-sm">
                <AuthForm />
            </div>
        </div>
    );
}
