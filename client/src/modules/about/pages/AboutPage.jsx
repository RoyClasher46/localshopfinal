import AboutHero from "../components/AboutHero";
import AboutMission from "../components/AboutMission";
import AboutFeatures from "../components/AboutFeatures";
import AboutHowItWorks from "../components/AboutHowItWorks";
import AboutCustomers from "../components/AboutCustomers";
import AboutShopOwners from "../components/AboutShopOwners";
import AboutCTA from "../components/AboutCTA";
import QuickActionCards from "../../../shared/components/QuickActionCards.jsx";

function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F8F4E9]">
      <AboutHero />

      <AboutMission />

      <AboutFeatures />

      <AboutHowItWorks />

      <AboutCustomers />

      <AboutShopOwners />

      <AboutCTA />

      <QuickActionCards />
    </main>
  );
}

export default AboutPage;
