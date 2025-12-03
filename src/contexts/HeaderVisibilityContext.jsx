import { createContext, useContext, useState } from "react";

const HeaderVisibilityContext = createContext();

export const HeaderVisibilityProvider = ({ children }) => {
  const [showHeader, setShowHeader] = useState(true);

  return (
    <HeaderVisibilityContext.Provider value={{ showHeader, setShowHeader }}>
      {children}
    </HeaderVisibilityContext.Provider>
  );
};

export const useHeaderVisibility = () => useContext(HeaderVisibilityContext);
