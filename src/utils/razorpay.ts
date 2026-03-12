// Razorpay utility functions

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    console.log('🔍 Checking Razorpay availability...');
    
    // Check if Razorpay is already loaded
    if (window.Razorpay && typeof window.Razorpay === 'function') {
      console.log('✅ Razorpay already loaded');
      resolve(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="razorpay"]');
    if (existingScript) {
      console.log('⏳ Razorpay script already loading, waiting...');
      // Wait for existing script to load
      const checkLoaded = () => {
        if (window.Razorpay && typeof window.Razorpay === 'function') {
          console.log('✅ Razorpay loaded from existing script');
          resolve(true);
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      
      existingScript.addEventListener('load', () => {
        console.log('📦 Razorpay script loaded event fired');
        checkLoaded();
      });
      
      existingScript.addEventListener('error', () => {
        console.error('❌ Razorpay script failed to load');
        resolve(false);
      });
      
      // Start checking
      checkLoaded();
      return;
    }

    // Create and load new script
    console.log('📥 Loading new Razorpay script...');
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/razorpay.js';
    script.async = true;
    
    script.onload = () => {
      console.log('📦 Razorpay script load event fired');
      // Give it a moment to initialize
      setTimeout(() => {
        if (window.Razorpay && typeof window.Razorpay === 'function') {
          console.log('✅ Razorpay loaded successfully');
          resolve(true);
        } else {
          console.error('❌ Razorpay script loaded but window.Razorpay not available');
          resolve(false);
        }
      }, 500);
    };
    
    script.onerror = () => {
      console.error('❌ Razorpay script failed to load');
      resolve(false);
    };
    
    document.head.appendChild(script);
  });
}

export function isRazorpayLoaded(): boolean {
  const loaded = typeof window.Razorpay !== 'undefined' && 
                  window.Razorpay !== null && 
                  typeof window.Razorpay === 'function';
  console.log('🔍 Razorpay availability check:', loaded);
  return loaded;
}

export function createRazorpayInstance(options: any): any {
  console.log('🏗️ Creating Razorpay instance...');
  
  if (!isRazorpayLoaded()) {
    console.error('❌ Razorpay not loaded when trying to create instance');
    throw new Error('Razorpay is not loaded');
  }
  
  try {
    console.log('🔧 Razorpay constructor available, creating instance...');
    const instance = new window.Razorpay(options);
    console.log('✅ Razorpay instance created successfully');
    return instance;
  } catch (error) {
    console.error('❌ Error creating Razorpay instance:', error);
    throw new Error('Failed to create Razorpay instance: ' + error.message);
  }
}
