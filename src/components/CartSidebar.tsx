'use client'

import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { 
  XMarkIcon, 
  MinusIcon, 
  PlusIcon, 
  TrashIcon,
  CheckIcon,
  TruckIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  BanknotesIcon,
  PhoneIcon,
  UserIcon,
  MapPinIcon,
  ClockIcon,
  ChevronRightIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';
import { ShoppingBagIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckoutData, CheckoutStep, CASH_DENOMINATIONS, ValidationErrors } from '@/types/checkout';
import { generateOrderNumber, sendOrderToTelegram } from '@/utils/telegram';

type ViewType = 'cart' | 'checkout' | 'success';

export default function CartSidebar() {
  const { cart, removeFromCart, updateQuantity, clearCart, toggleCart } = useCart();
  const [currentView, setCurrentView] = useState<ViewType>('cart');
  const [currentStep, setCurrentStep] = useState(0);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    contact: { name: '', phone: '' },
    delivery: { type: 'pickup' },
    payment: { method: 'cash' },
    notes: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Tarifa de envío
  const shippingCost = checkoutData.delivery.type === 'delivery' ? 30 : 0;

  const steps: CheckoutStep[] = [
    {
      id: 'contact',
      title: 'Información de Contacto',
      description: 'Tu nombre y teléfono',
      isCompleted: currentStep > 0,
      isActive: currentStep === 0
    },
    {
      id: 'delivery',
      title: 'Método de Entrega',
      description: 'Recojo o delivery',
      isCompleted: currentStep > 1,
      isActive: currentStep === 1
    },
    {
      id: 'payment',
      title: 'Método de Pago',
      description: 'Efectivo o tarjeta',
      isCompleted: currentStep > 2,
      isActive: currentStep === 2
    },
    {
      id: 'review',
      title: 'Revisar Pedido',
      description: 'Confirma tu orden',
      isCompleted: currentStep > 3,
      isActive: currentStep === 3
    }
  ];

  // Reset when cart closes
  useEffect(() => {
    if (!cart.isOpen) {
      setTimeout(() => {
        setCurrentView('cart');
        setCurrentStep(0);
        setCheckoutData({
          contact: { name: '', phone: '' },
          delivery: { type: 'pickup' },
          payment: { method: 'cash' },
          notes: ''
        });
        setErrors({});
        setIsSubmitting(false);
      }, 300);
    }
  }, [cart.isOpen]);

  const updateCheckoutData = (updates: Partial<CheckoutData>) => {
    setCheckoutData(prev => ({
      ...prev,
      ...updates
    }));
    setErrors({});
  };

  const validateStep = (step: number): boolean => {
    const newErrors: ValidationErrors = {};

    switch (step) {
      case 0:
        if (!checkoutData.contact.name.trim()) {
          newErrors.contact = { ...newErrors.contact, name: 'El nombre es requerido' };
        }
        if (!checkoutData.contact.phone.trim()) {
          newErrors.contact = { ...newErrors.contact, phone: 'El teléfono es requerido' };
        } else if (!/^\d{10}$/.test(checkoutData.contact.phone.replace(/\D/g, ''))) {
          newErrors.contact = { ...newErrors.contact, phone: 'Ingresa un teléfono válido (10 dígitos)' };
        }
        break;

      case 1:
        if (checkoutData.delivery.type === 'delivery' && !checkoutData.delivery.address?.trim()) {
          newErrors.delivery = { address: 'La dirección es requerida para delivery' };
        }
        break;

      case 2:
        if (checkoutData.payment.method === 'cash' && !checkoutData.payment.exactChange && !checkoutData.payment.cashAmount) {
          newErrors.payment = { cashAmount: 'Selecciona la denominación con la que pagarás o marca pago exacto' };
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleStartCheckout = () => {
    setCurrentView('checkout');
    setCurrentStep(0);
  };

  const handleBackToCart = () => {
    setCurrentView('cart');
    setCurrentStep(0);
  };

  const handleComplete = async () => {
    if (validateStep(currentStep)) {
      setIsSubmitting(true);
      
      try {
        const newOrderNumber = generateOrderNumber();
        const telegramResult = await sendOrderToTelegram(checkoutData, cart, newOrderNumber);
        
        if (telegramResult.success) {
          setOrderNumber(newOrderNumber);
          // Close cart sidebar first, but don't change view yet
          toggleCart();
          // Wait for sidebar animation to complete, then show modal
          setTimeout(() => {
            setCurrentView('success');
            clearCart();
          }, 500);
        } else {
          alert(`Error: ${telegramResult.message}`);
        }
        
        setIsSubmitting(false);
      } catch (error) {
        console.error('Error al procesar el pedido:', error);
        alert('Error al procesar el pedido. Por favor intenta nuevamente.');
        setIsSubmitting(false);
      }
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const getEstimatedTime = () => {
    return checkoutData.delivery.type === 'pickup' ? '30 min' : '45 min';
  };

  const getChange = () => {
    if (checkoutData.payment.method === 'cash' && checkoutData.payment.cashAmount) {
      return checkoutData.payment.cashAmount - (cart.total + shippingCost);
    }
    return 0;
  };

  const sidebarVariants = {
    closed: { x: '100%' },
    open: { x: 0 }
  };

  const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <>
      <AnimatePresence>
        {cart.isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              variants={backdropVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={toggleCart}
            />

            {/* Sidebar */}
            <motion.div
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
            {/* CART VIEW */}
            {currentView === 'cart' && (
              <>
                {/* Header */}
                <div className="border-b border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ShoppingBagIcon className="w-6 h-6 text-red-600" />
                      <h2 className="text-xl font-bold text-gray-900">
                        Mi Carrito ({cart.itemCount})
                      </h2>
                    </div>
                    <button
                      onClick={toggleCart}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6">
                  {cart.items.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Tu carrito está vacío
                      </h3>
                      <p className="text-gray-500">
                        Agrega algunos productos para comenzar
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {cart.items.map((item, index) => (
                          <motion.div
                            key={item.id}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                          >
                            <div className="flex gap-3">
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                {item.menuItem.imagen_url ? (
                                  <Image
                                    src={item.menuItem.imagen_url}
                                    alt={item.menuItem.nombre}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
                                    🍱
                                  </div>
                                )}
                              </div>

                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 text-sm">
                                  {item.menuItem.nombre}
                                </h4>
                                <p className="text-xs text-gray-600 mb-2">
                                  ${item.menuItem.precio} c/u
                                </p>

                                <div className="text-xs text-gray-500 space-y-1">
                                  {item.options.complementos.length > 0 && (
                                    <div>
                                      <span className="font-medium">Complementos: </span>
                                      {item.options.complementos.map(comp => comp.name).join(', ')}
                                    </div>
                                  )}
                                  <div>
                                    <span className="font-medium">Soya: </span>
                                    {item.options.soya.name}
                                  </div>
                                  <div>
                                    <span className="font-medium">Cubiertos: </span>
                                    {item.options.cubiertos.name}
                                  </div>
                                  {item.options.comentarios && (
                                    <div>
                                      <span className="font-medium">Comentarios: </span>
                                      {item.options.comentarios}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-between mt-3">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                    >
                                      <MinusIcon className="w-3 h-3" />
                                    </button>
                                    <span className="w-8 text-center text-sm font-medium">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                    >
                                      <PlusIcon className="w-3 h-3" />
                                    </button>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900">
                                      ${item.subtotal.toFixed(2)}
                                    </span>
                                    <button
                                      onClick={() => removeFromCart(item.id)}
                                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                    >
                                      <TrashIcon className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {cart.items.length > 0 && (
                        <button
                          onClick={clearCart}
                          className="w-full text-red-600 hover:text-red-700 text-sm font-medium py-2 transition-colors"
                        >
                          Vaciar carrito
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {cart.items.length > 0 && (
                  <div className="border-t border-gray-200 p-6 bg-white">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total:</span>
                        <span className="text-2xl font-bold text-green-600">
                          ${cart.total.toFixed(2)}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleStartCheckout}
                          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 rounded-xl transition-all transform shadow-lg hover:shadow-xl"
                        >
                          🚚 Finalizar Pedido
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={toggleCart}
                          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-xl transition-colors"
                        >
                          Continuar comprando
                        </motion.button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* CHECKOUT VIEW */}
            {currentView === 'checkout' && (
              <>
                {/* Header with progress */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">Finalizar Pedido</h2>
                      <p className="text-orange-100 mt-1">
                        {steps[currentStep].title}
                      </p>
                    </div>
                    <button
                      onClick={handleBackToCart}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                  
                  {/* Progress Steps */}
                  <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                      <div key={step.id} className="flex items-center">
                        <div className={`
                          flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                          ${index <= currentStep 
                            ? 'bg-white text-orange-500' 
                            : 'bg-orange-400 text-white'
                          }
                        `}>
                          {index < currentStep ? (
                            <CheckIcon className="w-4 h-4" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        {index < steps.length - 1 && (
                          <div className={`
                            w-12 h-0.5 mx-2
                            ${index < currentStep ? 'bg-white' : 'bg-orange-400'}
                          `} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Checkout Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {/* Step 0: Contact Info */}
                  {currentStep === 0 && (
                    <div className="space-y-6">
                      <div className="text-center mb-8">
                        <UserIcon className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Información de Contacto
                        </h3>
                        <p className="text-gray-600">
                          Necesitamos tus datos para contactarte sobre tu pedido
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre Completo *
                        </label>
                        <input
                          type="text"
                          value={checkoutData.contact.name}
                          onChange={(e) => updateCheckoutData({
                            contact: { ...checkoutData.contact, name: e.target.value }
                          })}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                            errors.contact?.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Ej: Juan Pérez"
                        />
                        {errors.contact?.name && (
                          <p className="text-red-500 text-sm mt-1">{errors.contact.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número de Teléfono *
                        </label>
                        <input
                          type="tel"
                          value={formatPhone(checkoutData.contact.phone)}
                          onChange={(e) => updateCheckoutData({
                            contact: { ...checkoutData.contact, phone: e.target.value.replace(/\D/g, '') }
                          })}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                            errors.contact?.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="55-1234-5678"
                          maxLength={12}
                        />
                        {errors.contact?.phone && (
                          <p className="text-red-500 text-sm mt-1">{errors.contact.phone}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 1: Delivery Method */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          ¿Cómo prefieres recibir tu pedido?
                        </h3>
                        <p className="text-sm text-gray-600">
                          Elige entre recoger en sucursal o delivery a domicilio
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => updateCheckoutData({
                            delivery: { type: 'pickup' }
                          })}
                          className={`p-3 border-2 rounded-xl transition-all text-center ${
                            checkoutData.delivery.type === 'pickup'
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <BuildingStorefrontIcon className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">Recoger en Sucursal</h4>
                          <div className="flex items-center justify-center text-xs text-orange-600">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            30 min
                          </div>
                        </button>

                        <button
                          onClick={() => updateCheckoutData({
                            delivery: { type: 'delivery', address: checkoutData.delivery.address || '' }
                          })}
                          className={`p-3 border-2 rounded-xl transition-all text-center ${
                            checkoutData.delivery.type === 'delivery'
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <TruckIcon className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">Delivery a Domicilio</h4>
                          <div className="flex items-center justify-center text-xs text-orange-600">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            45 min
                          </div>
                        </button>
                      </div>

                      {checkoutData.delivery.type === 'delivery' && (
                        <div className="mt-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dirección de Entrega *
                          </label>
                          <textarea
                            value={checkoutData.delivery.address || ''}
                            onChange={(e) => updateCheckoutData({
                              delivery: { ...checkoutData.delivery, address: e.target.value }
                            })}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                              errors.delivery?.address ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Ingresa tu dirección completa con referencias..."
                            rows={3}
                          />
                          {errors.delivery?.address && (
                            <p className="text-red-500 text-sm mt-1">{errors.delivery.address}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2: Payment Method */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          ¿Cómo vas a pagar?
                        </h3>
                        <p className="text-sm text-gray-600">
                          El pago se realiza al {checkoutData.delivery.type === 'pickup' ? 'recoger' : 'recibir'} tu pedido
                        </p>
                        {/* Mensaje de tarifa de envío si es delivery */}
                        {checkoutData.delivery.type === 'delivery' && (
                          <div className="mt-4 text-sm text-orange-600 font-semibold bg-orange-50 rounded-xl py-2 px-4 inline-block">
                            Se realizará un cobro adicional de $30.00 por tarifa de envío a domicilio.
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => updateCheckoutData({
                            payment: { method: 'cash' }
                          })}
                          className={`p-3 border-2 rounded-xl transition-all text-center ${
                            checkoutData.payment.method === 'cash'
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <BanknotesIcon className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                          <h4 className="font-semibold text-gray-900 text-sm">Efectivo</h4>
                        </button>

                        <button
                          onClick={() => updateCheckoutData({
                            payment: { method: 'card' }
                          })}
                          className={`p-3 border-2 rounded-xl transition-all text-center ${
                            checkoutData.payment.method === 'card'
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <CreditCardIcon className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                          <h4 className="font-semibold text-gray-900 text-sm">Tarjeta</h4>
                        </button>
                      </div>

                      {checkoutData.payment.method === 'cash' && (
                        <div className="mt-6">
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            ¿Con cuánto vas a pagar? (Total: ${(cart.total + shippingCost).toFixed(2)}) *
                          </label>
                          
                          <div className="mb-4">
                            <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50">
                              <input
                                type="checkbox"
                                checked={checkoutData.payment.exactChange || false}
                                onChange={(e) => {
                                  updateCheckoutData({
                                    payment: { 
                                      ...checkoutData.payment, 
                                      exactChange: e.target.checked,
                                      cashAmount: e.target.checked ? (cart.total + shippingCost) : checkoutData.payment.cashAmount
                                    }
                                  })
                                }}
                                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                              />
                              <div className="ml-3">
                                <span className="font-medium text-gray-900">Pago con cambio exacto</span>
                                <p className="text-sm text-gray-600">Pagaré exactamente ${(cart.total + shippingCost).toFixed(2)}</p>
                              </div>
                            </label>
                          </div>

                          {!checkoutData.payment.exactChange && (
                            <>
                              <p className="text-sm text-gray-600 mb-3">O selecciona con qué billete pagarás:</p>
                              <div className="grid grid-cols-3 gap-3">
                                {CASH_DENOMINATIONS.map((denomination) => (
                                  <button
                                    key={denomination.value}
                                    onClick={() => updateCheckoutData({
                                      payment: { ...checkoutData.payment, cashAmount: denomination.value, exactChange: false }
                                    })}
                                    disabled={denomination.value < (cart.total + shippingCost)}
                                    className={`p-3 border-2 rounded-xl text-center transition-all ${
                                      checkoutData.payment.cashAmount === denomination.value && !checkoutData.payment.exactChange
                                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                                        : denomination.value < (cart.total + shippingCost)
                                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                  >
                                    <div className="font-semibold">{denomination.label}</div>
                                    {denomination.value >= (cart.total + shippingCost) && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        Cambio: ${(denomination.value - (cart.total + shippingCost)).toFixed(2)}
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                          {errors.payment?.cashAmount && (
                            <p className="text-red-500 text-sm mt-2">{errors.payment.cashAmount}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Review Order */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="text-center mb-8">
                        <CheckIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Revisa tu Pedido
                        </h3>
                        <p className="text-gray-600">
                          Confirma que todo esté correcto antes de finalizar
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Resumen del Pedido</h4>
                        
                        <div className="mb-4 pb-4 border-b border-gray-200">
                          <div className="flex items-center mb-2">
                            <UserIcon className="w-5 h-5 text-gray-500 mr-2" />
                            <span className="font-medium">{checkoutData.contact.name}</span>
                          </div>
                          <div className="flex items-center">
                            <PhoneIcon className="w-5 h-5 text-gray-500 mr-2" />
                            <span>{formatPhone(checkoutData.contact.phone)}</span>
                          </div>
                        </div>

                        <div className="mb-4 pb-4 border-b border-gray-200">
                          <div className="flex items-center mb-2">
                            {checkoutData.delivery.type === 'pickup' ? (
                              <BuildingStorefrontIcon className="w-5 h-5 text-gray-500 mr-2" />
                            ) : (
                              <TruckIcon className="w-5 h-5 text-gray-500 mr-2" />
                            )}
                            <span className="font-medium">
                              {checkoutData.delivery.type === 'pickup' ? 'Recoger en Sucursal' : 'Delivery a Domicilio'}
                            </span>
                          </div>
                          {checkoutData.delivery.address && (
                            <div className="flex items-start">
                              <MapPinIcon className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                              <span className="text-sm text-gray-600">{checkoutData.delivery.address}</span>
                            </div>
                          )}
                          <div className="flex items-center mt-2">
                            <ClockIcon className="w-5 h-5 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-600">
                              Tiempo estimado: {getEstimatedTime()}
                            </span>
                          </div>
                        </div>

                        <div className="mb-4 pb-4 border-b border-gray-200">
                          <div className="flex items-center mb-2">
                            {checkoutData.payment.method === 'cash' ? (
                              <BanknotesIcon className="w-5 h-5 text-gray-500 mr-2" />
                            ) : (
                              <CreditCardIcon className="w-5 h-5 text-gray-500 mr-2" />
                            )}
                            <span className="font-medium">
                              {checkoutData.payment.method === 'cash' ? 'Efectivo' : 'Tarjeta'}
                            </span>
                          </div>
                          {checkoutData.payment.method === 'cash' && checkoutData.payment.cashAmount && (
                            <div className="text-sm text-gray-600">
                              {checkoutData.payment.exactChange ? (
                                <span className="text-green-600 font-medium">✓ Pago exacto: ${checkoutData.payment.cashAmount.toFixed(2)}</span>
                              ) : (
                                <>
                                  Pagas con: ${checkoutData.payment.cashAmount.toFixed(2)}<br />
                                  Tu cambio: ${getChange().toFixed(2)}
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center text-lg font-semibold">
                          <span>Subtotal:</span>
                          <span>${cart.total.toFixed(2)}</span>
                        </div>
                        {shippingCost > 0 && (
                          <div className="flex justify-between items-center text-sm text-gray-600 mt-2">
                            <span>Envío a domicilio:</span>
                            <span>${shippingCost.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-xl font-bold text-orange-600 mt-3 pt-3 border-t border-gray-200">
                          <span>Total a Pagar:</span>
                          <span>${(cart.total + shippingCost).toFixed(2)}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notas Adicionales (Opcional)
                        </label>
                        <textarea
                          value={checkoutData.notes || ''}
                          onChange={(e) => updateCheckoutData({ notes: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          placeholder="Alguna instrucción especial para tu pedido..."
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center p-6 border-t border-gray-200">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeftIcon className="w-5 h-5 mr-1" />
                    Anterior
                  </button>

                  {currentStep < steps.length - 1 ? (
                    <button
                      onClick={nextStep}
                      className="flex items-center px-8 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all transform hover:scale-105"
                    >
                      Continuar
                      <ChevronRightIcon className="w-5 h-5 ml-1" />
                    </button>
                  ) : (
                    <button
                      onClick={handleComplete}
                      disabled={isSubmitting}
                      className="flex items-center px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all transform hover:scale-105"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <CheckIcon className="w-5 h-5 mr-1" />
                          Confirmar Pedido
                        </>
                      )}
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>

    {/* SUCCESS MODAL - Desktop Only */}
    <AnimatePresence>
      {currentView === 'success' && !cart.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={() => {
            setCurrentView('cart');
            setCurrentStep(0);
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden"
          >
            {/* Layout horizontal: Izquierda - Info del pedido | Derecha - Detalles */}
            <div className="grid grid-cols-1 md:grid-cols-5">
              {/* Columna izquierda - Imagen del Chef */}
              <div className="md:col-span-2 bg-white p-2 flex items-center justify-center relative overflow-hidden">
                {/* Imagen del cocinero */}
                <div className="w-full h-full flex items-center justify-center">
                  <Image
                    src="/images/cocina.png"
                    alt="Chef"
                    width={600}
                    height={600}
                    className="object-contain w-full h-auto max-h-full scale-110"
                    priority
                  />
                </div>
              </div>

              {/* Columna derecha - Detalles del pedido (2 columnas) */}
              <div className="md:col-span-3 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">¡Tu pedido ha sido realizado exitosamente!</h3>
                
                <div className="space-y-4 mb-6">
                  {/* Tiempo estimado */}
                  <div className="flex items-center gap-4 bg-gradient-to-r from-[#a2cbec]/30 to-[#3d89c5]/20 rounded-xl p-4 border border-[#3d89c5]/30">
                    <div className="w-12 h-12 bg-[#3d89c5] rounded-full flex items-center justify-center flex-shrink-0">
                      <ClockIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 font-medium">Tiempo estimado</p>
                      <p className="text-xl font-bold text-gray-900">{getEstimatedTime()}</p>
                    </div>
                  </div>

                  {/* Tipo de entrega */}
                  <div className="flex items-center gap-4 bg-gradient-to-r from-[#a2cbec]/30 to-[#3d89c5]/20 rounded-xl p-4 border border-[#3d89c5]/30">
                    <div className="w-12 h-12 bg-[#3d89c5] rounded-full flex items-center justify-center flex-shrink-0">
                      {checkoutData.delivery.type === 'pickup' ? (
                        <BuildingStorefrontIcon className="w-6 h-6 text-white" />
                      ) : (
                        <TruckIcon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 font-medium">Tipo de entrega</p>
                      <p className="text-xl font-bold text-gray-900">
                        {checkoutData.delivery.type === 'pickup' ? 'Recoger en sucursal' : 'Delivery a domicilio'}
                      </p>
                    </div>
                  </div>

                  {/* Dirección (si es delivery) */}
                  {checkoutData.delivery.type === 'delivery' && checkoutData.delivery.address && (
                    <div className="flex items-start gap-4 bg-gradient-to-r from-[#a2cbec]/30 to-[#3d89c5]/20 rounded-xl p-4 border border-[#3d89c5]/30">
                      <div className="w-12 h-12 bg-[#3d89c5] rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPinIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 font-medium mb-1">Dirección de entrega</p>
                        <p className="text-lg text-gray-900">{checkoutData.delivery.address}</p>
                      </div>
                    </div>
                  )}

                  {/* Número de Pedido */}
                  <div className="flex items-center gap-4 bg-gradient-to-r from-[#a2cbec]/30 to-[#3d89c5]/20 rounded-xl p-4 border border-[#3d89c5]/30">
                    <div className="w-12 h-12 bg-[#3d89c5] rounded-full flex items-center justify-center flex-shrink-0">
                      <PhoneIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 font-medium">Número de pedido</p>
                      <p className="text-xl font-bold text-gray-900">{orderNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Mensaje de WhatsApp */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-center text-sm text-blue-800">
                    <span className="font-semibold">📱 Hemos enviado la confirmación a tu WhatsApp.</span>
                    <br />
                    Nos pondremos en contacto contigo pronto.
                  </p>
                </div>

                {/* Botón de cerrar */}
                <button
                  onClick={() => {
                    setCurrentView('cart');
                    setCurrentStep(0);
                  }}
                  className="w-full bg-gradient-to-r from-[#3d89c5] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  Continuar Navegando
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
