import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SimpleRealEstateModule", (m) => {
  const re = m.contract("SimpleRealEstate");

  // Seed one listing (≈ 1 ETH) — change image/title/location as you like
  m.call(re, "list", [
    1_000_000_000_000_000_000n,
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3Rd2gw1Y1UnSvinELcD0jOIT_e3DQm0rrzA&s",
    "Modern Villa",
    "Wakad, Pune"
  ]);

  return { re };
});
