// Stripe product/price mapping
export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    priceId: null,
    productId: null,
    features: ["10 notes max", "Limited AI analysis", "Basic CVE lookup"],
    notesLimit: 10,
    aiLimit: true,
  },
  pro: {
    name: "Pro",
    price: 15,
    priceId: "price_1T9KDSJgo8xYL0Th3smOQyYJ",
    productId: "prod_U7ZMq9JrQY0WwO",
    features: ["Unlimited notes", "Unlimited AI threat analysis", "Full CVE intelligence", "Priority support"],
    notesLimit: Infinity,
    aiLimit: false,
  },
  enterprise: {
    name: "Enterprise",
    price: 49,
    priceId: "price_1T9KDoJgo8xYL0Th2rIbqHra",
    productId: "prod_U7ZMpOyLMNkMeV",
    features: ["Everything in Pro", "Team workspace", "Collaboration", "Advanced AI insights", "Dedicated support"],
    notesLimit: Infinity,
    aiLimit: false,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
