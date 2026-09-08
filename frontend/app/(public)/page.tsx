import Header from "@/components/home/Header";
import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import HowItWorks from "@/components/home/HowItWorks";
import Benefits from "@/components/home/Benefits";
import CTA from "@/components/home/CTA";
import Footer from "@/components/home/Footer";
import ScrollToTopButton from "@/components/shared/ScrollToTopButton";

export default function Home() {
  return (
    <main
      className="
    min-h-screen
    overflow-x-hidden
    bg-[#020b24]
    text-white
  "
    >
      <Header />
      <Hero />
      <About />
      <HowItWorks />
      <Benefits />
      <CTA />
      <Footer />

      <ScrollToTopButton />
    </main>
  );
}
