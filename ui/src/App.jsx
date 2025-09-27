import React, { useEffect, useMemo, useState } from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  formatEther,
} from "viem";
import { hardhat } from "viem/chains"; // <<— use 31337 instead of localhost(1337)
import { SIMPLE_RE_ABI } from "./abi";
import "./App.css";

const CONTRACT_ADDRESS = import.meta.env.VITE_SIMPLE_RE_ADDRESS;

function Navbar({ account, onConnect }) {
  return (
    <nav className="nav">
      <div className="container nav__inner">
        <div className="nav__brand">
          <div className="brand__logo">🏡</div>
          <div className="brand__text">
            <span className="brand__name">Millow</span>
            <span className="brand__tag">Lite</span>
          </div>
        </div>
        <ul className="nav__links">
          <li>Buy</li>
          <li>Sell</li>
          <li>Rent</li>
          <li>Agents</li>
          <li>About</li>
        </ul>
        {account ? (
          <div className="nav__wallet">
            {account.slice(0, 6)}…{account.slice(-4)}
          </div>
        ) : (
          <button className="btn btn--primary" onClick={onConnect}>
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}

function Hero({ onSearch }) {
  return (
    <header className="hero">
      <div className="hero__overlay" />
      <div className="container hero__content">
        <h1>Find your next home</h1>
        <p>Explore curated properties with transparent on-chain purchase.</p>
        <div className="hero__search">
          <input
            placeholder="Search city, locality, or landmark"
            onKeyDown={(e) => e.key === "Enter" && onSearch?.(e.target.value)}
          />
          <button className="btn btn--light" onClick={() => onSearch?.("")}>
            Search
          </button>
        </div>
      </div>
    </header>
  );
}

function PropertyCard({ listing, onBuy, loading }) {
  const status = listing.sold ? "SOLD" : "AVAILABLE";
  return (
    <article className="card">
      <div className="card__media">
        <img src={listing.image} alt={listing.title} />
        <span className={`badge ${listing.sold ? "badge--sold" : "badge--ok"}`}>
          {status}
        </span>
      </div>
      <div className="card__body">
        <h3 className="card__title">{listing.title}</h3>
        <p className="card__loc">{listing.location}</p>
        <div className="card__meta">
          <div className="pill">2 Beds</div>
          <div className="pill">2 Baths</div>
          <div className="pill">980 sqft</div>
        </div>
        <div className="card__footer">
          <div className="price">{formatEther(listing.price)} ETH</div>
          <button
            className="btn btn--primary"
            disabled={loading || listing.sold}
            onClick={onBuy}
            aria-disabled={loading || listing.sold}
          >
            {listing.sold ? "Already Sold" : loading ? "Processing…" : "Buy Now"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function App() {
  const [account, setAccount] = useState("");
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);

  // Target chain = Hardhat (31337)
  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain: hardhat,
        transport: custom(window.ethereum),
      }),
    []
  );

  const walletClient = useMemo(() => {
    return window.ethereum
      ? createWalletClient({ chain: hardhat, transport: custom(window.ethereum) })
      : null;
  }, []);

  async function ensureHardhatChain() {
    if (!window.ethereum) return;
    const targetHex = "0x7A69"; // 31337
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetHex }],
      });
    } catch (err) {
      // If chain is not added in MetaMask
      if (err?.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: targetHex,
              chainName: "Hardhat Local",
              rpcUrls: ["http://127.0.0.1:8545"],
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            },
          ],
        });
      } else {
        throw err;
      }
    }
  }

  async function connect() {
    if (!window.ethereum) return alert("Install MetaMask");
    await ensureHardhatChain();
    const [addr] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(addr);
  }

  async function fetchListing() {
    const total = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: SIMPLE_RE_ABI,
      functionName: "total",
      args: [],
    });

    if (total === 0n) {
      setListing(null);
      return;
    }

    const res = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: SIMPLE_RE_ABI,
      functionName: "get",
      args: [0n],
    });

    setListing({
      seller: res[0],
      price: res[1],
      image: res[2],
      title: res[3],
      location: res[4],
      sold: res[5],
      buyer: res[6],
    });
  }

  async function buy() {
    if (!walletClient) return alert("No wallet");
    if (!listing) return;
    if (!account) return alert("Connect wallet");

    setLoading(true);
    try {
      // Make sure wallet is on the same chain (31337)
      await ensureHardhatChain();

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: SIMPLE_RE_ABI,
        functionName: "buy",
        args: [0n],
        account,
        value: listing.price, // wei from chain
      });

      await publicClient.waitForTransactionReceipt({ hash });
      await fetchListing();
      alert("Purchase successful");
    } catch (e) {
      console.error(e);
      const msg =
        e?.shortMessage ||
        e?.message ||
        e?.cause?.shortMessage ||
        "Buy failed";
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchListing();
  }, []);

  return (
    <>
      <Navbar account={account} onConnect={connect} />
      <Hero onSearch={() => {}} />

      <main className="container section">
        <div className="section__head">
          <h2>Featured Properties</h2>
          <p className="muted">Handpicked homes across prime locations</p>
        </div>

        {!listing ? (
          <div className="empty">
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
        ) : (
          <div className="grid">
            <PropertyCard listing={listing} onBuy={buy} loading={loading} />
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <div className="footer__brand">
            <div className="brand__logo brand__logo--sm">🏡</div>
            <span>Millow Lite</span>
          </div>
          <ul className="footer__links">
            <li>Privacy</li>
            <li>Terms</li>
            <li>Support</li>
          </ul>
          <div className="footer__copy">© {new Date().getFullYear()} Millow Lite</div>
        </div>
      </footer>
    </>
  );
}
