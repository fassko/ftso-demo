import Image from "next/image";
import Price from "./components/Price";
import Link from "next/link";
import PriceReveal from "./components/PriceReveal";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-4 p-4">
      <Link href="https://flare.network/" target="_blank">
        <Image src="/flare-logo.svg" alt="Flare Logo" width={120} height={50} />
      </Link>

      <PriceReveal />

      <div className="flex gap-4 flex-wrap flex-col w-full">
        <Price symbol="FLR" />
        <Price symbol="BTC" />
        <Price symbol="ETH" />
        <Price symbol="XRP" />
        <Price symbol="USDC" />
        <Price symbol="USDT" />
        <Price symbol="MATIC" />
      </div>

      <p className="pt-6 text-center">
        Prices are provided by{" "}
        <Link
          href="https://docs.flare.network/tech/ftso/"
          target="_blank"
          className="font-medium hover:underline"
        >
          Flare Time Series Oracle (FTSO)
        </Link>
        .
      </p>

      <p>
        Github:{" "}
        <Link
          href="https://github.com/fassko/ftso-demo"
          target="_blank"
          className="font-medium hover:underline"
        >
          https://github.com/fassko/ftso-demo
        </Link>
      </p>
    </main>
  );
}
