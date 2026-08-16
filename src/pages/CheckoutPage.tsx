import React, { useState } from 'react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ShippingAddress, PaymentMethod, Order } from '../types';
import { AddressStep } from '../components/checkout/AddressStep';
import { PaymentMethodStep } from '../components/checkout/PaymentMethodStep';
import { UpiPaymentStep } from '../components/checkout/UpiPaymentStep';
import { CardPaymentStep } from '../components/checkout/CardPaymentStep';
import { CheckoutSummary } from '../components/checkout/CheckoutSummary';

type CheckoutStep = 'address' | 'payment_method' | 'upi_payment' | 'card_payment';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    savedAddress,
    placeOrder,
    navigate,
    setLastCreatedOrder,
  } = useShop();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const [shippingDetails, setShippingDetails] = useState<ShippingAddress>(() => {
    if (savedAddress) {
      return savedAddress;
    }
    return {
      fullName: '',
      mobile: '',
      email: '',
      house: '',
      street: '',
      area: '',
      landmark: '',
      city: '',
      state: '',
      pin: '',
      country: 'India',
      saveForFuture: true,
    };
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  if (cart.length === 0 && !activeOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#FAF6EE] border border-[#D4AF37] flex items-center justify-center mx-auto text-[#4A0E17]">
          <ShoppingBag className="w-8 h-8 text-[#801723]" />
        </div>
        <h2 className="font-serif-luxury text-2xl font-bold text-[#3B0C13]">
          Your Shopping Bag is Empty
        </h2>
        <p className="text-xs text-[#7A695C]">
          Add exquisite handcrafted styles to proceed with checkout.
        </p>
        <button
          onClick={() => navigate('shop')}
          className="bg-[#4A0E17] text-[#DFBA67] font-bold text-xs px-6 py-3 rounded-xl border border-[#D4AF37] shadow-lg cursor-pointer"
        >
          EXPLORE LUXURY COLLECTION
        </button>
      </div>
    );
  }

  // Handle step 1: Address confirmation
  const handleAddressSubmit = (confirmedAddress: ShippingAddress) => {
    setShippingDetails(confirmedAddress);
    setCurrentStep('payment_method');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle step 2: Proceed to payment
  const handleProceedToPayment = async () => {
    setIsCreatingOrder(true);
    // Create server-side order with Pending status
    const createdOrder = await placeOrder(shippingDetails, paymentMethod);
    setIsCreatingOrder(false);

    if (createdOrder) {
      setActiveOrder(createdOrder);
      if (paymentMethod === 'UPI') {
        setCurrentStep('upi_payment');
      } else if (paymentMethod === 'Card') {
        setCurrentStep('card_payment');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert('Could not initialize payment session. Please check your cart or try again.');
    }
  };

  // Handle payment completion
  const handlePaymentSuccess = (confirmedOrder: Order) => {
    setLastCreatedOrder(confirmedOrder);
    navigate('order-success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (currentStep === 'payment_method') setCurrentStep('address');
              else if (currentStep === 'upi_payment' || currentStep === 'card_payment')
                setCurrentStep('payment_method');
              else navigate('cart');
            }}
            className="p-2 text-[#4A0E17] hover:bg-[#FAF6EE] rounded-full transition-colors"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif-luxury text-2xl font-bold text-[#3B0C13]">
              PREMIUM CHECKOUT
            </h1>
            <p className="text-xs text-[#7A695C]">
              Authentic Indian Ethnicwear • Handcrafted Elegance
            </p>
          </div>
        </div>

        {/* Stepper Pill Indicator */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-bold">
          <span
            className={`px-3 py-1 rounded-full border ${
              currentStep === 'address'
                ? 'bg-[#4A0E17] text-[#DFBA67] border-[#D4AF37]'
                : 'bg-[#FAF6EE] text-[#7A695C] border-[#EAE3D2]'
            }`}
          >
            1. Address
          </span>
          <span className="text-[#C4B4A5]">→</span>
          <span
            className={`px-3 py-1 rounded-full border ${
              currentStep !== 'address'
                ? 'bg-[#4A0E17] text-[#DFBA67] border-[#D4AF37]'
                : 'bg-[#FAF6EE] text-[#7A695C] border-[#EAE3D2]'
            }`}
          >
            2. Payment
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Multi-Step Interactive Views (lg:col-span-7) */}
        <div className="lg:col-span-7">
          {currentStep === 'address' && (
            <AddressStep
              initialAddress={shippingDetails}
              onContinue={handleAddressSubmit}
            />
          )}

          {currentStep === 'payment_method' && (
            <PaymentMethodStep
              selectedMethod={paymentMethod}
              onSelectMethod={setPaymentMethod}
              onBack={() => setCurrentStep('address')}
              onContinue={handleProceedToPayment}
            />
          )}

          {currentStep === 'upi_payment' && activeOrder && (
            <UpiPaymentStep
              order={activeOrder}
              onBack={() => setCurrentStep('payment_method')}
              onSuccess={handlePaymentSuccess}
            />
          )}

          {currentStep === 'card_payment' && activeOrder && (
            <CardPaymentStep
              order={activeOrder}
              onBack={() => setCurrentStep('payment_method')}
              onSuccess={handlePaymentSuccess}
            />
          )}
        </div>

        {/* Right Column: Order Summary (lg:col-span-5) */}
        <div className="lg:col-span-5">
          <CheckoutSummary />
        </div>
      </div>
    </div>
  );
};
