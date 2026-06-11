import { createContext, useState } from 'react';

export const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [termino, setTermino] = useState('');

  return (
    <SearchContext.Provider value={{ termino, setTermino }}>
      {children}
    </SearchContext.Provider>
  );
}
