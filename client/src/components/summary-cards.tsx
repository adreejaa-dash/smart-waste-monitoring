import { motion } from "framer-motion";
import { FileText, Users, Clock, UserCheck, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SummaryCardsProps {
  metrics: {
    totalReports: number;
    pendingTasks: number;
    citizenParticipation: number;
  };
}

export default function SummaryCards({ metrics }: SummaryCardsProps) {
  const cards = [
    {
      title: "Total Reports",
      value: metrics.totalReports,
      change: "+12% from last month",
      trend: "up",
      icon: FileText,
      color: "primary",
    },
    {
      title: "Pending Tasks",
      value: metrics.pendingTasks,
      change: "-8% from yesterday",
      trend: "down",
      icon: Clock,
      color: "destructive",
    },
    {
      title: "Citizen Participation",
      value: metrics.citizenParticipation,
      change: "+18% engagement",
      trend: "up",
      icon: UserCheck,
      color: "secondary",
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="card-hover rounded-2xl shadow-sm" data-testid={`card-${card.title.toLowerCase().replace(' ', '-')}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-3xl font-bold text-foreground">{card.value.toLocaleString()}</p>
                  <p className={`mt-2 flex items-center text-sm ${
                    card.trend === "up" ? "text-primary" : "text-destructive"
                  }`}>
                    {card.trend === "up" ? (
                      <TrendingUp className="mr-1 h-4 w-4" />
                    ) : (
                      <TrendingDown className="mr-1 h-4 w-4" />
                    )}
                    {card.change}
                  </p>
                </div>
                <div className={`rounded-lg p-3 ${
                  card.color === "primary" ? "bg-primary/10" :
                  card.color === "accent" ? "bg-accent/10" :
                  card.color === "destructive" ? "bg-destructive/10" :
                  "bg-secondary/10"
                }`}>
                  <card.icon className={`h-6 w-6 ${
                    card.color === "primary" ? "text-primary" :
                    card.color === "accent" ? "text-accent" :
                    card.color === "destructive" ? "text-destructive" :
                    "text-secondary"
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
