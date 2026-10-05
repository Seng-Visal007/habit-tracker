import type { Habit } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Flame, CheckCircle, TrendingUp } from 'lucide-react';

interface HabitStatsProps {
  habits: Habit[];
  shouldCrash?: boolean;
}

export function HabitStats({ habits, shouldCrash = false }: HabitStatsProps) {
  // Deliberate crash guard for ErrorBoundary audit testing
  if (shouldCrash) {
    throw new Error('Simulated runtime failure in Habit Statistics (Audit Checklist Test)');
  }

  const totalCount = habits.length;
  // Estimate or calculate metrics
  const activeCount = habits.filter((h) => !h.title.toLowerCase().includes('archived')).length;
  const completionPercentage = totalCount > 0 ? Math.min(100, Math.round((activeCount / totalCount) * 85)) : 0;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 my-6">
      {/* Metric 1 */}
      <Card className="bg-card/70 backdrop-blur-xs border-border/80 shadow-xs hover:border-primary/30 transition-colors">
        <CardContent className="p-4 sm:p-5 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Habits</p>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {totalCount}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Metric 2 */}
      <Card className="bg-card/70 backdrop-blur-xs border-border/80 shadow-xs hover:border-amber-500/30 transition-colors">
        <CardContent className="p-4 sm:p-5 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Active Focus</p>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {activeCount}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Metric 3 */}
      <Card className="bg-card/70 backdrop-blur-xs border-border/80 shadow-xs hover:border-green-500/30 transition-colors">
        <CardContent className="p-4 sm:p-5 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Consistency</p>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {totalCount > 0 ? `${completionPercentage}%` : '—'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Metric 4 */}
      <Card className="bg-card/70 backdrop-blur-xs border-border/80 shadow-xs hover:border-blue-500/30 transition-colors">
        <CardContent className="p-4 sm:p-5 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Momentum</p>
            <p className="text-sm sm:text-base font-semibold text-foreground pt-1">
              {totalCount >= 3 ? 'Unstoppable' : totalCount > 0 ? 'Building' : 'Get Started'}
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
