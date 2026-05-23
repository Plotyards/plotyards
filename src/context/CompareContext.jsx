/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext();

export const useCompare = () => {
  return useContext(CompareContext);
};

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState(() => {
    try {
      const saved = localStorage.getItem('compareList');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('compareList', JSON.stringify(compareList));
  }, [compareList]);

  const addToCompare = (property) => {
    if (compareList.length >= 3) {
      alert('You can only compare up to 3 properties at a time.');
      return false;
    }
    
    // Check if already in list using stringified IDs for safety
    if (compareList.some((p) => String(p.id) === String(property.id))) {
      return false;
    }

    setCompareList([...compareList, property]);
    return true;
  };

  const removeFromCompare = (id) => {
    setCompareList(compareList.filter((p) => String(p.id) !== String(id)));
  };

  const clearCompare = () => {
    setCompareList([]);
    setIsCompareModalOpen(false);
  };

  const toggleCompare = (property) => {
    if (compareList.some((p) => String(p.id) === String(property.id))) {
      removeFromCompare(property.id);
      return false;
    } else {
      return addToCompare(property);
    }
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        toggleCompare,
        isCompareModalOpen,
        setIsCompareModalOpen
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};
