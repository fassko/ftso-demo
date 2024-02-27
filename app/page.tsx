"use client";

import Image from "next/image";
import Link from "next/link";

import EpochInfo from "./components/EpochInfo";
import Tokens from "./components/Tokens";

export default function Home() {
  return (
    <div className="w-[95%] md:w-[70%] mx-auto p-4">
      <div className="flex flex-col justify-center items-center gap-4">
        <Link href="https://flare.network/" target="_blank">
          <Image
            src="/flare-logo.svg"
            alt="Flare Logo"
            width={120}
            height={50}
          />
        </Link>

        <EpochInfo />

        <Tokens />

        <div className="flex flex-col gap-1 justify-center items-center">
          <p className="pt-6 text-center">
            Prices are provided with{" "}
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
        </div>
      </div>
    </div>
  );
}
