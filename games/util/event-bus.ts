type Callback<T> = (payload: T) => void;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
interface Listener<K extends keyof any, V> {
   id: string;
   event: K;
   callback: Callback<V>;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const eBus = <Events extends Record<string, any>>() => {
   // biome-ignore lint/suspicious/noExplicitAny: <explanation>
   const listeners = new Map<string, Listener<keyof Events, any>>();

   const on = <K extends keyof Events>(event: K, callback: Callback<Events[K]>): string => {
      const time = new Date().getTime().toString().slice(-8);
      const randNum = Math.floor(Math.random() * 100_000_000);
      const id = `evt_${time}_${randNum}`;
      listeners.set(id, { id, event, callback });
      return id;
   };

   const fire = <K extends keyof Events>(event: K, payload: Events[K]): void => {
      for (const listener of listeners.values()) {
         if (listener.event === event) {
            (listener.callback as Callback<Events[K]>)(payload);
         }
      }
   };

   const remove = (id: string): void => {
      listeners.delete(id);
   };

   const clear = () => listeners.clear();

   const count = () => listeners.size;

   return {
      on,
      fire,
      count,
      remove,
      clear,
   };
};
