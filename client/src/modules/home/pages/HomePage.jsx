import CategorySection from "../components/CategorySection";
import HeroSection from "../components/HeroSection";
import ShopOwnerCTASection from "../components/ShopOwnerCTASection.jsx";
import NearbyShopsSection from "../components/NearbyShopsSection";
import HowItWorksSection from "../components/HowItWorksSection.jsx";
import HomeActionCards from "../../../shared/components/QuickActionCards.jsx";

function HomePage() {
  return (
    <>
      <HeroSection />

      <CategorySection />

      <NearbyShopsSection />

      <ShopOwnerCTASection />

      <HowItWorksSection />

      <HomeActionCards />
    </>
  );
}

export default HomePage;
