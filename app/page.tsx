import Image from "next/image";
import Price from "./components/Price";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-4 p-4">
      <Image src="/flare-logo.svg" alt="Flare Logo" width={120} height={50} />

      <div className="flex gap-4 flex-wrap flex-col">
        <Price symbol="FLR" />
        <Price symbol="BTC" />
        <Price symbol="ETH" />
        <Price symbol="XRP" />
        <Price symbol="USDC" />
        <Price symbol="USDT" />
        <Price symbol="MATIC" />
      </div>
    </main>
  );
}
