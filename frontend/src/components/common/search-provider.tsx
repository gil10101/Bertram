"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface SearchContextValue {
  query: string;
  setQuery: (query: string) => void;
  clear: () => void;
}

const SearchContext = createContext<SearchContextValue>({
  query: "",
  setQuery: () => {},
  clear: () => {},
});

export function useSearch() {
  return useContext(SearchContext);
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("");
  const clear = useCallback(() => setQuery(""), []);

  return (
    <SearchContext.Provider value={{ query, setQuery, clear }}>
      {children}
    </SearchContext.Provider>
  );
}
