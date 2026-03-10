import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { PLANS, PlanKey } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowLeft, Check, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";

const Billing = () => {
  const { plan: currentPlan, subscribed, subscriptionEnd, loading, checkSubscription } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success") {
      toast.success("Subscription activated! Refreshing...");
      checkSubscription();
    } else if (checkout === "canceled") {
      toast.info("Checkout canceled");
    }
  }, [searchParams]);

  const handleCheckout = async (planKey: PlanKey) => {
    const plan = PLANS[planKey];
    if (!plan.priceId) return;
    setCheckoutLoading(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: plan.priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast.error(e.message || "Checkout failed");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast.error(e.message || "Portal failed");
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/settings"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <h1 className="font-sans text-2xl font-bold text-foreground">Billing</h1>
          </div>
        </div>

        {/* Current Plan Info */}
        {subscribed && subscriptionEnd && (
          <Card className="bg-card border-primary/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">
                  Current plan: <span className="font-bold text-primary">{PLANS[currentPlan].name}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Renews {new Date(subscriptionEnd).toLocaleDateString()}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleManage} disabled={portalLoading}>
                {portalLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Manage Subscription"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.entries(PLANS) as [PlanKey, typeof PLANS[PlanKey]][]).map(([key, plan]) => {
            const isCurrent = key === currentPlan;
            return (
              <Card key={key} className={`bg-card border-border relative ${isCurrent ? "ring-1 ring-primary" : ""}`}>
                {isCurrent && (
                  <Badge className="absolute -top-2.5 left-4 bg-primary text-primary-foreground text-[10px]">
                    Current Plan
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="font-sans text-lg">{plan.name}</CardTitle>
                  <CardDescription>
                    {plan.price === 0 ? (
                      <span className="text-2xl font-bold text-foreground">Free</span>
                    ) : (
                      <span>
                        <span className="text-2xl font-bold text-foreground">${plan.price}</span>
                        <span className="text-muted-foreground text-sm">/month</span>
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-foreground">
                        <Check className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {key === "free" ? (
                    <Button variant="outline" size="sm" className="w-full" disabled>
                      {isCurrent ? "Active" : "Default"}
                    </Button>
                  ) : isCurrent ? (
                    <Button variant="outline" size="sm" className="w-full" onClick={handleManage} disabled={portalLoading}>
                      Manage
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleCheckout(key)}
                      disabled={!!checkoutLoading}
                    >
                      {checkoutLoading === key ? (
                        <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Loading...</>
                      ) : (
                        `Upgrade to ${plan.name}`
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Button variant="ghost" size="sm" onClick={checkSubscription} disabled={loading}>
          {loading ? "Checking..." : "Refresh subscription status"}
        </Button>
      </div>
    </div>
  );
};

export default Billing;
