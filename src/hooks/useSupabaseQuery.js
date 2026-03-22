import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useSupabaseQuery(key, table, options = {}) {
  const {
    select = '*',
    filters = [],
    order = null,
    limit = null,
    enabled = true,
    staleTime,
  } = options;

  return useQuery({
    queryKey: Array.isArray(key) ? key : [key, { table, filters, order, limit }],
    queryFn: async () => {
      let query = supabase.from(table).select(select);

      for (const [col, op, val] of filters) {
        query = query.filter(col, op, val);
      }

      if (order) {
        query = query.order(order.column, { ascending: order.ascending ?? true });
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled,
    ...(staleTime !== undefined && { staleTime }),
  });
}
