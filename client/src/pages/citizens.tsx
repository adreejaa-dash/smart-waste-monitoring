import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, FileText, Heart } from "lucide-react";
import type { Citizen } from "@shared/schema";

export default function Citizens() {
  const { data: citizens, isLoading } = useQuery<Citizen[]>({
    queryKey: ['/api/citizens'],
  });

  const { data: reports } = useQuery({
    queryKey: ['/api/reports'],
  });

  const totalCitizens = citizens?.length || 0;
  const activeCitizens = citizens?.filter(c => c.isActive).length || 0;
  const totalReports = (reports as any)?.length || 0;
  const satisfactionRate = 94.2; // Mock satisfaction rate

  const recentActivity = [
    {
      id: 1,
      name: "Robert Chen",
      action: "reported organic waste",
      location: "Downtown area",
      time: "2 hours ago",
      type: "New Report",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Emma Thompson",
      action: "rated collection service",
      location: "5 stars • Excellent service",
      time: "4 hours ago",
      type: "Feedback",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face"
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
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
      data-testid="page-citizens"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Citizen Engagement</h2>
        <div className="flex items-center space-x-4">
          <Button 
            className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            data-testid="button-send-notification"
          >
            Send Notification
          </Button>
        </div>
      </div>

      {/* Citizen Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="card-hover rounded-2xl shadow-sm" data-testid="card-total-citizens">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Citizens</p>
                  <p className="text-3xl font-bold text-foreground">{totalCitizens.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-primary/10 p-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="card-hover rounded-2xl shadow-sm" data-testid="card-active-reports">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Reports</p>
                  <p className="text-3xl font-bold text-foreground">{totalReports.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-accent/10 p-3">
                  <FileText className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="card-hover rounded-2xl shadow-sm" data-testid="card-satisfaction-rate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Satisfaction Rate</p>
                  <p className="text-3xl font-bold text-foreground">{satisfactionRate}%</p>
                </div>
                <div className="rounded-lg bg-secondary/10 p-3">
                  <Heart className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Citizen Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="rounded-2xl shadow-sm" data-testid="card-recent-activity">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Recent Citizen Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-center space-x-4 border-b border-border pb-4 last:border-b-0"
                  data-testid={`activity-${activity.id}`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activity.avatar} alt={activity.name} />
                    <AvatarFallback>{activity.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {activity.name} {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.location} • {activity.time}
                    </p>
                  </div>
                  <Badge 
                    variant={activity.type === "New Report" ? "default" : "secondary"}
                    className={activity.type === "New Report" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}
                  >
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
