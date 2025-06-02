
export interface BettingRecord {
  id: string;
  date: string;
  event: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  betType: string;
  odds: number;
  stakeAmount: number;
  estimatedProbability: number; // Probabilidade estimada pelo usuário (%)
  expectedValue: number; // Valor Esperado (EV)
  potentialReturn: number;
  result: 'win' | 'loss' | 'void' | 'pending';
  netProfit: number;
  bankrollAfter: number;
  percentageOfBankroll: number;
}

export interface BankrollManagement {
  method: 'fixed' | 'percentage' | 'kelly';
  fixedAmount?: number;
  percentage?: number;
  initialBankroll: number;
  currentBankroll: number;
}

export interface PerformanceMetrics {
  totalBets: number;
  totalStaked: number;
  totalReturn: number;
  netProfit: number;
  roi: number;
  winRate: number;
  averageOdds: number;
  longestWinStreak: number;
  longestLossStreak: number;
  profitByBetType: Record<string, number>;
  profitByLeague: Record<string, number>;
}

export interface KellyCalculation {
  recommendedStake: number;
  kellyPercentage: number;
  isValueBet: boolean;
}
