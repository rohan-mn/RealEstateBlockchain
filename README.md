# RealEstate DApp Project

This project is a full-stack decentralized application for listing and buying real estate properties on-chain. It includes:

- **Smart Contract:** A Solidity contract for property listings and purchases.
- **Frontend:** A React + Vite UI for interacting with the contract.
- **Hardhat 3 Beta:** Modern Hardhat config and scripts, using `viem` for Ethereum interactions.
- **Ignition Modules:** For easy deployment and seeding of listings.

---

## Structure

```
RealEstate/
├── onchain/        # Solidity contracts, Hardhat config, deployment scripts
│   ├── contracts/  # Contains SimpleRealEstate.sol
│   ├── ignition/   # Ignition deployment modules and artifacts
│   ├── test/       # Node.js and Solidity tests
│   ├── scripts/    # Example scripts
│   ├── hardhat.config.ts
│   └── package.json
├── ui/             # React frontend
│   ├── src/        # React components, ABI, styles
│   ├── public/
│   ├── vite.config.js
│   ├── package.json
│   └── .env        # Contract address for frontend
```

---

## Onchain: Smart Contract

### `SimpleRealEstate.sol`

A minimal contract for listing properties and buying them directly on-chain.

- **list(priceWei, image, title, location_)**: Create a new property listing.
- **get(id)**: Read details of a listing.
- **total()**: Get total number of listings.
- **buy(id)**: Buy a property at the listed price (ETH is sent directly to the seller).

See [`onchain/contracts/SimpleRealEstate.sol`](onchain/contracts/SimpleRealEstate.sol) for full code.

### Deployment & Testing

- **Deploy locally:**  
  ```
  npx hardhat ignition deploy onchain/ignition/modules/SimpleRealEstate.ts
  ```
- **Run tests:**  
  ```
  npx hardhat test
  ```

---

## Frontend: React + Vite

A simple UI for browsing, listing, and buying properties.

- **Connect MetaMask** to interact with the contract.
- **List new properties** with title, location, image, and price.
- **Buy properties** directly on-chain.

### Setup

1. Install dependencies:
   ```
   cd ui
   npm install
   ```
2. Set contract address in `.env`:
   ```
   VITE_SIMPLE_RE_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
   ```
3. Start the frontend:
   ```
   npm run dev
   ```

### ABI

See [`ui/src/abi.js`](ui/src/abi.js) for the contract ABI used by the frontend.

---

## Hardhat Configuration

- Uses Hardhat 3 Beta with `viem` for contract interactions.
- Networks:
  - `localhost`: For local development.
  - `sepolia`: For testnet deployments (requires environment variables).

See [`onchain/hardhat.config.ts`](onchain/hardhat.config.ts) for details.

---

## Ignition Deployment

Seed listings are created via [`onchain/ignition/modules/SimpleRealEstate.ts`](onchain/ignition/modules/SimpleRealEstate.ts).

---

## Useful Commands

- **Compile contracts:**  
  ```
  npx hardhat compile
  ```
- **Run tests:**  
  ```
  npx hardhat test
  ```
- **Deploy contract:**  
  ```
  npx hardhat ignition deploy onchain/ignition/modules/SimpleRealEstate.ts
  ```
- **Start frontend:**  
  ```
  cd ui
  npm run dev
  ```

---

## License

MIT

---

## Credits

- [Hardhat](https://hardhat.org/)
- [Viem](https://viem.sh/)
- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)