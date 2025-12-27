import { NextResponse } from "next/server";
import { setupDatabaseIndexes } from "@/lib/db/indexes";

/**
 * API endpoint to set up database indexes
 * Call this once after initial setup: GET /api/setup
 * Or use the script: npm run setup-indexes
 */
export async function GET() {
  try {
    await setupDatabaseIndexes();
    return NextResponse.json({ 
      success: true, 
      message: "Database indexes set up successfully" 
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to set up indexes" 
      },
      { status: 500 }
    );
  }
}

