import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PlanKey } from "@/lib/plans";

interface SubscriptionContextType {
  plan: PlanKey;
  subscribed: boolean;
  subscriptionEnd: string | null;
  loading: boolean;
  checkSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  plan: "free",
  subscribed: false,
  subscriptionEnd: null,
  loading: true,
  checkSubscription: async () => {},
});

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session } = useAuth();
  const [plan, setPlan] = useState<PlanKey>("free");
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    if (!session) {
      setPlan("free");
      setSubscribed(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) {
        console.error("check-subscription error:", error);
        setLoading(false);
        return;
      }
      setPlan((data?.plan as PlanKey) || "free");
      setSubscribed(data?.subscribed || false);
      setSubscriptionEnd(data?.subscription_end || null);
    } catch (e) {
      console.error("Subscription check failed:", e);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      setPlan("free");
      setSubscribed(false);
      setLoading(false);
    }
  }, [user, checkSubscription]);

  // Refresh every 60s
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  return (
    <SubscriptionContext.Provider value={{ plan, subscribed, subscriptionEnd, loading, checkSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);
