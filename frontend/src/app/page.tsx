import { auth } from "@clerk/nextjs/server";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Marquee } from "@/components/landing/marquee";
import { Intro } from "@/components/landing/intro";
import { Features } from "@/components/landing/features";
import { Numbers } from "@/components/landing/numbers";
import { Testimonial } from "@/components/landing/testimonial";
import { Pricing } from "@/components/landing/pricing";
import { CtaSection } from "@/components/landing/cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="bg-floral text-carbon overflow-x-hidden">
      <Navbar isSignedIn={!!userId} />
      <Hero />
      <Marquee />
      <Intro />
      <Features />
      <Numbers />
      <Testimonial />
      <Pricing />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}
