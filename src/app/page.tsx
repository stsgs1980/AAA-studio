import { Navbar } from "@/features/landing/components/navbar";
import { Hero } from "@/features/landing/components/hero";
import { Features } from "@/features/landing/components/features";
import { Architecture } from "@/features/landing/components/architecture";
import { Stats } from "@/features/landing/components/stats";
import { CtaSection } from "@/features/landing/components/cta-section";
import { Footer } from "@/features/landing/components/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <Architecture />
      <Stats />
      <CtaSection />
      <Footer />
    </div>
  );
}
