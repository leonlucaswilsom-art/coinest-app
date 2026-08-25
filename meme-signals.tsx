import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { toast } from "sonner";
import { Loader2, Radar, TrendingUp } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatUSDCompact } from "@/lib/format";

interface MemeSignal {
  id: string;
  name: string;
  symbol: string;
  price: number | null;
  change24h: number | null;
  marketCapUsd: number | null;
  trendRank: number;
  score: number;
  reason: string;
}

function extractMessage(error: unknown) {
  return error instanceof Error && "data" in error
    ? String((error as { data?: { message?: string } }).data?.message ??
        error.message)
    : "Couldn't scan the market right now.";
}

function formatPrice(value: number | null) {
  if (value === null) return "—";
  if (value >= 1) return `$${value.toFixed(2)}`;
  if (value >= 0.0001) return `$${value.toFixed(6)}`;
  return `$${value.toPrecision(3)}`;
}

function scoreColor(score: number) {
  if (score >= 30) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  if (score >= 20) return "bg-sky-500/10 text-sky-600 dark:text-sky-400";
  if (score >= 10) return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  return "bg-muted text-muted-foreground";
}

export function MemeSignals() {
  const usage = useQuery(api.ai.getDailyUsage);
  const getSignals = useAction(api.aiActions.getMemeSignals);

  const [signals, setSignals] = useState<MemeSignal[] | null>(null);
  const [generatedAt, setGeneratedAt] = useState<number | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const used = usage?.signalsUsed ?? 0;
  const limit = usage?.limit ?? 10;
  const remaining = Math.max(0, limit - used);

  const scan = async () => {
    if (isScanning || remaining === 0) return;
    setIsScanning(true);
    setSignals(null);
    try {
      const result = await getSignals();
      setSignals(result.signals);
      setGeneratedAt(result.generatedAt);
    } catch (error) {
      toast.error("Couldn't scan the market", {
        description: extractMessage(error),
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Card className="border-border/70 shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Radar className="size-4 text-primary" />
            Meme Signal Board
          </CardTitle>
          <CardDescription>
            Which meme coins are trending right now — data-driven, not hype
          </CardDescription>
        </div>
        {usage === undefined ? (
          <Skeleton className="h-6 w-20" />
        ) : (
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium tabular-nums",
              remaining === 0
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary",
            )}
          >
            {remaining} of {limit} left today
          </span>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            One scan checks CoinGecko's live trending list and ranks the meme
            coins by momentum.
          </p>
          <Button
            onClick={scan}
            disabled={isScanning || remaining === 0}
            className="shrink-0 gap-1.5"
          >
            {isScanning ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <TrendingUp className="size-4" />
            )}
            {isScanning ? "Scanning…" : "Scan market"}
          </Button>
        </div>

        {remaining === 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            You've used today's {limit} scans — come back tomorrow, or upgrade
            to Premium for 10 every day.
          </p>
        )}

        {isScanning && (
          <div className="mt-4 grid gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/70 p-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-2 h-3 w-48" />
              </div>
            ))}
          </div>
        )}

        {!isScanning && signals !== null && (
          <>
            {signals.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-border/80 px-6 py-8 text-center">
                <p className="text-sm font-medium">No meme coins trending</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Nothing from the watchlist is on CoinGecko's trending board
                  right now. Try again later.
                </p>
              </div>
            ) : (
              <>
                <ul className="mt-4 grid gap-3">
                  {signals.map((signal) => (
                    <li
                      key={signal.id}
                      className="rounded-xl border border-border/70 bg-background/60 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-xs font-semibold text-primary">
                            {signal.symbol.slice(0, 4)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {signal.name}
                              <span className="ml-1.5 font-mono text-xs text-muted-foreground">
                                {signal.symbol}
                              </span>
                            </p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {signal.reason}
                            </p>
                          </div>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                            scoreColor(signal.score),
                          )}
                        >
                          {signal.score}/55
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          Price{" "}
                          <span className="font-medium tabular-nums text-foreground">
                            {formatPrice(signal.price)}
                          </span>
                        </span>
                        <span>
                          24h{" "}
                          <span
                            className={cn(
                              "font-medium tabular-nums",
                              signal.change24h === null
                                ? "text-muted-foreground"
                                : signal.change24h >= 0
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-red-600 dark:text-red-400",
                            )}
                          >
                            {signal.change24h === null
                              ? "—"
                              : `${signal.change24h >= 0 ? "+" : ""}${signal.change24h.toFixed(1)}%`}
                          </span>
                        </span>
                        <span>
                          Market cap{" "}
                          <span className="font-medium tabular-nums text-foreground">
                            {signal.marketCapUsd !== null
                              ? formatUSDCompact(signal.marketCapUsd)
                              : "—"}
                          </span>
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">
                  Score = trending position + 24h momentum. Last scan{" "}
                  {generatedAt !== null
                    ? new Date(generatedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                  . Signals are educational, not financial advice — always do
                  your own research before trading.
                </p>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
