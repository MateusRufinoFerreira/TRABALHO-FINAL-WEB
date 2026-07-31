import { DashboardModel } from '@/models/dashboardModel';
import { ERRO, falha, sucesso } from '@/lib/resultado';

// CAMADA DE REGRAS DE NEGOCIO

export const DashboardController = {
  async obterVisaoGeral(professorId) {
    try {
      return sucesso(await DashboardModel.obterEstatisticas(professorId));
    } catch (erro) {
      console.error('[obterVisaoGeral]', erro);
      return falha(ERRO.INTERNO, 'Erro ao carregar as estatisticas.');
    }
  },
};
