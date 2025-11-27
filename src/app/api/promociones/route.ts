import { NextRequest, NextResponse } from 'next/server'
import { googleSheetsService } from '@/lib/googleSheets'
// Simple in-memory cache (10 min)
let cachedPromociones: any = null;
let cachedPromocionesTimestamp: number = 0;
const TEN_MINUTES = 10 * 60 * 1000;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tipo = searchParams.get('tipo') as 'sucursal' | 'domicilio' | null

    const now = Date.now();
    if (cachedPromociones && now - cachedPromocionesTimestamp < TEN_MINUTES && !tipo) {
      console.log('🟢 Returning cached promociones');
      return NextResponse.json({
        success: true,
        data: cachedPromociones,
        count: cachedPromociones.length,
        cached: true
      });
    }
    let promociones;
    if (tipo && (tipo === 'sucursal' || tipo === 'domicilio')) {
      console.log(`🎁 Fetching promociones for tipo: ${tipo}`);
      promociones = await googleSheetsService.getPromocionesByType(tipo);
    } else {
      console.log('🎁 Fetching all promociones');
      promociones = await googleSheetsService.getPromociones();
      cachedPromociones = promociones;
      cachedPromocionesTimestamp = now;
    }
    return NextResponse.json({
      success: true,
      data: promociones,
      count: promociones.length,
      cached: false
    });
  } catch (error) {
    console.error('❌ Promociones API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch promociones data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}