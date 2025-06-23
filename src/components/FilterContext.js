import React, { createContext, useContext, useState } from 'react';

const defaultFilters = {
  subCategories: [],
  brands: [],
  priceTiers: [],
};

const defaultOptions = {
  subCategories: [],
  brands: [],
  priceTiers: [],
};

const FilterContext = createContext();

export const useFilter = () => useContext(FilterContext);

export const FilterProvider = React.memo(({ children }) => {
  const [filters, setFilters] = useState(defaultFilters);
  const [options, setOptions] = useState(defaultOptions);

  const resetFilters = () => setFilters(defaultFilters);

  return (
    <FilterContext.Provider value={{ filters, setFilters, options, setOptions, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
}); 