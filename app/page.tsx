"use client";

import Image from "next/image";
import History from "./components/History";
import Link from "next/link";
import PriceReveal from "./components/PriceReveal";
import Price from "./components/Price";
import { Accordion, Flex, Container } from "@mantine/core";

export default function Home() {
  const tokens = [
    { symbol: "FLR", color: "#E62058" },
    { symbol: "BTC", color: "#f7931a" },
    { symbol: "XRP", color: "#00649B" },
    { symbol: "USDC", color: "#2775CA" },
    { symbol: "USDT", color: "#26A17B" },
    { symbol: "MATIC", color: "#8247E5" },
  ];

  return (
    <Container style={{ width: "80%" }}>
      <Flex
        mih={50}
        gap="lg"
        justify="center"
        align="center"
        direction="column"
        wrap="nowrap"
      >
        <Link href="https://flare.network/" target="_blank">
          <Image
            src="/flare-logo.svg"
            alt="Flare Logo"
            width={120}
            height={50}
          />
        </Link>

        <PriceReveal />

        <Accordion
          defaultValue="Apples"
          variant="contained"
          radius="md"
          className="w-full"
        >
          {tokens.map((token) => {
            return (
              <Accordion.Item key={token.symbol} value={token.symbol}>
                <Accordion.Control>
                  <Price symbol={token.symbol} />
                </Accordion.Control>
                <Accordion.Panel>
                  <History symbol={token.symbol} color={token.color} />
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>

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
      </Flex>
    </Container>
  );
}
