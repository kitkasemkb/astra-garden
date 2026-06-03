import Stripe from "stripe";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-05-27.dahlia" as any });

export const PLANS = {
  free: {
    name: "Free",
    nameTH: "ฟรี",
    readingsPerMonth: 3,
    price: 0,
  },
  pro: {
    name: "Pro",
    nameTH: "โปร",
    readingsPerMonth: Infinity,
    price: 299,
    priceUSD: 9,
    stripePriceId: process.env.STRIPE_PRICE_PRO_MONTHLY || "",
  },
};
