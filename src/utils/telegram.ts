import { CheckoutData } from '@/types/checkout';
import { CartState } from '@/types/cart';

export const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `MZ${timestamp}${random}`;
};

export const sendOrderToTelegram = async (
  orderData: CheckoutData, 
  cart: CartState, 
  orderNumber: string
): Promise<{ success: boolean; message: string; orderNumber?: string }> => {
  try {
    const response = await fetch('/api/telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderNumber,
        checkoutData: orderData,
        cart
      })
    });

    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        message: 'Pedido enviado exitosamente',
        orderNumber: result.orderNumber
      };
    } else {
      return {
        success: false,
        message: result.message || 'Error al enviar el pedido'
      };
    }
  } catch (error) {
    console.error('Error sending order to Telegram:', error);
    return {
      success: false,
      message: 'Error de conexión. Por favor intenta nuevamente.'
    };
  }
};