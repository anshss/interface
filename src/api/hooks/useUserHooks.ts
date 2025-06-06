import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../interceptors/axiosInterceptor";
import { User } from "../types";

export const USER_KEYS = {
  all: ["users"] as const,
  details: (address: string) => [...USER_KEYS.all, "details", address] as const,
  me: () => [...USER_KEYS.all, "me"] as const,
  transactions: () => [...USER_KEYS.all, "transactions"] as const,
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: USER_KEYS.me(),
    queryFn: async () => {
      const response = await axiosInstance.get<User>("/user/me");
      return response.data;
    },
  });
};

export const useUserTransactions = () => {
  return useQuery({
    queryKey: USER_KEYS.transactions(),
    queryFn: async () => {
      const response = await axiosInstance.get<any>("/user/transactions");
      return response.data;
    },
  });
};
