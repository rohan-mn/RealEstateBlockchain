import React, { useEffect, useMemo, useState } from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  formatEther,
  parseEther,
  http,
} from "viem";
import { hardhat } from "viem/chains";
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

function SellForm({ onList }) {
  const [title, setTitle] = useState("");
  const [loc, setLoc] = useState("");
  const [img, setImg] = useState("");
  const [priceEth, setPriceEth] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title || !loc || !img || !priceEth) return alert("Fill all fields");
    setBusy(true);
    try {
      const priceWei = parseEther(priceEth);
      await onList(priceWei, img.trim(), title.trim(), loc.trim());
      setTitle("");
      setLoc("");
      setImg("");
      setPriceEth("");
      alert("Listing created!");
    } catch (err) {
      console.error(err);
      alert(err?.shortMessage || err?.message || "List failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="sell">
      <div className="container">
        <h2>Sell your property</h2>
        <p className="muted">
          Enter the details below to publish a listing on-chain.
        </p>
        <form className="sell__form" onSubmit={handleSubmit}>
          <div className="form__row">
            <label>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Spacious 3BHK Apartment"
            />
          </div>
          <div className="form__row">
            <label>Location</label>
            <input
              value={loc}
              onChange={(e) => setLoc(e.target.value)}
              placeholder="e.g., Wakad, Pune"
            />
          </div>
          <div className="form__row">
            <label>Image URL</label>
            <input
              value={img}
              onChange={(e) => setImg(e.target.value)}
              placeholder="https://…"
            />
          </div>
          <div className="form__row">
            <label>Price (ETH)</label>
            <input
              type="number"
              step="0.0001"
              min="0"
              value={priceEth}
              onChange={(e) => setPriceEth(e.target.value)}
              placeholder="1.0"
            />
          </div>
          <button className="btn btn--primary" disabled={busy}>
            {busy ? "Listing…" : "Create Listing"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default function App() {
  const [account, setAccount] = useState("");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // ✅ Reads via HTTP RPC (always Hardhat node)
  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain: hardhat,
        transport: http("http://127.0.0.1:8545"),
      }),
    []
  );

  // ✅ Writes via MetaMask
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
      if (err?.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: targetHex,
            chainName: "Hardhat Local",
            rpcUrls: ["http://127.0.0.1:8545"],
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
          }],
        });
      } else {
        throw err;
      }
    }
  }

  async function connect() {
    if (!window.ethereum) return alert("Install MetaMask");
    await ensureHardhatChain();
    const [addr] = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(addr);
  }

  async function fetchAll() {
    setFetching(true);
    try {
      const total = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: SIMPLE_RE_ABI,
        functionName: "total",
      });

      const count = Number(total);
      console.log("Total listings on-chain:", count, "at", CONTRACT_ADDRESS);

      if (count === 0) {
        setListings([]);
        return;
      }

      const calls = Array.from({ length: count }, (_, i) =>
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: SIMPLE_RE_ABI,
          functionName: "get",
          args: [BigInt(i)],
        }).then((r) => ({
          id: i,
          seller: r[0],
          price: r[1],
          image: r[2],
          title: r[3],
          location: r[4],
          sold: r[5],
          buyer: r[6],
        }))
      );

      setListings(await Promise.all(calls));
    } finally {
      setFetching(false);
    }
  }

  async function buy(id, priceWei) {
    if (!walletClient) return alert("No wallet");
    if (!account) return alert("Connect wallet");
    setLoading(true);
    try {
      await ensureHardhatChain();
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: SIMPLE_RE_ABI,
        functionName: "buy",
        args: [BigInt(id)],
        account,
        value: priceWei,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      await fetchAll();
      alert("Purchase successful");
    } catch (e) {
      console.error(e);
      alert(e?.shortMessage || e?.message || "Buy failed");
    } finally {
      setLoading(false);
    }
  }

  async function listNew(priceWei, image, title, location_) {
    if (!walletClient) throw new Error("No wallet");
    if (!account) throw new Error("Connect wallet");
    await ensureHardhatChain();
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: SIMPLE_RE_ABI,
      functionName: "list",
      args: [priceWei, image, title, location_],
      account,
    });
    await publicClient.waitForTransactionReceipt({ hash });
    await fetchAll();
  }

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <>
      <Navbar account={account} onConnect={connect} />
      <Hero onSearch={() => {}} />

      <main className="container section">
        <div className="section__head">
          <h2>Featured Properties</h2>
          <p className="muted">Handpicked homes across prime locations</p>
          <small className="muted">On-chain count: {listings.length}</small>
        </div>

        {fetching ? (
          <div className="empty">
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
        ) : listings.length === 0 ? (
          <div className="empty">No listings yet. Be the first to sell!</div>
        ) : (
          <div className="grid">
            {listings.map((l) => (
              <PropertyCard
                key={l.id}
                listing={l}
                loading={loading}
                onBuy={() => buy(l.id, l.price)}
              />
            ))}
          </div>
        )}
      </main>

      <SellForm onList={listNew} />

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
          <div className="footer__copy">
            © {new Date().getFullYear()} Millow Lite
          </div>
        </div>
      </footer>
    </>
  );
}
