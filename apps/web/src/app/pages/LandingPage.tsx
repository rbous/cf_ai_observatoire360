import Hero from "@/app/components/marketing/Hero";
import TechTicker from "@/app/components/marketing/TechTicker";
import HowItWorks from "@/app/components/marketing/HowItWorks";
import WhyUs from "@/app/components/marketing/WhyUs";
import QuebecTicker from "@/app/components/marketing/QuebecTicker";
import Pricing from "@/app/components/marketing/Pricing";
import About from "@/app/components/marketing/About";
import Resources from "@/app/components/marketing/Resources";
import Contact from "@/app/components/marketing/Contact";

export default function LandingPage() {
    return (
        <>
            {/* 1. Hero with globe */}
            <Hero />

            {/* 2. Tech ticker */}
            <TechTicker />

            {/* 3. How it works */}
            <HowItWorks />

            {/* 4. Why us */}
            <WhyUs />

            {/* 5. Quebec ticker */}
            <QuebecTicker />

            {/* 6. Pricing */}
            <Pricing />

            {/* 7. About */}
            <About />

            {/* 8. Resources + FAQ */}
            <Resources />

            {/* 9. Contact */}
            <Contact />
        </>
    );
}
