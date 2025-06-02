
import React from 'react';
import { BettingProvider } from '@/contexts/BettingContext';
import { BettingDashboard } from '@/components/BettingDashboard';

const Index = () => {
  return (
    <BettingProvider>
      <BettingDashboard />
    </BettingProvider>
  );
};

export default Index;
