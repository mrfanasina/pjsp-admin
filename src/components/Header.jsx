import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSearch } from "../contexts/SearchContext";
import { Search } from "lucide-react";

const Header = ({ title }) => {
  const { user } = useAuth();
  const { setSearch } = useSearch();

  const [localValue, setLocalValue] = useState("");

  // ⚡ debounce interne pour fluidité maximale
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(localValue);
    }, 250);

    return () => clearTimeout(handler);
  }, [localValue, setSearch]);

  if (!user) return null;

  return (
<header className="flex items-center bg-white h-18 px-6 border-b border-gray-200 shadow-sm">
  {/* Titre à gauche */}
  <h1 className="text-xl font-semibold text-gray-800 tracking-tight">
    {title}
  </h1>

  {/* Recherche à droite */}
  <div className="ml-auto">
    <div className="relative group max-w-80">
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
      />

      <input
        type="text"
        placeholder="Rechercher..."
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="
          w-80 pl-10 pr-3 py-2
          rounded-lg border border-gray-300
          focus:outline-none
          focus:ring-2 focus:ring-blue-400
          focus:border-transparent
          transition-all
          placeholder:text-gray-400
          text-gray-700
          bg-white/80
        "
      />
    </div>
  </div>
</header>

  );
};

export default Header;
