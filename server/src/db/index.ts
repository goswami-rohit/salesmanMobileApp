// src/server/index.ts
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// --- Import ALL your API route setups ---
import setupAuthRoutes from '../routes/auth';  // NEW
import setupUsersRoutes from '../routes/users'; // NEW
import setupBrandsAndMappingRoutes from '../routes/dataFetchingRoutes/brandMappingFetch';
import setupClientReportsRoutes from '../routes/dataFetchingRoutes/clientReports';
import setupCollectionReportsRoutes from '../routes/dataFetchingRoutes/collectionReports';
import setupCompetitionReportsRoutes from '../routes/dataFetchingRoutes/competetionReports';
import setupDailyTasksRoutes from '../routes/dataFetchingRoutes/dailyTasks';
import setupDealersRoutes from '../routes/dataFetchingRoutes/dealers';
import setupPJPRoutes from '../routes/dataFetchingRoutes/pjp';
import setupDdpRoutes from '../routes/dataFetchingRoutes/ddp';
import setupRatingsRoutes from '../routes/dataFetchingRoutes/ratings';
import setupSalesmanLeaveApplicationsRoutes from '../routes/dataFetchingRoutes/salesmanLeaveApplications';
import setupSalesReportRoutes from '../routes/dataFetchingRoutes/salesReports';
import setupSalesOrdersRoutes from '../routes/dataFetchingRoutes/salesOrder';
import setupDailyVisitReportsRoutes from '../routes/dataFetchingRoutes/dvr';
import setupSalesmanAttendanceRoutes from '../routes/dataFetchingRoutes/salesmanAttendance';
import setupTechnicalVisitReportsRoutes from '../routes/dataFetchingRoutes/tvr';

// Initialize environment variables
dotenv.config();

// --- Server Setup ---
const app: Express = express();
const PORT = process.env.PORT || 8080;

// --- Core Middleware ---
// Enable Cross-Origin Resource Sharing for all routes
app.use(cors());

// Enable the express.json middleware to parse JSON request bodies
app.use(express.json());

// Simple logging middleware to see incoming requests
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- API Routes ---

// A simple health-check or welcome route
app.get('/api', (req: Request, res: Response) => {
  res.status(200).json({ 
    message: 'Welcome to the Field Force Management API!',
    timestamp: new Date().toISOString()
  });
});

// --- Modular Route Setup ---
console.log('🔌 Registering API routes...');

// Authentication and Users (FIRST)
setupAuthRoutes(app);                    // /api/auth/login, /api/user/:id
setupUsersRoutes(app);                   // /api/users/*

// Core Data Endpoints
setupBrandsAndMappingRoutes(app);        // /api/brands/*, /api/dealer-brand-mapping/*
setupDealersRoutes(app);                 // /api/dealers/*
setupDailyTasksRoutes(app);              // /api/daily-tasks/*
setupPJPRoutes(app);                     // /api/pjp/*

// Reports Endpoints
setupClientReportsRoutes(app);           // /api/client-reports/*
setupCollectionReportsRoutes(app);       // /api/collection-reports/*
setupCompetitionReportsRoutes(app);      // /api/competition-reports/*
setupDailyVisitReportsRoutes(app);       // /api/daily-visit-reports/*
setupTechnicalVisitReportsRoutes(app);   // /api/technical-visit-reports/*

// Additional Data Endpoints
setupDdpRoutes(app);                     // /api/ddp/*
setupRatingsRoutes(app);                 // /api/ratings/*
setupSalesmanLeaveApplicationsRoutes(app); // /api/leave-applications/*
setupSalesReportRoutes(app);             // /api/sales-reports/*
setupSalesOrdersRoutes(app);             // /api/sales-orders/*
setupSalesmanAttendanceRoutes(app);      // /api/salesman-attendance/*

console.log('✅ All routes registered successfully.');

// --- Error Handling Middleware ---

// Handle 404 - Not Found for any routes not matched above
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Resource not found' });
});

// Handle 500 - Generic Internal Server Error
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack); // Log the error stack for debugging
  res.status(500).json({ 
    success: false, 
    error: 'Internal Server Error',
    details: err.message 
  });
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`✅ Server is running and listening on http://localhost:${PORT}`);
});