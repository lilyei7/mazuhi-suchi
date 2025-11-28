import { NextRequest, NextResponse } from 'next/server';
import { CartState } from '@/types/cart';

const TELEGRAM_BOT_TOKEN = '8512401816:AAEeo4ZWu8NL2AvNrz18U8OUNPU1v8eOWuU';

// Lista de usuarios/chats a los que se envían las notificaciones de mesero
const TELEGRAM_RECIPIENTS = [
  '-4993108536',      // Grupo principal de Mazuhi
  '@frreeemaan'       // Usuario frreeemaan
];

interface WaiterNotificationRequest {
  cart: CartState;
}

export async function POST(request: NextRequest) {
  try {
    const { cart }: WaiterNotificationRequest = await request.json();
    
    // Generar mensaje para notificación de mesero
    const message = generateWaiterMessage(cart);
    
    // Enviar mensaje a todos los destinatarios
    const results = await Promise.all(
      TELEGRAM_RECIPIENTS.map(recipient => sendTelegramMessage(message, recipient))
    );
    
    // Verificar que al menos uno fue exitoso
    const anySuccessful = results.some(response => response.ok);
    
    if (anySuccessful) {
      console.log(`✅ Notificación de mesero enviada a ${results.filter(r => r.ok).length}/${TELEGRAM_RECIPIENTS.length} destinatarios`);
      return NextResponse.json({ 
        success: true, 
        message: 'Notificación de mesero enviada exitosamente',
        recipientsNotified: results.filter(r => r.ok).length
      });
    } else {
      throw new Error('Failed to send message to any Telegram recipient');
    }
    
  } catch (error) {
    console.error('Error sending waiter notification to Telegram:', error);
    return NextResponse.json(
      { success: false, message: 'Error al enviar notificación de mesero' },
      { status: 500 }
    );
  }
}

function generateWaiterMessage(cart: CartState): string {
  // Obtener hora actual en zona horaria de CDMX
  const now = new Date();
  const currentTime = now.toLocaleTimeString('es-MX', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Mexico_City'
  });

  let message = `🚨 *NOTIFICACIÓN PARA MESERO*\n\n`;
  message += `⏰ *Hora:* ${currentTime}\n\n`;
  
  message += `🍱 *PRODUCTOS EN CARRITO*\n`;
  cart.items.forEach((item, index) => {
    message += `${index + 1}. *${item.menuItem.nombre}*\n`;
    message += `   • Cantidad: ${item.quantity}\n`;
    message += `   • Precio: $${item.menuItem.precio.toFixed(2)} c/u\n`;
    
    // Agregar opciones si las hay
    if (item.options.complementos && item.options.complementos.length > 0) {
      message += `   • Complementos: ${item.options.complementos.map(c => c.name).join(', ')}\n`;
    }
    
    if (item.options.soya) {
      message += `   • Soya: ${item.options.soya.name}\n`;
    }
    
    if (item.options.comentarios) {
      message += `   • Notas: ${item.options.comentarios}\n`;
    }
    message += `\n`;
  });
  
  // Total
  message += `💰 *TOTAL: $${cart.total.toFixed(2)}*\n\n`;
  message += `⚠️ *CLIENTE ESTÁ EN EL MOSTRADOR - COMPLETAR COMPRA*`;
  
  return message;
}

async function sendTelegramMessage(message: string, recipient: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: recipient,
      text: message,
      parse_mode: 'Markdown'
    }),
  });
  
  return response;
}