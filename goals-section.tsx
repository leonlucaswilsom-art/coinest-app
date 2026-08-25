import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Check, Loader2, Plus, Target, Trash2 } from "lucide-react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import { formatPercent, formatUSD } from "@/lib/format";

export interface GoalItem {
  _id: string;
  name: string;
  targetUsd: number;
  color: string;
  completed: boolean;
}

const GOAL_COLOR_STYLES: Record<string, string> = {
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
  teal: "bg-teal-500",
  sky: "bg-sky-500",
  amber: "bg-amber-500",
  violet: "bg-violet-500",
  rose: "bg-rose-500",
};

const GOAL_COLORS = Object.keys(GOAL_COLOR_STYLES);

export function GoalsSection({
  goals,
  savedByGoal,
}: {
  goals: GoalItem[];
  savedByGoal: Record<string, number>;
}) {
  const createGoal = useMutation(api.savings.createGoal);
  const toggleComplete = useMutation(api.savings.toggleGoalComplete);
  const deleteGoal = useMutation(api.savings.deleteGoal);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [color, setColor] = useState("blue");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Idempotency key — a double-clicked "Create goal" can only create one goal.
  const requestKeyRef = useRef<string | null>(null);

  const touch = () => {
    requestKeyRef.current = null;
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = Number.parseFloat(target);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Enter a target amount greater than $0.");
      return;
    }
    if (!requestKeyRef.current) {
      requestKeyRef.current = crypto.randomUUID();
    }
    setIsSubmitting(true);
    try {
      await createGoal({
        name: name.trim(),
        targetUsd: value,
        color,
        requestKey: requestKeyRef.current,
      });
      toast.success("Goal created successfully.", {
        description: `${name.trim()} · ${formatUSD(value)}`,
      });
      setName("");
      setTarget("");
      setColor("blue");
      setOpen(false);
      requestKeyRef.current = null;
    } catch (error) {
      const message =
        error instanceof Error && "data" in error
          ? String((error as { data?: { message?: string } }).data?.message ??
              error.message)
          : "Couldn't create that goal.";
      toast.error("Couldn't create goal", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    try {
      await toggleComplete({ id: id as Id<"goals"> });
      toast.success(completed ? "Goal marked as active again." : "Goal completed! 🎉");
    } catch {
      toast.error("Couldn't update that goal.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGoal({ id: id as Id<"goals"> });
      toast.success("Goal deleted.");
      setDeleting(null);
    } catch {
      toast.error("Couldn't delete that goal.");
    }
  };

  return (
    <Card className="border-border/70 shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base">Goals</CardTitle>
          <CardDescription>
            Name your goals and watch progress fill up
          </CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Plus className="size-4" />
              New goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create a savings goal</DialogTitle>
              <DialogDescription>
                What are you saving toward? Make it something you'll love
                reaching.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="goal-name">Goal name</Label>
                <Input
                  id="goal-name"
                  placeholder="e.g. New laptop, travel fund, rainy-day stack"
                  maxLength={60}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    touch();
                  }}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="goal-target">Target (USD)</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="goal-target"
                    inputMode="decimal"
                    placeholder="1000.00"
                    className="pl-7"
                    value={target}
                    onChange={(e) => {
                      setTarget(e.target.value);
                      touch();
                    }}
                    required
                    min={1}
                    step={1}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {GOAL_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`${c} color`}
                      onClick={() => {
                        setColor(c);
                        touch();
                      }}
                      className={cn(
                        "size-7 rounded-full transition-transform hover:scale-110",
                        GOAL_COLOR_STYLES[c],
                        color === c &&
                          "ring-2 ring-foreground/60 ring-offset-2 ring-offset-background",
                      )}
                    />
                  ))}
                </div>
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
                  Create goal
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 px-6 py-10 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Target className="size-5" />
            </span>
            <p className="text-sm font-medium">No goals yet</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Set your first goal — a new device, a trip, or a larger savings
              target.
            </p>
          </div>
        ) : (
          <ul className="grid gap-4">
            {goals.map((goal) => {
              const saved = savedByGoal[goal._id] ?? 0;
              const pct = Math.min(100, (saved / goal.targetUsd) * 100);
              const barColor = GOAL_COLOR_STYLES[goal.color] ?? GOAL_COLOR_STYLES.blue;
              return (
                <li
                  key={goal._id}
                  className="rounded-xl border border-border/70 bg-background/60 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={cn(
                          "mt-1 size-2.5 shrink-0 rounded-full",
                          goal.completed ? "bg-emerald-500" : barColor,
                        )}
                      />
                      <p
                        className={cn(
                          "truncate text-sm font-medium",
                          goal.completed && "text-muted-foreground line-through",
                        )}
                      >
                        {goal.name}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {goal.completed ? (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Completed
                        </span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-primary"
                          aria-label={`Mark ${goal.name} complete`}
                          onClick={() => handleToggle(goal._id, goal.completed)}
                        >
                          <Check className="size-4" />
                        </Button>
                      )}
                      <AlertDialog
                        open={deleting === goal._id}
                        onOpenChange={(o) => setDeleting(o ? goal._id : null)}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-destructive"
                            aria-label={`Delete ${goal.name}`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this goal?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {`"${goal.name}"`} will be removed. Savings already
                              logged against it stay in your history.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep it</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-white hover:bg-destructive/90"
                              onClick={() => handleDelete(goal._id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-primary/10">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", barColor)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      <span className="font-medium text-foreground">
                        {formatUSD(saved)}
                      </span>{" "}
                      of {formatUSD(goal.targetUsd)}
                    </span>
                    <span className="font-medium tabular-nums">
                      {formatPercent(pct)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
