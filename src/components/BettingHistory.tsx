
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useBetting } from '@/contexts/BettingContext';
import { History, Search, Filter, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

export const BettingHistory: React.FC = () => {
  const { records, updateRecord, deleteRecord } = useBetting();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState('all');
  const [filterLeague, setFilterLeague] = useState('all');

  const filteredRecords = records.filter(record => {
    const matchesSearch = searchTerm === '' || 
      record.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.league.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesResult = filterResult === 'all' || record.result === filterResult;
    const matchesLeague = filterLeague === 'all' || record.league === filterLeague;
    
    return matchesSearch && matchesResult && matchesLeague;
  });

  const uniqueLeagues = Array.from(new Set(records.map(record => record.league)));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'win':
        return <Badge className="bg-green-100 text-green-800">Vitória</Badge>;
      case 'loss':
        return <Badge className="bg-red-100 text-red-800">Derrota</Badge>;
      case 'void':
        return <Badge className="bg-gray-100 text-gray-800">Anulada</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      default:
        return <Badge>{result}</Badge>;
    }
  };

  const handleResultUpdate = (id: string, newResult: string) => {
    const record = records.find(r => r.id === id);
    if (!record) return;

    const netProfit = newResult === 'win' ? (record.stakeAmount * record.odds) - record.stakeAmount :
                     newResult === 'loss' ? -record.stakeAmount : 0;
    
    updateRecord(id, { 
      result: newResult as any, 
      netProfit 
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Apostas
          </CardTitle>
          <CardDescription>
            Acompanhe todas as suas apostas e atualize os resultados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por time ou evento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterResult} onValueChange={setFilterResult}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por resultado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os resultados</SelectItem>
                <SelectItem value="win">Vitórias</SelectItem>
                <SelectItem value="loss">Derrotas</SelectItem>
                <SelectItem value="void">Anuladas</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterLeague} onValueChange={setFilterLeague}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por liga" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ligas</SelectItem>
                {uniqueLeagues.map(league => (
                  <SelectItem key={league} value={league}>{league}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {filteredRecords.length} de {records.length} apostas
              </span>
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Data
                  </TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Liga</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Odds</TableHead>
                  <TableHead>Stake</TableHead>
                  <TableHead>EV</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Lucro/Perda</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {formatDate(record.date)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.homeTeam} vs {record.awayTeam}</div>
                        <div className="text-sm text-gray-500">{record.event}</div>
                      </div>
                    </TableCell>
                    <TableCell>{record.league}</TableCell>
                    <TableCell>{record.betType}</TableCell>
                    <TableCell>{record.odds.toFixed(2)}</TableCell>
                    <TableCell>{formatCurrency(record.stakeAmount)}</TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        record.expectedValue >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(record.expectedValue)}
                      </span>
                    </TableCell>
                    <TableCell>{getResultBadge(record.result)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {record.netProfit >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`font-medium ${
                          record.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(record.netProfit)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.result === 'pending' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => handleResultUpdate(record.id, 'win')}
                          >
                            Ganhou
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleResultUpdate(record.id, 'loss')}
                          >
                            Perdeu
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma aposta encontrada com os filtros aplicados.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
