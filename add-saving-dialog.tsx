import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatUSD } from "@/lib/format";

const COMMON_ASSETS = ["BTC", "ETH", "SOL", "DOGE", "USDT", "USDC", "USD"];

export interface AddSavingGoal {
  _id: string;
  name: string;
}

export function AddSavingDialog({
  goals,
  variant = "default",
  buttonLabel = "Add saving",
}: {
  goals: AddSavingGoal[];
  variant?: "default" | "outline" | "secondary";
  buttonLabel?: string;
}) {
  const addSaving = useMutation(api.savings.addSaving);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState("USD");
  const [customAsset, setCustomAsset] = useState("");
  const [assetAmount, setAssetAmount] = useState("");
  const [note, setNote] = useState("");
  const [goalId, setGoalId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Idempotency key: one per logical save. If the request fails and the user
  // retries, the same key is sent again so the server can dedupe instead of
  // double-counting. Editing the form invalidates the key, so a genuinely new
  // save always goes through.
  const requestKeyRef = useRef<string | null>(null);

  const touch = () => {
    requestKeyRef.current = null;
  };

  const reset = () => {
    setAmount("");
    setAsset("USD");
    setCustomAsset("");
    setAssetAmount("");
    setNote("");
    setGoalId("");
    requestKeyRef.current = null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = Number.parseFloat(amount);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Enter an amount greater than $0.");
      return;
    }

    const finalAsset =
      asset === "Other" ? customAsset.trim() : asset.trim();
    if (!finalAsset) {
      toast.error("Enter the coin you saved in.");
      return;
    }

    if (!requestKeyRef.current) {
      requestKeyRef.current = crypto.randomUUID();
    }
    setIsSubmitting(true);
    try {
      await addSaving({
        amountUsd: value,
        asset: finalAsset,
        assetAmount:
          assetAmount.trim() !== ""
            ? Number.parseFloat(assetAmount)
            : undefined,
        note: note.trim() !== "" ? note.trim() : undefined,
        goalId: goalId !== "" ? (goalId as Id<"goals">) : undefined,
        requestKey: requestKeyRef.current,
      });
      toast.success("Save logged successfully.", {
        description: `${formatUSD(value)} set aside in ${finalAsset}.`,
      });
      reset();
      setOpen(false);
    } catch (error) {
      const message =
        error instanceof Error && "data" in error
          ? String((error as { data?: { message?: string } }).data?.message ??
              error.message)
          : "Couldn't log that save. Please try again.";
      toast.error("Couldn't log that save", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className="gap-2">
          <Plus className="size-4" />
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log a save</DialogTitle>
          <DialogDescription>
            How much did you set aside today? Enter the USD value of any coin —
            it takes seconds.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount saved (USD)</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <Input
                id="amount"
                inputMode="decimal"
                placeholder="25.00"
                className="pl-7"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  touch();
                }}
                required
                min={0.01}
                step={0.01}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="asset">Coin you saved in</Label>
            <Select
              value={asset}
              onValueChange={(value) => {
                setAsset(value);
                touch();
              }}
            >
              <SelectTrigger id="asset" className="w-full">
                <SelectValue placeholder="Choose a coin" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_ASSETS.map((coin) => (
                  <SelectItem key={coin} value={coin}>
                    {coin}
                  </SelectItem>
                ))}
                <SelectItem value="Other">Other…</SelectItem>
              </SelectContent>
            </Select>
            {asset === "Other" && (
              <Input
                placeholder="e.g. MATIC"
                maxLength={12}
                className="mt-1"
                value={customAsset}
                onChange={(e) => {
                  setCustomAsset(e.target.value);
                  touch();
                }}
              />
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="assetAmount">
              Quantity <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="assetAmount"
              inputMode="decimal"
              placeholder={`e.g. 0.0004 ${asset === "Other" ? customAsset || "of that coin" : asset}`}
              value={assetAmount}
              onChange={(e) => {
                setAssetAmount(e.target.value);
                touch();
              }}
            />
          </div>

          {goals.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="goal">
                Save toward a goal <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Select
                value={goalId === "" ? "__none__" : goalId}
                onValueChange={(value) => {
                  setGoalId(value === "__none__" ? "" : value);
                  touch();
                }}
              >
                <SelectTrigger id="goal" className="w-full">
                  <SelectValue placeholder="No goal — just saving" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No goal — just saving</SelectItem>
                  {goals.map((goal) => (
                    <SelectItem key={goal._id} value={goal._id}>
                      {goal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="note">
              Note <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="note"
              placeholder="e.g. Weekly DCA — Friday stack"
              maxLength={160}
              rows={2}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                touch();
              }}
            />
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Log save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
