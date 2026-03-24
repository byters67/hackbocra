/**
 * useSupabaseQuery — Generic React Query hook for Supabase table reads
 *
 * Wraps @tanstack/react-query with Supabase-specific query building.
 * Provides automatic caching, deduplication, and background refetching
 * for any Supabase table — no boilerplate needed per page.
 *
 * USAGE:
 *   const { data, isLoading, error } = useSupabaseQuery(
 *     'complaints',                   // cache key
 *     'complaints',                   // Supabase table name
 *     {
 *       select: 'id, name, status',   // columns (default: '*')
 *       filters: [['status', 'eq', 'pending']],
 *       order: { column: 'created_at', ascending: false },
 *       limit: 20,
 *     }
 *   );
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

/**
 * @param {string|Array} key - React Query cache key (string or array for compound keys)
 * @param {string} table - Supabase table name to query
 * @param {object} options
 * @param {string}  options.select   - Columns to select (default: '*')
 * @param {Array}   options.filters  - Array of [column, operator, value] filter tuples
 * @param {object}  options.order    - { column, ascending } for sorting
 * @param {number}  options.limit    - Max rows to return
 * @param {boolean} options.enabled  - Whether the query should run (default: true)
 * @param {number}  options.staleTime - How long data stays fresh in ms
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
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
    // Compound key includes filters/order so different queries for the same table
    // get separate cache entries (e.g., "complaints pending" vs "complaints resolved")
    queryKey: Array.isArray(key) ? key : [key, { table, filters, order, limit }],
    queryFn: async () => {
      let query = supabase.from(table).select(select);

      // Apply declarative filters — each is a [column, operator, value] tuple
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
