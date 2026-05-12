import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import SummaryCards from "@/components/summary-cards";
import WasteMap from "@/components/waste-map";
import ReportsChart from "@/components/reports-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/analytics/metrics'],
  });

  const { data: reports, isLoading: reportsLoading, isError: reportsError } = useQuery({
    queryKey: ['/api/map/reports'],
  });

  // Demo data for map when reports API fails
  const demoReports = [
    {
      id: "demo-1",
      latitude: 20.2961,
      longitude: 85.8245,
      priority: "High",
      wasteType: "Plastic",
      citizenName: "Raj Kumar",
      location: "Near City Mall, Bhubaneswar"
    },
    {
      id: "demo-2", 
      latitude: 20.3010,
      longitude: 85.8312,
      priority: "Medium",
      wasteType: "Organic",
      citizenName: "Priya Singh",
      location: "Khandagiri Square"
    },
    {
      id: "demo-3",
      latitude: 20.2846,
      longitude: 85.8174,
      priority: "Low", 
      wasteType: "Recyclable",
      citizenName: "Amit Patel",
      location: "Unit 1 Market"
    }
  ];

  const { data: dailyReports, isLoading: dailyLoading } = useQuery({
    queryKey: ['/api/analytics/daily-reports'],
  });

  if (metricsLoading || reportsLoading || dailyLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
      data-testid="page-dashboard"
    >
      <SummaryCards metrics={{
        totalReports: (metrics as any)?.totalReports || 0,
        pendingTasks: (metrics as any)?.pendingTasks || 0,
        citizenParticipation: (metrics as any)?.citizenParticipation || 0
      }} />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="rounded-2xl shadow-sm" data-testid="card-waste-map">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                Waste Reports Map - Bhubaneswar
                {reportsError && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    (Showing demo data)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <WasteMap reports={reportsError ? demoReports : ((reports as any) || [])} />
            </CardContent>
          </Card>
        </motion.div>
        <ReportsChart data={(dailyReports as any) || []} />
      </div>
    </motion.div>
  );
}
