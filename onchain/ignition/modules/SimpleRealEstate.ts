import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SimpleRealEstateModule", (m) => {
  const re = m.contract("SimpleRealEstate");

  // Seed a few listings (≈ 1 ETH, 1.2 ETH, 0.8 ETH)
  m.call(re, "list", [
    1_000_000_000_000_000_000n,
    "https://pix10.agoda.net/hotelImages/28139269/0/a527ac179447ac5aa63f2335dc2f1029.jpg?ca=25&ce=0&s=414x232&ar=16x9",
    "Modern 2BHK Apartment",
    "Wakad, Pune",
  ], { id: "SeedListing1" });

  m.call(re, "list", [
    1_200_000_000_000_000_000n,
    "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg",
    "Luxury Villa with Pool",
    "Baner, Pune",
  ], { id: "SeedListing2" });

  m.call(re, "list", [
    800_000_000_000_000_000n,
    "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg",
    "Cozy Studio",
    "Kharadi, Pune",
  ], { id: "SeedListing3" });

  return { re };
});
