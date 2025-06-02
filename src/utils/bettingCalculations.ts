
import { BettingRecord, KellyCalculation, PerformanceMetrics } from '@/types/betting';

export const calculateExpectedValue = (odds: number, estimatedProbability: number, stake: number): number => {
  // EV = (Probabilidade de vitória × Odds × Stake) - Stake
  const probability = estimatedProbability / 100;
  return (probability * odds * stake) - stake;
};

export const calculateKellyStake = (
  odds: number, 
  estimatedProbability: number, 
  currentBankroll: number
): KellyCalculation => {
  const p = estimatedProbability / 100; // Probabilidade de vitória
  const q = 1 - p; // Probabilidade de derrota
  const b = odds - 1; // Odds menos 1 (lucro por unidade)
  
  // Fórmula de Kelly: f = (bp - q) / b
  const kellyFraction = (b * p - q) / b;
  
  // Kelly sugere apostar apenas se há vantagem (kelly > 0)
  const isValueBet = kellyFraction > 0;
  const kellyPercentage = Math.max(0, kellyFraction * 100);
  const recommendedStake = isValueBet ? currentBankroll * kellyFraction : 0;
  
  return {
    recommendedStake: Math.max(0, recommendedStake),
    kellyPercentage,
    isValueBet
  };
};

export const calculateSuggestedStake = (
  method: 'fixed' | 'percentage' | 'kelly',
  currentBankroll: number,
  fixedAmount?: number,
  percentage?: number,
  odds?: number,
  estimatedProbability?: number
): number => {
  switch (method) {
    case 'fixed':
      return fixedAmount || 0;
    
    case 'percentage':
      return currentBankroll * ((percentage || 0) / 100);
    
    case 'kelly':
      if (odds && estimatedProbability) {
        const kelly = calculateKellyStake(odds, estimatedProbability, currentBankroll);
        return kelly.recommendedStake;
      }
      return 0;
    
    default:
      return 0;
  }
};

export const calculatePotentialReturn = (stake: number, odds: number): number => {
  return stake * odds;
};

export const calculateNetProfit = (result: string, stake: number, odds: number): number => {
  switch (result) {
    case 'win':
      return (stake * odds) - stake;
    case 'loss':
      return -stake;
    case 'void':
      return 0;
    default:
      return 0;
  }
};

export const calculatePerformanceMetrics = (records: BettingRecord[]): PerformanceMetrics => {
  const settledBets = records.filter(bet => bet.result !== 'pending');
  
  if (settledBets.length === 0) {
    return {
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
    };
  }

  const totalStaked = settledBets.reduce((sum, bet) => sum + bet.stakeAmount, 0);
  const netProfit = settledBets.reduce((sum, bet) => sum + bet.netProfit, 0);
  const totalReturn = totalStaked + netProfit;
  const winningBets = settledBets.filter(bet => bet.result === 'win');
  const roi = totalStaked > 0 ? (netProfit / totalStaked) * 100 : 0;
  const winRate = (winningBets.length / settledBets.length) * 100;
  const averageOdds = settledBets.reduce((sum, bet) => sum + bet.odds, 0) / settledBets.length;

  // Calcular sequências de vitórias e derrotas
  let currentWinStreak = 0;
  let currentLossStreak = 0;
  let longestWinStreak = 0;
  let longestLossStreak = 0;

  settledBets.forEach(bet => {
    if (bet.result === 'win') {
      currentWinStreak++;
      currentLossStreak = 0;
      longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
    } else if (bet.result === 'loss') {
      currentLossStreak++;
      currentWinStreak = 0;
      longestLossStreak = Math.max(longestLossStreak, currentLossStreak);
    }
  });

  // Lucro por tipo de aposta
  const profitByBetType: Record<string, number> = {};
  settledBets.forEach(bet => {
    profitByBetType[bet.betType] = (profitByBetType[bet.betType] || 0) + bet.netProfit;
  });

  // Lucro por liga
  const profitByLeague: Record<string, number> = {};
  settledBets.forEach(bet => {
    profitByLeague[bet.league] = (profitByLeague[bet.league] || 0) + bet.netProfit;
  });

  return {
    totalBets: settledBets.length,
    totalStaked,
    totalReturn,
    netProfit,
    roi,
    winRate,
    averageOdds,
    longestWinStreak,
    longestLossStreak,
    profitByBetType,
    profitByLeague
  };
};
