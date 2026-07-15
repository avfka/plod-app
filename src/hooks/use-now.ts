import { useEffect, useState } from 'react';

/** Current timestamp refreshed once a minute; hydration starts from a stable value. */
export function useNow() {
  const [now, setNow] = useState(0);

  useEffect(() => {
    const update = () => setNow(Date.now());
    const initial = setTimeout(update, 0);
    const interval = setInterval(update, 60_000);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, []);

  return now;
}
