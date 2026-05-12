// This file contains mock data for demonstration purposes
// In a real application, this data would come from your backend API

export const mockMetrics = {
  totalReports: 2847,
  activeWorkers: 48,
  pendingTasks: 126,
  citizenParticipation: 1234,
};

export const mockReports = [
  {
    id: "RPT-001",
    citizenName: "John Smith",
    location: "123 Main St, Downtown",
    latitude: 40.7580,
    longitude: -73.9855,
    wasteType: "Organic",
    status: "Pending",
    priority: "High",
    description: "Large organic waste pile",
    createdAt: new Date("2024-01-15"),
    assignedWorkerId: null,
  },
  {
    id: "RPT-002",
    citizenName: "Maria Garcia",
    location: "456 Oak Ave, Midtown",
    latitude: 40.7128,
    longitude: -74.0060,
    wasteType: "Recyclable",
    status: "Assigned",
    priority: "Medium",
    description: "Recyclable materials overflow",
    createdAt: new Date("2024-01-15"),
    assignedWorkerId: "WRK-001",
  },
  {
    id: "RPT-003",
    citizenName: "David Lee",
    location: "789 Pine St, Uptown",
    latitude: 40.7614,
    longitude: -73.9776,
    wasteType: "Hazardous",
    status: "High Priority",
    priority: "High",
    description: "Chemical waste disposal needed",
    createdAt: new Date("2024-01-14"),
    assignedWorkerId: null,
  },
];

export const mockWorkers = [
  {
    id: "WRK-001",
    name: "Mike Johnson",
    department: "Collection Team A",
    contact: "+1 (555) 123-4567",
    status: "Active",
    performance: 85,
    assignedTasks: 8,
  },
  {
    id: "WRK-002",
    name: "Sarah Wilson",
    department: "Collection Team B",
    contact: "+1 (555) 987-6543",
    status: "Active",
    performance: 92,
    assignedTasks: 12,
  },
];

export const mockCitizens = [
  {
    id: "CIT-001",
    name: "Robert Chen",
    email: "robert.chen@email.com",
    phone: "+1 (555) 111-2222",
    address: "Downtown area",
    totalReports: 3,
    isActive: true,
  },
  {
    id: "CIT-002",
    name: "Emma Thompson",
    email: "emma.thompson@email.com",
    phone: "+1 (555) 333-4444",
    address: "Midtown area",
    totalReports: 5,
    isActive: true,
  },
];

export const mockDailyReports = [
  { date: "2024-01-10", reports: 25 },
  { date: "2024-01-11", reports: 32 },
  { date: "2024-01-12", reports: 28 },
  { date: "2024-01-13", reports: 45 },
  { date: "2024-01-14", reports: 38 },
  { date: "2024-01-15", reports: 52 },
  { date: "2024-01-16", reports: 41 },
];

export const mockWasteBreakdown = [
  { name: "Organic", value: 45 },
  { name: "Recyclable", value: 35 },
  { name: "General", value: 15 },
  { name: "Hazardous", value: 5 },
];
