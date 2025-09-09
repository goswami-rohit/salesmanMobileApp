//  server/src/routes/postRoutes/attendanceOut.ts 
// Attendance Check-Out POST endpoints

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { salesmanAttendance } from '../../db/schema';
import { eq, and, isNull } from 'drizzle-orm';

export default function setupAttendanceOutPostRoutes(app: Express) {
  
  // ATTENDANCE CHECK-OUT
  app.post('/api/attendance/check-out', async (req: Request, res: Response) => {
    try {
      const {
        userId,
        attendanceDate,
        outTimeImageCaptured,
        outTimeImageUrl,
        outTimeLatitude,
        outTimeLongitude,
        outTimeAccuracy,
        outTimeSpeed,
        outTimeHeading,
        outTimeAltitude
      } = req.body;

      // Find existing attendance record for today
      const [existingAttendance] = await db
        .select()
        .from(salesmanAttendance)
        .where(
          and(
            eq(salesmanAttendance.userId, userId),
            eq(salesmanAttendance.attendanceDate, attendanceDate),
            isNull(salesmanAttendance.outTimeTimestamp)
          )
        )
        .limit(1);

      if (!existingAttendance) {
        return res.status(404).json({
          success: false,
          error: 'No check-in record found for today or user has already checked out'
        });
      }

      const updateData = {
        outTimeTimestamp: new Date(),
        outTimeImageCaptured: outTimeImageCaptured || false,
        outTimeImageUrl: outTimeImageUrl || null,
        outTimeLatitude: outTimeLatitude || null,
        outTimeLongitude: outTimeLongitude || null,
        outTimeAccuracy: outTimeAccuracy || null,
        outTimeSpeed: outTimeSpeed || null,
        outTimeHeading: outTimeHeading || null,
        outTimeAltitude: outTimeAltitude || null,
        updatedAt: new Date()
      };

      const [updatedAttendance] = await db
        .update(salesmanAttendance)
        .set(updateData)
        .where(eq(salesmanAttendance.id, existingAttendance.id))
        .returning();

      res.json({
        success: true,
        message: 'Check-out successful',
        data: updatedAttendance
      });

    } catch (error) {
      console.error('Attendance check-out error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check out',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  console.log('✅ Attendance Check-Out POST endpoints setup complete');
}