import { HeroBanner } from "@/components/home/HeroBanner";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CategoriesGrid } from "@/components/home/CategoriesGrid";
import { BestSellers } from "@/components/home/BestSellers";
import { NewArrivals } from "@/components/home/NewArrivals";
import { PromoBanners } from "@/components/home/PromoBanners";
import { Testimonials } from "@/components/home/Testimonials";
import { Newsletter } from "@/components/home/Newsletter";

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <FeaturedProducts />
      <CategoriesGrid />
      <BestSellers />
      <NewArrivals />
      <PromoBanners />
      <Testimonials />
      <Newsletter />
    </>
  );
}
