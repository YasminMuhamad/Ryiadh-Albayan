import React, { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';

let paypalScriptPromise = null;

const loadPayPalSdk = (clientId) => {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'));
  if (window.paypal) return Promise.resolve();

  if (!paypalScriptPromise) {
    const cid = clientId || 'sb'; // sandbox default
    const isSandbox = cid === 'sb' || cid.toLowerCase().includes('sandbox');
    const base = isSandbox ? 'https://www.sandbox.paypal.com/sdk/js' : 'https://www.paypal.com/sdk/js';
    const src = `${base}?client-id=${cid}&currency=USD&intent=capture&components=buttons`;
    paypalScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.type = 'text/javascript';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (err) => reject(err);
      document.body.appendChild(script);
    });
  }
  return paypalScriptPromise;
};

export default function PayPalButton({ amount, onSuccess, onError, clientId }) {
  const paypalRef = useRef();
  const buttonsInstanceRef = useRef(null);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const [sdkReady, setSdkReady] = useState(!!window.paypal);
  const formattedAmount = (() => {
    const parsed =
      typeof amount === 'number'
        ? amount
        : typeof amount === 'string'
          ? Number(amount)
          : NaN;
    if (Number.isFinite(parsed) && parsed > 0) return parsed.toFixed(2);
    return '1.00';
  })();

  // Keep latest callbacks without re-rendering the PayPal Buttons
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    let cancelled = false;
    const style = document.createElement('style');
    style.textContent = `
      .paypal-button-container {
        max-width: 100%;
      }
    `;
    document.head.appendChild(style);

    loadPayPalSdk(clientId || import.meta.env.VITE_PAYPAL_CLIENT_ID)
      .then(() => {
        if (cancelled) return;
        setSdkReady(true);
      })
      .catch((err) => {
        console.error('Failed to load PayPal SDK', err);
        Swal.fire({
          icon: 'error',
          title: 'Payment error',
          text: 'Unable to load PayPal. Please refresh and try again.',
          confirmButtonColor: '#0d9488',
        });
        onErrorRef.current?.(err);
      });

    return () => {
      cancelled = true;
      document.head.removeChild(style);
    };
  }, [clientId]);

  useEffect(() => {
    if (!sdkReady || !window.paypal || !paypalRef.current) return;
    // Clean any previous buttons before rendering a new instance
    if (buttonsInstanceRef.current) {
      buttonsInstanceRef.current.close();
      buttonsInstanceRef.current = null;
    }
    paypalRef.current.innerHTML = '';

    const buttons = window.paypal.Buttons({
      createOrder: async (_, actions) => {
        try {
          return await actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: formattedAmount,
                  currency_code: 'USD',
                },
              },
            ],
            application_context: {
              shipping_preference: 'NO_SHIPPING',
              user_action: 'PAY_NOW',
            },
          });
        } catch (err) {
          console.error('PayPal createOrder error:', err);
          Swal.fire({
            icon: 'error',
            title: 'Payment error',
            text: 'Unable to start the payment. Please refresh and try again.',
            confirmButtonColor: '#0d9488',
          });
          onErrorRef.current?.(err);
          throw err;
        }
      },
      onApprove: async (_, actions) => {
        try {
          const details = await actions.order.capture();
          console.log('Payment completed successfully:', details);
          onSuccessRef.current?.(details);
        } catch (err) {
          console.error('PayPal capture error full:', err);
          console.log('JSON:', JSON.stringify(err, null, 2));
  
          Swal.fire({
            icon: 'error',
            title: 'Payment failed',
            text: 'Unable to capture the payment. Please try again or use a different method.',
            confirmButtonColor: '#0d9488',
          });
          onErrorRef.current?.(err);
        }
      },
      onError: (err) => {
        console.error('PayPal error:', err);
        Swal.fire({
          icon: 'error',
          title: 'Payment error',
          text: 'Unable to process your payment at the moment. Please try again.',
          confirmButtonColor: '#0d9488',
        });
        onErrorRef.current?.(err);
      },
      onCancel: (data) => {
        console.warn('Payment cancelled by user:', data);
        Swal.fire({
          icon: 'info',
          title: 'Payment canceled',
          text: 'The payment process was canceled. You can try again whenever you are ready.',
          confirmButtonColor: '#0d9488',
        });
        onErrorRef.current?.({
          id: `paypal-cancel-${Date.now()}`,
          status: 'CANCELED',
          data,
        });
      },
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'paypal',
      },
    });

      buttonsInstanceRef.current = buttons;
      buttons.render(paypalRef.current);

      return () => {
        buttonsInstanceRef.current?.close();
        buttonsInstanceRef.current = null;
        if (paypalRef.current) {
          paypalRef.current.innerHTML = '';
        }
      };
    }, [formattedAmount, sdkReady]);

  return (
    <div className="paypal-button-container w-full">
      <div ref={paypalRef} className="w-full"></div>
    </div>
  );
}

