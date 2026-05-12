import type { Express } from "express";
import { createServer, type Server } from "http";
import cors from "cors";
import helmet from "helmet";
import multer from "multer";
import { storage } from "./storage";
import { authMiddleware, roleMiddleware, type AuthRequest } from "./middleware/auth";
import { comparePassword, generateToken, calculateRewardPoints, calculateRewardLevel } from "./utils/auth";
import { insertUserSchema, loginSchema, insertReportSchema, insertCitizenSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Security middleware - configure helmet for development
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'development' ? false : undefined,
    crossOriginEmbedderPolicy: false,
  }));
  app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  }));

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.username) || 
                          await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      const user = await storage.createUser(validatedData);

      // Create citizen or worker profile based on role
      if (validatedData.role === "citizen") {
        await storage.createCitizen({
          userId: user.id,
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone || null,
          address: validatedData.address || null,
          totalReports: 0,
          isActive: true,
        });

        // Create reward profile
        await storage.createReward({
          citizenId: user.id,
          points: 0,
          totalEarned: 0,
          level: "Bronze",
        });
      }

      const token = generateToken(user);
      res.status(201).json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          role: user.role, 
          name: user.name 
        } 
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid registration data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = generateToken(user);
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          role: user.role, 
          name: user.name 
        } 
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid login data" });
    }
  });

  // Citizen Features
  app.post("/api/reports", authMiddleware, roleMiddleware(["citizen"]), upload.single('photo'), async (req: AuthRequest, res) => {
    try {
      // Parse form data - req.body contains the JSON fields
      const reportData = JSON.parse(req.body.reportData || '{}');
      
      // Validate only the user-submitted fields (exclude server-side fields)
      const userReportSchema = insertReportSchema.omit({
        citizenId: true,
        citizenName: true,
        status: true,
        assignedWorkerId: true,
        priority: true,
        photoUrl: true,
        proofPhotoUrl: true
      });
      const validatedData = userReportSchema.parse(reportData);
      const citizen = await storage.getCitizenByUserId(req.user!.id);
      
      if (!citizen) {
        return res.status(404).json({ error: "Citizen profile not found" });
      }

      // Handle uploaded image
      let photoUrl = null;
      if (req.file) {
        // For memory storage, convert to base64 data URL
        const base64 = req.file.buffer.toString('base64');
        photoUrl = `data:${req.file.mimetype};base64,${base64}`;
      }

      const report = await storage.createReport({
        ...validatedData,
        citizenId: citizen.id,
        citizenName: req.user!.name,
        photoUrl,
      });

      // Update citizen's total reports
      await storage.updateCitizen(citizen.id, {
        totalReports: citizen.totalReports + 1,
      });

      // Award points for reporting
      const points = calculateRewardPoints(validatedData.wasteType);
      const currentReward = await storage.getReward(citizen.id);
      if (currentReward) {
        const newTotal = currentReward.totalEarned + points;
        await storage.updateReward(citizen.id, {
          points: currentReward.points + points,
          totalEarned: newTotal,
          level: calculateRewardLevel(newTotal),
        });
      }

      res.status(201).json(report);
    } catch (error) {
      res.status(400).json({ error: "Invalid report data" });
    }
  });

  app.get("/api/reports/mine", authMiddleware, roleMiddleware(["citizen"]), async (req: AuthRequest, res) => {
    try {
      const citizen = await storage.getCitizenByUserId(req.user!.id);
      if (!citizen) {
        return res.status(404).json({ error: "Citizen profile not found" });
      }

      const reports = await storage.getReportsByCitizen(citizen.id);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });


  // Rewards System
  app.get("/api/rewards/:citizenId", authMiddleware, async (req, res) => {
    try {
      const reward = await storage.getReward(req.params.citizenId);
      if (!reward) {
        return res.status(404).json({ error: "Reward not found" });
      }
      res.json(reward);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rewards" });
    }
  });

  app.put("/api/rewards/:citizenId", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
    try {
      const { points } = req.body;
      const currentReward = await storage.getReward(req.params.citizenId);
      
      if (!currentReward) {
        return res.status(404).json({ error: "Reward not found" });
      }

      const newTotal = currentReward.totalEarned + points;
      const reward = await storage.updateReward(req.params.citizenId, {
        points: currentReward.points + points,
        totalEarned: newTotal,
        level: calculateRewardLevel(newTotal),
      });

      res.json(reward);
    } catch (error) {
      res.status(500).json({ error: "Failed to update rewards" });
    }
  });
  
  // Admin/ULB Features  
  app.get("/api/reports", authMiddleware, roleMiddleware(["admin"]), async (_req, res) => {
    try {
      const reports = await storage.getAllReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  // Public map data endpoint - returns location info for mapping
  app.get("/api/map/reports", async (_req, res) => {
    try {
      const reports = await storage.getAllReports();
      // Return only the fields needed for the map
      const mapData = reports.map(report => ({
        id: report.id,
        latitude: report.latitude,
        longitude: report.longitude,
        priority: report.priority,
        wasteType: report.wasteType,
        citizenName: report.citizenName,
        location: report.location
      }));
      res.json(mapData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch map data" });
    }
  });

  app.get("/api/reports/:id", async (req, res) => {
    try {
      const report = await storage.getReport(req.params.id);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch report" });
    }
  });


  app.patch("/api/reports/:id", async (req, res) => {
    try {
      const report = await storage.updateReport(req.params.id, req.body);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to update report" });
    }
  });


  app.delete("/api/reports/:id", async (req, res) => {
    try {
      const success = await storage.deleteReport(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Report not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete report" });
    }
  });


  // Citizens routes
  app.get("/api/citizens", async (_req, res) => {
    try {
      const citizens = await storage.getAllCitizens();
      res.json(citizens);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch citizens" });
    }
  });

  app.get("/api/citizens/:id", async (req, res) => {
    try {
      const citizen = await storage.getCitizen(req.params.id);
      if (!citizen) {
        return res.status(404).json({ error: "Citizen not found" });
      }
      res.json(citizen);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch citizen" });
    }
  });

  app.post("/api/citizens", async (req, res) => {
    try {
      const validatedData = insertCitizenSchema.parse(req.body);
      const citizen = await storage.createCitizen(validatedData);
      res.status(201).json(citizen);
    } catch (error) {
      res.status(400).json({ error: "Invalid citizen data" });
    }
  });

  app.patch("/api/citizens/:id", async (req, res) => {
    try {
      const citizen = await storage.updateCitizen(req.params.id, req.body);
      if (!citizen) {
        return res.status(404).json({ error: "Citizen not found" });
      }
      res.json(citizen);
    } catch (error) {
      res.status(500).json({ error: "Failed to update citizen" });
    }
  });

  app.delete("/api/citizens/:id", async (req, res) => {
    try {
      const success = await storage.deleteCitizen(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Citizen not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete citizen" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/metrics", async (_req, res) => {
    try {
      const reports = await storage.getAllReports();
      const citizens = await storage.getAllCitizens();
      
      const metrics = {
        totalReports: reports.length,
        pendingTasks: reports.filter(r => r.status === "Pending").length,
        citizenParticipation: citizens.filter(c => c.isActive).length,
      };
      
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  app.get("/api/analytics/waste-breakdown", async (_req, res) => {
    try {
      const reports = await storage.getAllReports();
      const breakdown = reports.reduce((acc, report) => {
        acc[report.wasteType] = (acc[report.wasteType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const data = Object.entries(breakdown).map(([name, value]) => ({ name, value }));
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch waste breakdown" });
    }
  });

  app.get("/api/analytics/daily-reports", async (_req, res) => {
    try {
      const reports = await storage.getAllReports();
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();
      
      const dailyData = last7Days.map(date => {
        const count = reports.filter(r => 
          r.createdAt && r.createdAt.toISOString().split('T')[0] === date
        ).length;
        return { date, reports: count };
      });
      
      res.json(dailyData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch daily reports" });
    }
  });

  // AI Image Recognition for Waste Classification

  app.post("/api/classify-waste", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // Mock AI classification - randomly return waste type
      const wasteTypes = ["organic", "plastic", "recyclable", "hazardous"];
      const randomType = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
      
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Mock confidence score
      const confidence = 0.75 + Math.random() * 0.2;

      res.json({ 
        wasteType: randomType,
        confidence: Math.round(confidence * 100) / 100,
        message: `AI detected ${randomType} waste with ${Math.round(confidence * 100)}% confidence`
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to classify waste image" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
