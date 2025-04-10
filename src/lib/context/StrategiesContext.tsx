import React, { createContext, useContext, useEffect, useState } from 'react';
import { Chain, Strategy, Token, UserStrategy } from '../types';
import { fetchStrategies, fetchChains, fetchTokens, fetchUserStrategies } from '../api/strategies';

type StrategiesContextType = {
  strategies: Strategy[];
  chains: Chain[];
  tokens: Token[];
  userStrategies: UserStrategy[];
  isLoading: boolean;
  error: string | null;
  selectedChain: string | null;
  selectedToken: string | null;
  setSelectedChain: (chainId: string) => void;
  setSelectedToken: (tokenId: string) => void;
  getSupportedTokensForChain: (chainId: string) => Token[];
  getSupportedChainsForToken: (tokenId: string) => Chain[];
  getStrategiesForChainAndToken: (chainId: string, tokenId: string) => Strategy[];
  refreshData: () => Promise<void>;
};

const StrategiesContext = createContext<StrategiesContextType | undefined>(undefined);

export const StrategiesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [chains, setChains] = useState<Chain[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [userStrategies, setUserStrategies] = useState<UserStrategy[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real app, these would be API calls
      const [strategiesData, chainsData, tokensData, userStrategiesData] = await Promise.all([
        fetchStrategies(),
        fetchChains(),
        fetchTokens(),
        fetchUserStrategies(),
      ]);
      
      setStrategies(strategiesData);
      setChains(chainsData);
      setTokens(tokensData);
      setUserStrategies(userStrategiesData);
      
      // Set default selections if not already set
      if (!selectedChain && chainsData.length > 0) {
        setSelectedChain(chainsData[0].id);
      }
      if (!selectedToken && tokensData.length > 0) {
        setSelectedToken(tokensData[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Get tokens supported by a specific chain
  const getSupportedTokensForChain = (chainId: string): Token[] => {
    return tokens.filter(token => token.chains.includes(chainId));
  };

  // Get chains that support a specific token
  const getSupportedChainsForToken = (tokenId: string): Chain[] => {
    const token = tokens.find(t => t.id === tokenId);
    if (!token) return [];
    return chains.filter(chain => token.chains.includes(chain.id));
  };

  // Get strategies available for a specific chain and token
  const getStrategiesForChainAndToken = (chainId: string, tokenId: string): Strategy[] => {
    return strategies.filter(
      strategy => 
        strategy.supportedChains.includes(chainId) && 
        strategy.supportedTokens.includes(tokenId)
    );
  };

  const refreshData = async () => {
    await loadData();
  };

  return (
    <StrategiesContext.Provider
      value={{
        strategies,
        chains,
        tokens,
        userStrategies,
        isLoading,
        error,
        selectedChain,
        selectedToken,
        setSelectedChain,
        setSelectedToken,
        getSupportedTokensForChain,
        getSupportedChainsForToken,
        getStrategiesForChainAndToken,
        refreshData,
      }}
    >
      {children}
    </StrategiesContext.Provider>
  );
};

export const useStrategies = () => {
  const context = useContext(StrategiesContext);
  if (context === undefined) {
    throw new Error('useStrategies must be used within a StrategiesProvider');
  }
  return context;
}; 