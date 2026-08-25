import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { toast } from "sonner";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const QUICK_PROMPTS = [
  "How am I doing this month?",
  "Should I set a goal?",
  "How can I save more consistently?",
  "Is my streak healthy?",
];

function extractMessage(error: unknown) {
  return error instanceof Error && "data" in error
    ? String((error as { data?: { message?: string } }).data?.message ??
        error.message)
    : "Couldn't reach the AI Coach. Please try again.";
}

export function AICoach() {
  const usage = useQuery(api.ai.getDailyUsage);
  const getInsight = useAction(api.aiActions.getCoachInsight);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  const used = usage?.coachUsed ?? 0;
  const limit = usage?.limit ?? 10;
  const remaining = Math.max(0, limit - used);

  const ask = async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || isAsking) return;
    setIsAsking(true);
    setAnswer(null);
    try {
      const result = await getInsight({ question: trimmed });
      setAnswer(result.text);
    } catch (error) {
      toast.error("The coach couldn't answer", {
        description: extractMessage(error),
      });
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <Card className="border-border/70 shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-primary" />
            AI Coach
          </CardTitle>
          <CardDescription>
            A personal guide for your savings — grounded in your real numbers
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
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={isAsking || remaining === 0}
              onClick={() => ask(prompt)}
              className="rounded-full border border-border/80 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void ask(question);
          }}
          className="mt-4 flex gap-2"
        >
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder='Ask anything, e.g. "How do I pace myself this month?"'
            maxLength={200}
            disabled={isAsking || remaining === 0}
          />
          <Button
            type="submit"
            disabled={isAsking || remaining === 0 || !question.trim()}
            className="shrink-0 gap-1.5"
          >
            {isAsking ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Ask
          </Button>
        </form>

        {remaining === 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            You've used today's {limit} coach questions — come back tomorrow,
            or upgrade to Premium for 10 every day.
          </p>
        )}

        {isAsking && (
          <div className="mt-4 grid gap-2 rounded-xl border border-border/70 bg-muted/40 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}

        {!isAsking && answer && (
          <div className="mt-4 flex gap-3 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-sky-500/5 p-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bot className="size-4" />
            </span>
            <p className="text-sm leading-relaxed text-foreground">{answer}</p>
          </div>
        )}

        <p className="mt-3 text-xs text-muted-foreground">
          The coach never gives investment advice — it keeps you consistent.
          Responses are generated by AI and logged for quality.
        </p>
      </CardContent>
    </Card>
  );
}
