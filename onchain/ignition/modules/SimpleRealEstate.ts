import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SimpleRealEstateModule", (m) => {
  const re = m.contract("SimpleRealEstate");

  // Seed one listing (≈ 1 ETH) — change image/title/location as you like
  m.call(re, "list", [
    1_000_000_000_000_000_000n,
    "https://images.unsplash.com/photo-1560185008-b033106af2b8",
    "Modern 2BHK Apartment",
    "Wakad, Pune"
  ]);

  return { re };
});
