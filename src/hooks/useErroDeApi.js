'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ErroDeApi } from '@/lib/api';

export function useErroDeApi() {
  const router = useRouter();
  const [erro, setErro] = useState(null);

  const tratarErro = useCallback(
    (e) => {
      if (e instanceof ErroDeApi && e.status === 401) {
        router.replace('/login');
        return;
      }

      setErro(e.message);
    },
    [router]
  );

  return { erro, setErro, tratarErro };
}
