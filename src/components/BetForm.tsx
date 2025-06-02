import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useBetting } from '@/contexts/BettingContext';
import { 
  calculateExpectedValue, 
  calculateKellyStake, 
  calculateSuggestedStake,
  calculatePotentialReturn,
  calculateNetProfit
} from '@/utils/bettingCalculations';
import { Calculator, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export const BetForm: React.FC = () => {
  const { addRecord, bankrollManagement } = useBetting();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    event: '',
    homeTeam: '',
    awayTeam: '',
    league: '',
    betType: '',
    odds: '',
    stakeAmount: '',
    estimatedProbability: '',
    result: 'pending' as const
  });

  const [calculatedValues, setCalculatedValues] = useState({
    suggestedStake: 0,
    expectedValue: 0,
    potentialReturn: 0,
    kellyPercentage: 0,
    isValueBet: false
  });

  // Carregar dados do localStorage quando o componente for montado
  useEffect(() => {
    const savedFormData = localStorage.getItem('bet-form-data');
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
      }
    }
  }, []);

  // Salvar dados no localStorage sempre que formData mudar
  useEffect(() => {
    localStorage.setItem('bet-form-data', JSON.stringify(formData));
  }, [formData]);

  // Recalcular valores quando os campos relevantes mudarem
  useEffect(() => {
    const odds = parseFloat(formData.odds) || 0;
    const estimatedProb = parseFloat(formData.estimatedProbability) || 0;
    const stake = parseFloat(formData.stakeAmount) || 0;

    if (odds > 0 && estimatedProb > 0) {
      const expectedValue = calculateExpectedValue(odds, estimatedProb, stake);
      const potentialReturn = calculatePotentialReturn(stake, odds);
      
      const kellyCalc = calculateKellyStake(odds, estimatedProb, bankrollManagement.currentBankroll);
      
      const suggestedStake = calculateSuggestedStake(
        bankrollManagement.method,
        bankrollManagement.currentBankroll,
        bankrollManagement.fixedAmount,
        bankrollManagement.percentage,
        odds,
        estimatedProb
      );

      setCalculatedValues({
        suggestedStake,
        expectedValue,
        potentialReturn,
        kellyPercentage: kellyCalc.kellyPercentage,
        isValueBet: kellyCalc.isValueBet
      });
    }
  }, [formData.odds, formData.estimatedProbability, formData.stakeAmount, bankrollManagement]);

  // Atualizar o evento automaticamente quando os times mudarem
  useEffect(() => {
    if (formData.homeTeam && formData.awayTeam) {
      setFormData(prev => ({
        ...prev,
        event: `${formData.homeTeam} vs ${formData.awayTeam}`
      }));
    }
  }, [formData.homeTeam, formData.awayTeam]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUseSuggestedStake = () => {
    setFormData(prev => ({ 
      ...prev, 
      stakeAmount: calculatedValues.suggestedStake.toFixed(2) 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const odds = parseFloat(formData.odds);
    const stake = parseFloat(formData.stakeAmount);
    const estimatedProb = parseFloat(formData.estimatedProbability);
    
    // Validação mais específica
    if (!formData.homeTeam.trim()) {
      toast.error('Por favor, preencha o nome do time da casa.');
      return;
    }
    
    if (!formData.awayTeam.trim()) {
      toast.error('Por favor, preencha o nome do time visitante.');
      return;
    }
    
    if (!formData.league.trim()) {
      toast.error('Por favor, preencha a liga/competição.');
      return;
    }
    
    if (!formData.betType) {
      toast.error('Por favor, selecione o tipo de aposta.');
      return;
    }
    
    if (isNaN(odds) || odds <= 1) {
      toast.error('Por favor, insira uma odd válida (maior que 1.00).');
      return;
    }
    
    if (isNaN(stake) || stake <= 0) {
      toast.error('Por favor, insira um valor de aposta válido (maior que 0).');
      return;
    }
    
    if (isNaN(estimatedProb) || estimatedProb <= 0 || estimatedProb >= 100) {
      toast.error('Por favor, insira uma probabilidade estimada válida (entre 1% e 99%).');
      return;
    }

    const potentialReturn = calculatePotentialReturn(stake, odds);
    const netProfit = calculateNetProfit(formData.result, stake, odds);
    const newBankroll = bankrollManagement.currentBankroll + netProfit;
    const percentageOfBankroll = (stake / bankrollManagement.currentBankroll) * 100;

    const newRecord = {
      date: formData.date,
      event: formData.event,
      homeTeam: formData.homeTeam,
      awayTeam: formData.awayTeam,
      league: formData.league,
      betType: formData.betType,
      odds,
      stakeAmount: stake,
      estimatedProbability: estimatedProb,
      expectedValue: calculatedValues.expectedValue,
      potentialReturn,
      result: formData.result,
      netProfit,
      bankrollAfter: newBankroll,
      percentageOfBankroll
    };

    addRecord(newRecord);
    
    // Limpar dados do formulário e localStorage após registrar a aposta
    const resetFormData = {
      date: new Date().toISOString().split('T')[0],
      event: '',
      homeTeam: '',
      awayTeam: '',
      league: '',
      betType: '',
      odds: '',
      stakeAmount: '',
      estimatedProbability: '',
      result: 'pending' as const
    };
    
    setFormData(resetFormData);
    localStorage.removeItem('bet-form-data');

    toast.success('Aposta registrada com sucesso!');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Registrar Nova Aposta
            </CardTitle>
            <CardDescription>
              Preencha os dados da aposta para cálculos automáticos de gestão de banca
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Data da Aposta *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="league">Liga/Competição *</Label>
                  <Input
                    id="league"
                    placeholder="Ex: Brasileirão Série A"
                    value={formData.league}
                    onChange={(e) => handleInputChange('league', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="homeTeam">Time da Casa *</Label>
                  <Input
                    id="homeTeam"
                    placeholder="Ex: Palmeiras"
                    value={formData.homeTeam}
                    onChange={(e) => handleInputChange('homeTeam', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="awayTeam">Time Visitante *</Label>
                  <Input
                    id="awayTeam"
                    placeholder="Ex: Botafogo"
                    value={formData.awayTeam}
                    onChange={(e) => handleInputChange('awayTeam', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="event">Descrição do Evento</Label>
                <Input
                  id="event"
                  placeholder="Será preenchido automaticamente"
                  value={formData.event}
                  readOnly
                  className="mt-1 bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="betType">Tipo de Aposta *</Label>
                  <Select value={formData.betType} onValueChange={(value) => handleInputChange('betType', value)} required>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione o mercado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1x2">Resultado Final (1X2)</SelectItem>
                      <SelectItem value="over-under">Mais/Menos Gols</SelectItem>
                      <SelectItem value="handicap">Handicap Asiático</SelectItem>
                      <SelectItem value="both-teams-score">Ambas Marcam</SelectItem>
                      <SelectItem value="double-chance">Dupla Chance</SelectItem>
                      <SelectItem value="correct-score">Placar Exato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="result">Resultado</Label>
                  <Select value={formData.result} onValueChange={(value) => handleInputChange('result', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="win">Vitória</SelectItem>
                      <SelectItem value="loss">Derrota</SelectItem>
                      <SelectItem value="void">Anulada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="odds">Odds *</Label>
                  <Input
                    id="odds"
                    type="number"
                    step="0.01"
                    min="1.01"
                    placeholder="Ex: 2.10"
                    value={formData.odds}
                    onChange={(e) => handleInputChange('odds', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="estimatedProbability">Probabilidade Estimada (%) *</Label>
                  <Input
                    id="estimatedProbability"
                    type="number"
                    min="1"
                    max="99"
                    placeholder="Ex: 55"
                    value={formData.estimatedProbability}
                    onChange={(e) => handleInputChange('estimatedProbability', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="stakeAmount">Valor da Aposta (R$) *</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="stakeAmount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={formData.stakeAmount}
                      onChange={(e) => handleInputChange('stakeAmount', e.target.value)}
                      required
                    />
                    {calculatedValues.suggestedStake > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleUseSuggestedStake}
                        className="whitespace-nowrap"
                      >
                        Usar Sugerido
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                Registrar Aposta
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Cálculos Automáticos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Stake Sugerido:</span>
                <span className="font-bold text-blue-700">
                  {formatCurrency(calculatedValues.suggestedStake)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Retorno Potencial:</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(calculatedValues.potentialReturn)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Valor Esperado (EV):</span>
                <span className={`font-bold ${
                  calculatedValues.expectedValue >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(calculatedValues.expectedValue)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Kelly %:</span>
                <span className="font-bold text-purple-600">
                  {calculatedValues.kellyPercentage.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-blue-200">
              {calculatedValues.isValueBet ? (
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Aposta de Valor
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800 border-red-300">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Sem Vantagem
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800 text-sm">Método Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Gestão:</span>
                <span className="font-medium capitalize">
                  {bankrollManagement.method === 'fixed' ? 'Valor Fixo' :
                   bankrollManagement.method === 'percentage' ? 'Percentual' : 'Kelly'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Banca Atual:</span>
                <span className="font-medium">
                  {formatCurrency(bankrollManagement.currentBankroll)}
                </span>
              </div>
              {bankrollManagement.method === 'percentage' && (
                <div className="flex justify-between">
                  <span>Percentual:</span>
                  <span className="font-medium">{bankrollManagement.percentage}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
