import { useSubscriptionAddons } from '@/hooks/billing';

/**
 * Subscription Addons Response Lib
 */
export const SubscriptionAddonList = (
  subscriptionId: string,
  refreshKey: number
) => {
  const { data, isLoading, isError } = useSubscriptionAddons(
    subscriptionId,
    refreshKey
  );

  const addons = data?.data ?? [];

  return {
    addons,
    isLoading,
    isError,
  };
};
