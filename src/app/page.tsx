import Link from "next/link";
import Header from "./component/header";
import Hero from "./component/hero";
import ValueProposition from "./component/value-proposition";
import ClientAccessSystem from "./component/client-access-system";
import Testimonials from "./component/testimonials";
import Stats from "./component/stats";
import HowItWorks from "./component/how-it-works";
import WorldMapDemo from "./component/world-map-demo";
import Comparison from "./component/comparison";
import TokenSystem from "./component/token-system";
import AIAgents from "./component/ai-agents";
import IsThisForYou from "./component/is-this-for-you";
import PricingSection from "./component/pricing-section";
import OurPromise from "./component/our-promise";
import FAQ from "./component/faq";
import Trust from "./component/trust";
import FinalCTA from "./component/final-cta";
import Footer from "./component/footer";
import StickyBottomBar from "./component/sticky-bottom-bar";

export default function Home() {
  return (
    <main className="bg-white text-black overflow-x-hidden">
      <Header />
      <Hero />
      <div id="features">
        <ValueProposition />
      </div>
      <ClientAccessSystem />
      <Testimonials />
      <Stats />
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <WorldMapDemo />
      <Comparison />
      <TokenSystem />
      <AIAgents />
      <IsThisForYou />
      <div id="pricing">
        <PricingSection />
      </div>
      <OurPromise />
      <FAQ />
      <Trust />
      <FinalCTA />
      <Footer />
      <StickyBottomBar />
    </main>
  );
}
