//  server/src/routes/postRoutes/ddp.ts 
// DDP POST endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { ddp, insertDdpSchema } from '../../db/schema';
import { z } from 'zod';

function createAutoCRUD(app: Express, config: {
  endpoint: string,
  table: any,
  schema: z.ZodSchema,
  tableName: string,
  autoFields?: { [key: string]: () => any }
}) {
  const { endpoint, table, schema, tableName, autoFields = {} } = config;

  // CREATE NEW RECORD
  app.post(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      const validatedData = schema.parse({
        ...req.body,
        ...autoFields
      });

      const [newRecord] = await db.insert(table).values(validatedData).returning();

      res.status(201).json({
        success: true,
        message: `${tableName} created successfully`,
        data: newRecord
      });
    } catch (error) {
      console.error(`Create ${tableName} error:`, error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors
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

export default function setupDdpPostRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'ddp',
    table: ddp,
    schema: insertDdpSchema,
    tableName: 'Dealer Development Process',
    autoFields: {
      creationDate: () => new Date().toISOString().split('T')[0]
    }
  });
  
  console.log('✅ DDP POST endpoints setup complete');
}