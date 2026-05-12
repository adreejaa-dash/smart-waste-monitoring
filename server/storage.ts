import { type User, type InsertUser, type Report, type InsertReport, type Citizen, type InsertCitizen, type Reward, type InsertReward } from "@shared/schema";
import { randomUUID } from "crypto";
import { hashPassword } from "./utils/auth";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Reports
  getAllReports(): Promise<Report[]>;
  getReport(id: string): Promise<Report | undefined>;
  getReportsByCitizen(citizenId: string): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: string, updates: Partial<Report>): Promise<Report | undefined>;
  deleteReport(id: string): Promise<boolean>;
  
  
  // Citizens
  getAllCitizens(): Promise<Citizen[]>;
  getCitizen(id: string): Promise<Citizen | undefined>;
  getCitizenByUserId(userId: string): Promise<Citizen | undefined>;
  createCitizen(citizen: InsertCitizen): Promise<Citizen>;
  updateCitizen(id: string, updates: Partial<Citizen>): Promise<Citizen | undefined>;
  deleteCitizen(id: string): Promise<boolean>;
  
  // Rewards
  getReward(citizenId: string): Promise<Reward | undefined>;
  createReward(reward: InsertReward): Promise<Reward>;
  updateReward(citizenId: string, updates: Partial<Reward>): Promise<Reward | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private reports: Map<string, Report>;
  private citizens: Map<string, Citizen>;
  private rewards: Map<string, Reward>;

  constructor() {
    this.users = new Map();
    this.reports = new Map();
    this.citizens = new Map();
    this.rewards = new Map();
    
    // Initialize with sample data - call async method safely
    this.initializeSampleData().catch(console.error);
  }

  private async initializeSampleData() {
    // Sample users
    const adminUser: User = {
      id: "USR-001",
      username: "admin",
      email: "admin@ecotech.com",
      password: await hashPassword("admin123"),
      role: "admin",
      name: "Admin User",
      phone: "+1 (555) 000-0001",
      address: "EcoTech Headquarters",
      isActive: true,
      createdAt: new Date(),
    };


    const citizenUser1: User = {
      id: "USR-003",
      username: "citizen1",
      email: "john.smith@email.com",
      password: await hashPassword("citizen123"),
      role: "citizen",
      name: "John Smith",
      phone: "+1 (555) 111-1111",
      address: "123 Main St, Downtown",
      isActive: true,
      createdAt: new Date(),
    };

    this.users.set(adminUser.id, adminUser);
    this.users.set(citizenUser1.id, citizenUser1);

    
    // Sample reports
    const report1: Report = {
      id: "RPT-001",
      citizenId: "CIT-001",
      citizenName: "John Smith",
      location: "123 Main St, Downtown",
      latitude: 40.7580,
      longitude: -73.9855,
      wasteType: "organic",
      status: "Pending",
      priority: "High",
      description: "Large organic waste pile",
      photoUrl: null,
      proofPhotoUrl: null,
      createdAt: new Date("2024-01-15"),
      assignedWorkerId: null,
      completedAt: null,
    };
    
    const report2: Report = {
      id: "RPT-002",
      citizenId: "CIT-001",
      citizenName: "John Smith",
      location: "456 Oak Ave, Midtown",
      latitude: 40.7128,
      longitude: -74.0060,
      wasteType: "recyclable",
      status: "In-Progress",
      priority: "Medium",
      description: "Recyclable materials overflow",
      photoUrl: null,
      proofPhotoUrl: null,
      createdAt: new Date("2024-01-15"),
      assignedWorkerId: null,
      completedAt: null,
    };
    
    const report3: Report = {
      id: "RPT-003",
      citizenId: "CIT-002",
      citizenName: "Robert Chen",
      location: "789 Pine St, Uptown",
      latitude: 40.7614,
      longitude: -73.9776,
      wasteType: "hazardous",
      status: "Pending",
      priority: "High",
      description: "Chemical waste disposal needed",
      photoUrl: null,
      proofPhotoUrl: null,
      createdAt: new Date("2024-01-14"),
      assignedWorkerId: null,
      completedAt: null,
    };
    
    this.reports.set(report1.id, report1);
    this.reports.set(report2.id, report2);
    this.reports.set(report3.id, report3);
    
    // Sample citizens
    const citizen1: Citizen = {
      id: "CIT-001",
      userId: "USR-003",
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+1 (555) 111-1111",
      address: "123 Main St, Downtown",
      totalReports: 2,
      isActive: true,
    };
    
    const citizen2: Citizen = {
      id: "CIT-002",
      userId: "USR-005",
      name: "Robert Chen",
      email: "robert.chen@email.com",
      phone: "+1 (555) 222-2222",
      address: "789 Pine St, Uptown",
      totalReports: 1,
      isActive: true,
    };
    
    this.citizens.set(citizen1.id, citizen1);
    this.citizens.set(citizen2.id, citizen2);

    // Sample rewards
    const reward1: Reward = {
      id: "RWD-001",
      citizenId: "CIT-001",
      points: 25,
      totalEarned: 45,
      level: "Bronze",
      lastUpdated: new Date(),
    };

    const reward2: Reward = {
      id: "RWD-002",
      citizenId: "CIT-002",
      points: 20,
      totalEarned: 20,
      level: "Bronze",
      lastUpdated: new Date(),
    };

    this.rewards.set("CIT-001", reward1);
    this.rewards.set("CIT-002", reward2);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const hashedPassword = await hashPassword(insertUser.password);
    const user: User = { 
      ...insertUser, 
      id,
      password: hashedPassword,
      role: insertUser.role || "citizen",
      phone: insertUser.phone || null,
      address: insertUser.address || null,
      isActive: insertUser.isActive !== undefined ? insertUser.isActive : true,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Report methods
  async getAllReports(): Promise<Report[]> {
    return Array.from(this.reports.values());
  }

  async getReport(id: string): Promise<Report | undefined> {
    return this.reports.get(id);
  }

  async getReportsByCitizen(citizenId: string): Promise<Report[]> {
    return Array.from(this.reports.values()).filter(
      (report) => report.citizenId === citizenId,
    );
  }


  async createReport(insertReport: InsertReport): Promise<Report> {
    const id = `RPT-${String(this.reports.size + 1).padStart(3, '0')}`;
    const report: Report = { 
      ...insertReport, 
      id,
      status: insertReport.status || "Pending",
      priority: insertReport.priority || "Medium",
      createdAt: new Date(),
      description: insertReport.description || null,
      photoUrl: insertReport.photoUrl || null,
      proofPhotoUrl: insertReport.proofPhotoUrl || null,
      assignedWorkerId: insertReport.assignedWorkerId || null,
      completedAt: null,
    };
    this.reports.set(id, report);
    return report;
  }

  async updateReport(id: string, updates: Partial<Report>): Promise<Report | undefined> {
    const report = this.reports.get(id);
    if (!report) return undefined;
    
    const updatedReport = { ...report, ...updates };
    this.reports.set(id, updatedReport);
    return updatedReport;
  }

  async deleteReport(id: string): Promise<boolean> {
    return this.reports.delete(id);
  }


  // Citizen methods
  async getAllCitizens(): Promise<Citizen[]> {
    return Array.from(this.citizens.values());
  }

  async getCitizen(id: string): Promise<Citizen | undefined> {
    return this.citizens.get(id);
  }

  async getCitizenByUserId(userId: string): Promise<Citizen | undefined> {
    return Array.from(this.citizens.values()).find(
      (citizen) => citizen.userId === userId,
    );
  }

  async createCitizen(insertCitizen: InsertCitizen): Promise<Citizen> {
    const id = `CIT-${String(this.citizens.size + 1).padStart(3, '0')}`;
    const citizen: Citizen = { 
      ...insertCitizen, 
      id,
      phone: insertCitizen.phone || null,
      address: insertCitizen.address || null,
      totalReports: insertCitizen.totalReports || 0,
      isActive: insertCitizen.isActive !== undefined ? insertCitizen.isActive : true,
    };
    this.citizens.set(id, citizen);
    return citizen;
  }

  async updateCitizen(id: string, updates: Partial<Citizen>): Promise<Citizen | undefined> {
    const citizen = this.citizens.get(id);
    if (!citizen) return undefined;
    
    const updatedCitizen = { ...citizen, ...updates };
    this.citizens.set(id, updatedCitizen);
    return updatedCitizen;
  }

  async deleteCitizen(id: string): Promise<boolean> {
    return this.citizens.delete(id);
  }

  // Reward methods
  async getReward(citizenId: string): Promise<Reward | undefined> {
    return this.rewards.get(citizenId);
  }

  async createReward(insertReward: InsertReward): Promise<Reward> {
    const id = randomUUID();
    const reward: Reward = { 
      ...insertReward, 
      id,
      points: insertReward.points || 0,
      totalEarned: insertReward.totalEarned || 0,
      level: insertReward.level || "Bronze",
      lastUpdated: new Date(),
    };
    this.rewards.set(insertReward.citizenId, reward);
    return reward;
  }

  async updateReward(citizenId: string, updates: Partial<Reward>): Promise<Reward | undefined> {
    const reward = this.rewards.get(citizenId);
    if (!reward) return undefined;
    
    const updatedReward = { ...reward, ...updates, lastUpdated: new Date() };
    this.rewards.set(citizenId, updatedReward);
    return updatedReward;
  }
}

export const storage = new MemStorage();
