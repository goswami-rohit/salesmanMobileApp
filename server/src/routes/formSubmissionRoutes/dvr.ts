//  server/src/routes/postRoutes/dvr.ts 
// Daily Visit Reports POST endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { dailyVisitReports } from '../../db/schema';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// Manual Zod schema EXACTLY matching the table schema
const dailyVisitReportSchema = z.object({
  userId: z.number().int().positive(),
  reportDate: z.string().or(z.date()),
  dealerType: z.string().max(50),
  dealerName: z.string().max(255).optional().nullable().or(z.literal("")),
  subDealerName: z.string().max(255).optional().nullable().or(z.literal("")),
  location: z.string().max(500),
  latitude: z.string(),
  longitude: z.string(),
  visitType: z.string().max(50),
  dealerTotalPotential: z.string(),
  dealerBestPotential: z.string(),
  brandSelling: z.array(z.string()).min(1),
  contactPerson: z.string().max(255).optional().nullable().or(z.literal("")),
  contactPersonPhoneNo: z.string().max(20).optional().nullable().or(z.literal("")),
  todayOrderMt: z.string(),
  todayCollectionRupees: z.string(),
  overdueAmount: z.string().optional().nullable().or(z.literal("")),
  feedbacks: z.string().max(500),
  solutionBySalesperson: z.string().max(500).optional().nullable().or(z.literal("")),
  anyRemarks: z.string().max(500).optional().nullable().or(z.literal("")),
  checkInTime: z.string().or(z.date()),
  checkOutTime: z.string().or(z.date()).optional().nullable().or(z.literal("")),
  inTimeImageUrl: z.string().max(500).optional().nullable().or(z.literal("")),
  outTimeImageUrl: z.string().max(500).optional().nullable().or(z.literal("")),
}).transform((data) => ({
  ...data,
  dealerName: data.dealerName === "" ? null : data.dealerName,
  subDealerName: data.subDealerName === "" ? null : data.subDealerName,
  contactPerson: data.contactPerson === "" ? null : data.contactPerson,
  contactPersonPhoneNo: data.contactPersonPhoneNo === "" ? null : data.contactPersonPhoneNo,
  overdueAmount: data.overdueAmount === "" ? null : data.overdueAmount,
  solutionBySalesperson: data.solutionBySalesperson === "" ? null : data.solutionBySalesperson,
  anyRemarks: data.anyRemarks === "" ? null : data.anyRemarks,
  checkOutTime: data.checkOutTime === "" ? null : data.checkOutTime,
  inTimeImageUrl: data.inTimeImageUrl === "" ? null : data.inTimeImageUrl,
  outTimeImageUrl: data.outTimeImageUrl === "" ? null : data.outTimeImageUrl,
}));

function createAutoCRUD(app: Express, config: {
  endpoint: string,
  table: any,
  schema: z.ZodSchema,
  tableName: string,
  autoFields?: { [key: string]: () => any }
}) {
  const { endpoint, table, schema, tableName, autoFields = {} } = config;

  app.post(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      const payload: any = { ...req.body };
      
      if (typeof payload.brandSelling === 'string') {
        payload.brandSelling = payload.brandSelling.split(',').map((s: string) => s.trim()).filter(Boolean);
      }

      const executedAutoFields: any = {};
      for (const [key, fn] of Object.entries(autoFields)) {
        executedAutoFields[key] = fn();
      }

      const parsed = schema.parse(payload);
      const generatedId = randomUUID();

      const insertData = {
        id: generatedId,
        ...parsed,
        reportDate: new Date(parsed.reportDate),
        checkInTime: new Date(parsed.checkInTime),
        checkOutTime: parsed.checkOutTime ? new Date(parsed.checkOutTime) : null,
        ...executedAutoFields
      };

      const [newRecord] = await db.insert(table).values(insertData).returning();

      res.status(201).json({
        success: true,
        message: `${tableName} created successfully`,
        data: newRecord
      });
    } catch (error: any) {
      console.error(`Create ${tableName} error:`, error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
            received: err.received
          }))
        });
      }
      res.status(500).json({
        success: false,
        error: `Failed to create ${tableName}`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}

export default function setupDailyVisitReportsPostRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'daily-visit-reports',
    table: dailyVisitReports,
    schema: dailyVisitReportSchema,
    tableName: 'Daily Visit Report',
    autoFields: {
      createdAt: () => new Date(),
      updatedAt: () => new Date()
    }
  });
  
  console.log('✅ Daily Visit Reports POST endpoints setup complete');
}