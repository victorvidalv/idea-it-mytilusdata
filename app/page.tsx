import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations('home');

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-8">
        <h1 className="text-6xl md:text-8xl font-outfit font-black tracking-tighter">
          IT25I0032
        </h1>
        <Button size="lg" className="h-14 px-12 text-lg font-semibold" asChild>
          <Link href="/login">{t('access')}</Link>
        </Button>
      </div>
    </div>
  );
}
