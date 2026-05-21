'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';

const COOKIE_NAME = 'fluxteka_consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if consent has already been given
    const consent = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${COOKIE_NAME}=`));
    if (!consent) {
      // Small delay for a less jarring appearance
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const setCookie = (value: 'accepted' | 'refused') => {
    // Set cookie for 1 year
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `${COOKIE_NAME}=${value}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
          id="cookie-banner"
        >
          <div className="container-page">
            <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-white p-5 shadow-xl shadow-black/5">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-primary-50 p-2.5 text-primary-600">
                  <Cookie className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">
                    Fluxteka utilise des cookies
                  </p>
                  <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                    Nous utilisons des cookies pour les publicités et l&apos;analyse du trafic.
                    Vous pouvez accepter ou refuser à tout moment.
                  </p>
                </div>
                <button
                  onClick={() => setCookie('refused')}
                  className="rounded-lg p-1.5 text-text-secondary hover:bg-gray-100 md:hidden"
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setCookie('refused')}
                  className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text-secondary transition-all hover:bg-gray-50 hover:text-text-primary"
                  id="cookie-refuse"
                >
                  Refuser
                </button>
                <button
                  onClick={() => setCookie('accepted')}
                  className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-700 active:scale-[0.98]"
                  id="cookie-accept"
                >
                  Accepter
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
