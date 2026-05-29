'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function OnboardingQuiz() {
  const t = useTranslations('onboarding');
  const router = useRouter();
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  const profiles = [
    {
      id: 'beginner',
      emoji: '🌱',
      title: t('beginner.title'),
      description: t('beginner.description'),
      query: '/recherche?tool=zapier&tri=score',
      tip: t('beginner.tip'),
      platform: 'zapier',
    },
    {
      id: 'business',
      emoji: '🏢',
      title: t('business.title'),
      description: t('business.description'),
      query: '/recherche?tool=make&tri=score',
      tip: t('business.tip'),
      platform: 'make',
    },
    {
      id: 'developer',
      emoji: '💻',
      title: t('developer.title'),
      description: t('developer.description'),
      query: '/recherche?tool=n8n&tri=score',
      tip: t('developer.tip'),
      platform: 'n8n',
    },
    {
      id: 'ai',
      emoji: '🤖',
      title: t('ai.title'),
      description: t('ai.description'),
      query: '/recherche?categorie=ai-agents&tri=score',
      tip: t('ai.tip'),
      platform: 'langchain',
    },
  ];

  const activeProfile = profiles.find((p) => p.id === selectedProfile);

  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
        {profiles.map((profile, i) => (
          <motion.button
            key={profile.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            onClick={() => {
              setSelectedProfile(profile.id);
            }}
            className={`group flex flex-col items-center gap-2 rounded-2xl border-2 p-5 text-center transition-all duration-200 hover:shadow-md ${
              selectedProfile === profile.id
                ? 'border-primary-500 bg-primary-50 shadow-md'
                : 'border-border bg-white hover:border-primary-300'
            }`}
          >
            <span className="text-3xl">{profile.emoji}</span>
            <span className="font-heading font-semibold text-text-primary text-sm">{profile.title}</span>
            <span className="text-xs text-text-secondary leading-tight">{profile.description}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeProfile && (
          <motion.div
            key={activeProfile.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 rounded-2xl border border-primary-200 bg-primary-50 p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-primary-900 text-sm">{activeProfile.tip}</p>
              </div>
            </div>
            <button
              onClick={() => router.push(activeProfile.query)}
              className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-700 active:scale-[0.98]"
            >
              {t('viewWorkflows')}
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
