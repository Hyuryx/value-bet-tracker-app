
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBetting } from '@/contexts/BettingContext';
import { Settings, AlertTriangle, Info, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export const BankrollSettings: React.FC = () => {
  const { bankrollManagement, updateBankrollManagement } = useBetting();
  
  const [settings, setSettings] = useState(bankrollManagement);

  const handleMethodChange = (method: 'fixed' | 'percentage' | 'kelly') => {
    setSettings(prev => ({ ...prev, method }));
  };

  const handleSave = () => {
    if (settings.method === 'fixed' && (!settings.fixedAmount || settings.fixedAmount <= 0)) {
      toast.error('Por favor, defina um valor fixo válido.');
      return;
    }
    
    if (settings.method === 'percentage' && (!settings.percentage || settings.percentage <= 0 || settings.percentage > 100)) {
      toast.error('Por favor, defina um percentual entre 1% e 100%.');
      return;
    }

    updateBankrollManagement(settings);
    toast.success('Configurações salvas com sucesso!');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações de Gestão de Banca
          </CardTitle>
          <CardDescription>
            Configure seu método de gestão de banca e parâmetros de risco
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium">Banca Inicial</Label>
            <div className="flex items-center gap-2 mt-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <Input
                type="number"
                step="0.01"
                min="0"
                value={settings.initialBankroll}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  initialBankroll: parseFloat(e.target.value) || 0 
                }))}
                className="flex-1"
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Banca atual: {formatCurrency(settings.currentBankroll)}
            </p>
          </div>

          <div>
            <Label className="text-base font-medium mb-4 block">Método de Gestão</Label>
            <RadioGroup 
              value={settings.method} 
              onValueChange={handleMethodChange}
              className="space-y-4"
            >
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="fixed" id="fixed" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="fixed" className="font-medium cursor-pointer">
                    Valor Fixo
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Aposta sempre o mesmo valor monetário, independente da banca
                  </p>
                  {settings.method === 'fixed' && (
                    <div className="mt-3">
                      <Label htmlFor="fixedAmount" className="text-sm">Valor por aposta (R$)</Label>
                      <Input
                        id="fixedAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={settings.fixedAmount || ''}
                        onChange={(e) => setSettings(prev => ({ 
                          ...prev, 
                          fixedAmount: parseFloat(e.target.value) || 0 
                        }))}
                        className="mt-1"
                        placeholder="Ex: 50.00"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="percentage" id="percentage" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="percentage" className="font-medium cursor-pointer">
                    Percentual da Banca (Recomendado)
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Aposta uma porcentagem fixa da banca atual (3-5% recomendado)
                  </p>
                  {settings.method === 'percentage' && (
                    <div className="mt-3">
                      <Label htmlFor="percentageValue" className="text-sm">Percentual (%)</Label>
                      <Input
                        id="percentageValue"
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="100"
                        value={settings.percentage || ''}
                        onChange={(e) => setSettings(prev => ({ 
                          ...prev, 
                          percentage: parseFloat(e.target.value) || 0 
                        }))}
                        className="mt-1"
                        placeholder="Ex: 3.0"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="kelly" id="kelly" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="kelly" className="font-medium cursor-pointer">
                    Critério de Kelly (Avançado)
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Calcula automaticamente o valor ideal baseado nas odds e probabilidade estimada
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700">
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Info className="h-5 w-5" />
              Guia dos Métodos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Valor Fixo</h4>
              <p className="text-blue-700">
                Simples e direto. Ideal para iniciantes. Porém, não se adapta às mudanças na banca, 
                podendo ser arriscado quando a banca diminui.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Percentual da Banca</h4>
              <p className="text-blue-700">
                Método mais equilibrado e recomendado. Adapta-se automaticamente: quando a banca 
                cresce, aposta mais; quando diminui, aposta menos, protegendo o capital.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Critério de Kelly</h4>
              <p className="text-blue-700">
                Método matemático avançado que maximiza o crescimento a longo prazo. Requer 
                estimativas precisas de probabilidade e disciplina para seguir as recomendações.
              </p>
            </div>
          </CardContent>
        </Card>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> Evite métodos como Martingale ou Fibonacci, que dobram 
            apostas após perdas. Estes podem rapidamente esgotar sua banca em sequências negativas.
          </AlertDescription>
        </Alert>

        {settings.method === 'percentage' && settings.percentage && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-green-700 mb-2">Próxima aposta sugerida:</p>
                <p className="text-2xl font-bold text-green-800">
                  {formatCurrency((settings.currentBankroll * (settings.percentage / 100)))}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {settings.percentage}% de {formatCurrency(settings.currentBankroll)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
