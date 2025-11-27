import { NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/googleSheets';
// Simple in-memory cache (10 min)
let cachedMenuData: any = null;
let cachedMenuTimestamp: number = 0;
const TEN_MINUTES = 10 * 60 * 1000;

export async function GET() {
  try {
    const now = Date.now();
    if (cachedMenuData && now - cachedMenuTimestamp < TEN_MINUTES) {
      console.log('🟢 Returning cached menu data');
      return NextResponse.json({
        success: true,
        data: cachedMenuData,
        lastUpdated: new Date(cachedMenuTimestamp).toISOString(),
        cached: true,
        stats: {
          categories: cachedMenuData.length,
          totalItems: cachedMenuData.reduce((acc: any, cat: any) => acc + cat.items.length, 0)
        }
      });
    }
    console.log('🔄 Fetching menu data from Google Sheets...');
    const menuData = await googleSheetsService.getMenuData();
    cachedMenuData = menuData;
    cachedMenuTimestamp = now;
    return NextResponse.json({
      success: true,
      data: menuData,
      lastUpdated: new Date().toISOString(),
      cached: false,
      stats: {
        categories: menuData.length,
        totalItems: menuData.reduce((acc, cat) => acc + cat.items.length, 0)
      }
    });
  } catch (error) {
    console.error('❌ Menu API Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch menu data',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Endpoint para probar la conexión
export async function POST() {
  try {
    console.log('🔍 Testing Google Sheets connection...');
    
    const connectionTest = await googleSheetsService.testConnection();
    
    if (connectionTest) {
      return NextResponse.json({
        success: true,
        message: 'Connection to Google Sheets successful!',
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to connect to Google Sheets',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Connection test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}