'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ErroDeApi } from '@/lib/api';

// Concentra o tratamento de erro que estava repetido em oito telas.
//
// A distincao que importa: 401 significa sessao invalida, e a acao correta e
// mandar para o login — nao exibir a mensagem numa tela que o usuario nao pode
// mais usar. Qualquer outro erro e informacao util e vai para a interface.
export function useErroDeApi() {
  const router = useRouter();
  const [erro, setErro] = useState(null);

  const tratarErro = useCallback(
    (e) => {
      if (e instanceof ErroDeApi && e.status === 401) {
        // O helper api() ja encerrou a sessao nos dois canais.
        router.replace('/login');
        return;
      }

      setErro(e.message);
    },
    [router]
  );

  return { erro, setErro, tratarErro };
}
