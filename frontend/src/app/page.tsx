import { auth } from "@clerk/nextjs/server";
import { Navbar } from "@/components/landing-v2/navbar";
import { Hero } from "@/components/landing-v2/hero";
import { Marquee } from "@/components/landing-v2/marquee";
import { Intro } from "@/components/landing-v2/intro";
import { HowItWorks } from "@/components/landing-v2/how-it-works";
import { Features } from "@/components/landing-v2/features";
import { Numbers } from "@/components/landing-v2/numbers";
import { Testimonial } from "@/components/landing-v2/testimonial";
import { Pricing } from "@/components/landing-v2/pricing";
import { CtaSection } from "@/components/landing-v2/cta-section";
import { LandingFooter } from "@/components/landing-v2/landing-footer";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="bg-carbon-500 text-floral overflow-x-hidden">
      <Navbar isSignedIn={!!userId} />
      <Hero />
      <Marquee />
      <Intro />
      <HowItWorks />
      <Features />
      <Numbers />
      <Testimonial />
      <Pricing />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}
