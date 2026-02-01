import {
  Header,
  Hero,
  Features,
  HowItWorks,
  PricingSection,
  CtaFinal,
  Footer,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <PricingSection />
        <CtaFinal />
      </main>
      <Footer />
    </div>
  );
}
