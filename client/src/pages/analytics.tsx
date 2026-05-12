import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Analytics() {
  const { data: wasteBreakdown, isLoading: wasteLoading } = useQuery({
    queryKey: ['/api/analytics/waste-breakdown'],
  });

  const { data: dailyReports, isLoading: dailyLoading } = useQuery({
    queryKey: ['/api/analytics/daily-reports'],
  });


  // Mock data for collection efficiency
  const efficiencyData = [
    { day: 'Mon', efficiency: 85 },
    { day: 'Tue', efficiency: 92 },
    { day: 'Wed', efficiency: 78 },
    { day: 'Thu', efficiency: 95 },
    { day: 'Fri', efficiency: 88 },
    { day: 'Sat', efficiency: 82 },
    { day: 'Sun', efficiency: 90 },
  ];

  // Mock data for citizen participation trend
  const participationData = [
    { month: 'Jan', participation: 1200 },
    { month: 'Feb', participation: 1350 },
    { month: 'Mar', participation: 1450 },
    { month: 'Apr', participation: 1600 },
    { month: 'May', participation: 1550 },
    { month: 'Jun', participation: 1750 },
    { month: 'Jul', participation: 1850 },
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', 'hsl(var(--destructive))'];

  if (wasteLoading || dailyLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
      data-testid="page-analytics"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Comprehensive insights into waste management performance</p>
      </div>

      <div className="space-y-6">
        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Waste Type Breakdown (Pie Chart) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="rounded-2xl shadow-sm" data-testid="card-waste-breakdown">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Waste Type Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={(wasteBreakdown as any) || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {((wasteBreakdown as any) || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Collection Efficiency (Bar Chart) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="rounded-2xl shadow-sm" data-testid="card-collection-efficiency">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Collection Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={efficiencyData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="day" className="text-sm text-muted-foreground" />
                      <YAxis className="text-sm text-muted-foreground" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="efficiency" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Citizen Participation Trend (Line Chart) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="rounded-2xl shadow-sm" data-testid="card-participation-trend">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Citizen Participation Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={participationData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" className="text-sm text-muted-foreground" />
                    <YAxis className="text-sm text-muted-foreground" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="participation" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </motion.div>
  );
}
