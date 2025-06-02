
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useBetting } from '@/contexts/BettingContext';
import { TrendingUp, Target, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

export const PerformanceCharts: React.FC = () => {
  const { records, performanceMetrics } = useBetting();

  // Dados para gráfico de evolução da banca
  const bankrollEvolution = records.reduce((acc: any[], record, index) => {
    acc.push({
      bet: index + 1,
      bankroll: record.bankrollAfter,
      date: new Date(record.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })
    });
    return acc;
  }, []);

  // Dados para gráfico de lucro por tipo de aposta
  const profitByBetType = Object.entries(performanceMetrics.profitByBetType).map(([type, profit]) => ({
    type: type,
    profit: profit
  }));

  // Dados para gráfico de lucro por liga
  const profitByLeague = Object.entries(performanceMetrics.profitByLeague)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([league, profit]) => ({
      league: league.length > 15 ? league.substring(0, 15) + '...' : league,
      profit: profit
    }));

  // Dados para gráfico de pizza (distribuição de resultados)
  const resultDistribution = [
    { name: 'Vitórias', value: records.filter(r => r.result === 'win').length, color: '#10b981' },
    { name: 'Derrotas', value: records.filter(r => r.result === 'loss').length, color: '#ef4444' },
    { name: 'Anuladas', value: records.filter(r => r.result === 'void').length, color: '#6b7280' },
    { name: 'Pendentes', value: records.filter(r => r.result === 'pending').length, color: '#f59e0b' }
  ].filter(item => item.value > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Cards de métricas secundárias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Sequência de Vitórias</p>
                <p className="text-2xl font-bold text-blue-800">
                  {performanceMetrics.longestWinStreak}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Odds Média</p>
                <p className="text-2xl font-bold text-green-800">
                  {performanceMetrics.averageOdds.toFixed(2)}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">EV Médio</p>
                <p className="text-2xl font-bold text-purple-800">
                  {records.length > 0 ? 
                    formatCurrency(records.reduce((sum, r) => sum + r.expectedValue, 0) / records.length) : 
                    formatCurrency(0)
                  }
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Stake Médio</p>
                <p className="text-2xl font-bold text-orange-800">
                  {records.length > 0 ? 
                    formatCurrency(records.reduce((sum, r) => sum + r.stakeAmount, 0) / records.length) : 
                    formatCurrency(0)
                  }
                </p>
              </div>
              <PieChartIcon className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução da Banca */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Evolução da Banca</CardTitle>
            <CardDescription>
              Acompanhe o crescimento ou diminuição da sua banca ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bankrollEvolution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bankrollEvolution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={formatCurrency}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Banca']}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bankroll" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                Nenhum dado disponível ainda
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribuição de Resultados */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Distribuição de Resultados</CardTitle>
            <CardDescription>
              Visualize a proporção de vitórias, derrotas e outros resultados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resultDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={resultDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {resultDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                Nenhum dado disponível ainda
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lucro por Tipo de Aposta */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Lucro por Tipo de Aposta</CardTitle>
            <CardDescription>
              Identifique quais tipos de aposta são mais lucrativos para você
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profitByBetType.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={profitByBetType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="type" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={formatCurrency}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Lucro']}
                  />
                  <Bar 
                    dataKey="profit" 
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                Nenhum dado disponível ainda
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lucro por Liga */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Lucro por Liga (Top 10)</CardTitle>
            <CardDescription>
              Descubra em quais ligas você tem melhor performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profitByLeague.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={profitByLeague} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    type="number"
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={formatCurrency}
                  />
                  <YAxis 
                    type="category"
                    dataKey="league" 
                    stroke="#6b7280"
                    fontSize={12}
                    width={120}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Lucro']}
                  />
                  <Bar 
                    dataKey="profit" 
                    fill="#8b5cf6"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                Nenhum dado disponível ainda
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
