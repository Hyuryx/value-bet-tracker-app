
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBetting } from '@/contexts/BettingContext';
import { BankrollSettings } from './BankrollSettings';
import { BetForm } from './BetForm';
import { BettingHistory } from './BettingHistory';
import { PerformanceCharts } from './PerformanceCharts';
import { TrendingUp, TrendingDown, Target, Percent } from 'lucide-react';

export const BettingDashboard: React.FC = () => {
  const { performanceMetrics, bankrollManagement } = useBetting();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sistema de Gestão de Apostas Esportivas
          </h1>
          <p className="text-lg text-gray-600">
            Gestão inteligente de banca com cálculos automatizados e análise de desempenho
          </p>
        </div>

        {/* Cards de métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Banca Atual</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(bankrollManagement.currentBankroll)}
              </div>
              <p className="text-xs text-muted-foreground">
                Inicial: {formatCurrency(bankrollManagement.initialBankroll)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
              {performanceMetrics.netProfit >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                performanceMetrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(performanceMetrics.netProfit)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total apostado: {formatCurrency(performanceMetrics.totalStaked)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ROI</CardTitle>
              <Percent className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                performanceMetrics.roi >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatPercentage(performanceMetrics.roi)}
              </div>
              <p className="text-xs text-muted-foreground">
                {performanceMetrics.totalBets} apostas realizadas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Acerto</CardTitle>
              <Target className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatPercentage(performanceMetrics.winRate)}
              </div>
              <p className="text-xs text-muted-foreground">
                Odds média: {performanceMetrics.averageOdds.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principais */}
        <Tabs defaultValue="bet-form" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="bet-form" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Nova Aposta
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Histórico
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Análises
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bet-form" className="space-y-4">
            <BetForm />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <BettingHistory />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <PerformanceCharts />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <BankrollSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
