import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useQuery } from '@tanstack/react-query';
import { sellerAPI } from '@/lib/api';
import { TrendingUp, Lightbulb, BarChart3, Target } from 'lucide-react';

export default function SellerPerformanceInsights() {
  const { data: insights, isLoading } = useQuery({
    queryKey: ['seller-performance-insights'],
    queryFn: () => sellerAPI.getPerformanceInsights(),
  });

  return (
    <SellerLayout title="Performance Insights" subtitle="AI-driven insights to grow your business">
      {isLoading ? <LoadingSpinner /> : (
        <>
          {/* Metrics */}
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            <Card className="stat-card"><CardContent className="p-0">
              <p className="text-sm text-muted-foreground mb-1">Growth Rate</p>
              <p className="text-3xl font-bold text-success">{insights?.growth || 0}%</p>
              <TrendingUp size={20} className="text-success mt-2" />
            </CardContent></Card>
            <Card className="stat-card"><CardContent className="p-0">
              <p className="text-sm text-muted-foreground mb-1">Industry Avg</p>
              <p className="text-3xl font-bold text-foreground">{insights?.industryAvg || 0}%</p>
              <BarChart3 size={20} className="text-info mt-2" />
            </CardContent></Card>
            <Card className="stat-card"><CardContent className="p-0">
              <p className="text-sm text-muted-foreground mb-1">Your Rank</p>
              <p className="text-3xl font-bold text-primary">#{insights?.rank || '-'}</p>
              <Target size={20} className="text-primary mt-2" />
            </CardContent></Card>
          </div>

          {/* AI Tips */}
          <Card>
            <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Lightbulb size={20} className="text-warning" /> AI Suggestions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(insights?.tips || []).map((tip: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                    <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center text-sm font-bold text-warning shrink-0">{i + 1}</div>
                    <p className="text-foreground">{tip}</p>
                  </div>
                ))}
                {(!insights?.tips || insights.tips.length === 0) && (
                  <p className="text-muted-foreground text-center py-8">Performance insights will appear once you have enough data</p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </SellerLayout>
  );
}
