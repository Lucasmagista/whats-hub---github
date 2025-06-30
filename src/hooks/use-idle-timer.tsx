import { useEffect, useRef } from 'react';

interface UseIdleTimerProps {
  timeout: number; // em millisegundos
  onIdle: () => void;
  enabled: boolean;
}

export const useIdleTimer = ({ timeout, onIdle, enabled }: UseIdleTimerProps) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const onIdleRef = useRef(onIdle);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  useEffect(() => {
    if (!enabled || timeout <= 0) {
      console.log('⏱️ IdleTimer: Disabled or timeout <= 0');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    console.log('⏱️ IdleTimer: Starting with timeout:', timeout, 'ms');

    const resetTimer = () => {
      const now = Date.now();
      lastActivityRef.current = now;
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        // Verificar se realmente passou o tempo necessário
        const timeSinceLastActivity = Date.now() - lastActivityRef.current;
        if (timeSinceLastActivity >= timeout) {
          console.log('⏱️ IdleTimer: Timeout reached! Calling onIdle...');
          onIdleRef.current();
        } else {
          console.log('⏱️ IdleTimer: False timeout, resetting...');
          resetTimer(); // Reset if time hasn't actually passed
        }
      }, timeout);
    };

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Inicializar última atividade
    lastActivityRef.current = Date.now();
    
    // Iniciar timer
    resetTimer();

    // Adicionar listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [timeout, enabled]);
};
