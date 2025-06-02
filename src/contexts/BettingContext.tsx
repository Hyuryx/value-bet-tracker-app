
import React, { createContext, useContext, useState, useEffect } from 'react';
import { BettingRecord, BankrollManagement, PerformanceMetrics } from '@/types/betting';
import { calculatePerformanceMetrics } from '@/utils/bettingCalculations';

interface BettingContextType {
  records: BettingRecord[];
  bankrollManagement: BankrollManagement;
  performanceMetrics: PerformanceMetrics;
  addRecord: (record: Omit<BettingRecord, 'id'>) => void;
  updateRecord: (id: string, updates: Partial<BettingRecord>) => void;
  updateBankrollManagement: (management: BankrollManagement) => void;
  deleteRecord: (id: string) => void;
}

const BettingContext = createContext<BettingContextType | undefined>(undefined);

export const BettingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<BettingRecord[]>([]);
  const [bankrollManagement, setBankrollManagement] = useState<BankrollManagement>({
    method: 'percentage',
    percentage: 3,
    initialBankroll: 1000,
    currentBankroll: 1000
  });

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    totalBets: 0,
    totalStaked: 0,
    totalReturn: 0,
    netProfit: 0,
    roi: 0,
    winRate: 0,
    averageOdds: 0,
    longestWinStreak: 0,
    longestLossStreak: 0,
    profitByBetType: {},
    profitByLeague: {}
  });

  // Carregar dados do localStorage
  useEffect(() => {
    const savedRecords = localStorage.getItem('betting-records');
    const savedBankroll = localStorage.getItem('bankroll-management');
    
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
    
    if (savedBankroll) {
      setBankrollManagement(JSON.parse(savedBankroll));
    }
  }, []);

  // Salvar dados no localStorage
  useEffect(() => {
    localStorage.setItem('betting-records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('bankroll-management', JSON.stringify(bankrollManagement));
  }, [bankrollManagement]);

  // Atualizar métricas quando os registros mudarem
  useEffect(() => {
    const metrics = calculatePerformanceMetrics(records);
    setPerformanceMetrics(metrics);
    
    // Atualizar bankroll atual baseado nos resultados
    const currentBankroll = records.length > 0 
      ? records[records.length - 1].bankrollAfter 
      : bankrollManagement.initialBankroll;
      
    setBankrollManagement(prev => ({
      ...prev,
      currentBankroll
    }));
  }, [records, bankrollManagement.initialBankroll]);

  const addRecord = (record: Omit<BettingRecord, 'id'>) => {
    const newRecord: BettingRecord = {
      ...record,
      id: crypto.randomUUID()
    };
    setRecords(prev => [...prev, newRecord]);
  };

  const updateRecord = (id: string, updates: Partial<BettingRecord>) => {
    setRecords(prev => prev.map(record => 
      record.id === id ? { ...record, ...updates } : record
    ));
  };

  const updateBankrollManagement = (management: BankrollManagement) => {
    setBankrollManagement(management);
  };

  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(record => record.id !== id));
  };

  return (
    <BettingContext.Provider value={{
      records,
      bankrollManagement,
      performanceMetrics,
      addRecord,
      updateRecord,
      updateBankrollManagement,
      deleteRecord
    }}>
      {children}
    </BettingContext.Provider>
  );
};

export const useBetting = () => {
  const context = useContext(BettingContext);
  if (context === undefined) {
    throw new Error('useBetting must be used within a BettingProvider');
  }
  return context;
};
