import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import type { Report } from "@shared/schema";

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Citizens see their own reports, admins see all reports
  const reportsEndpoint = user?.role === 'citizen' ? '/api/reports/mine' : '/api/reports';
  
  const { data: reports, isLoading } = useQuery<Report[]>({
    queryKey: [reportsEndpoint],
    enabled: !!user, // Only fetch when user is available
  });



  const filteredReports = reports?.filter(report => {
    const matchesSearch = report.citizenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.wasteType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge variant="secondary" className="bg-accent/10 text-accent">Pending</Badge>;
      case "Assigned":
        return <Badge variant="secondary" className="bg-primary/10 text-primary">Assigned</Badge>;
      case "Collected":
        return <Badge variant="secondary" className="bg-primary/10 text-primary">Collected</Badge>;
      case "High Priority":
        return <Badge variant="destructive">High Priority</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };


  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
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
      data-testid="page-reports"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          {user?.role === 'citizen' ? 'My Reports' : 'Waste Reports'}
        </h2>
        <div className="flex items-center space-x-4">
          <Input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
            data-testid="input-search-reports"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40" data-testid="select-status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Assigned">Assigned</SelectItem>
              <SelectItem value="Collected">Collected</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            data-testid="button-export-csv"
          >
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-muted/50">
                  <TableHead className="text-muted-foreground">Report ID</TableHead>
                  <TableHead className="text-muted-foreground">Citizen Name</TableHead>
                  <TableHead className="text-muted-foreground">Location</TableHead>
                  <TableHead className="text-muted-foreground">Waste Type</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id} className="hover:bg-muted/50" data-testid={`row-report-${report.id}`}>
                    <TableCell className="font-medium">{report.id}</TableCell>
                    <TableCell>{report.citizenName}</TableCell>
                    <TableCell className="text-muted-foreground">{report.location}</TableCell>
                    <TableCell>{report.wasteType}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-lg bg-muted px-3 py-1 text-xs text-muted-foreground"
                        data-testid={`button-view-details-${report.id}`}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <div className="text-sm text-muted-foreground">
              Showing 1 to {filteredReports.length} of {filteredReports.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" data-testid="button-pagination-previous">
                Previous
              </Button>
              <Button size="sm" className="bg-primary text-primary-foreground" data-testid="button-pagination-1">
                1
              </Button>
              <Button variant="outline" size="sm" data-testid="button-pagination-2">
                2
              </Button>
              <Button variant="outline" size="sm" data-testid="button-pagination-3">
                3
              </Button>
              <Button variant="outline" size="sm" data-testid="button-pagination-next">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
