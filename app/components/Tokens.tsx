"use client";

import { Accordion } from "@mantine/core";

import Token from "./Token";

export default function Tokens() {
  const tokens = [
    { symbol: "FLR", color: "#E62058" },
    { symbol: "BTC", color: "#f7931a" },
    { symbol: "XRP", color: "#00649B" },
    { symbol: "USDC", color: "#2775CA" },
    { symbol: "USDT", color: "#26A17B" },
    { symbol: "MATIC", color: "#8247E5" },
  ];

  return (
    <Accordion
      defaultValue="Apples"
      variant="contained"
      radius="md"
      className="w-full"
    >
      {tokens.map((token) => {
        return (
          <Token symbol={token.symbol} color={token.color} key={token.symbol} />
        );
      })}
    </Accordion>
  );
}
