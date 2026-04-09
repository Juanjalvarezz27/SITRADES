import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = "Buscar..." }: SearchBarProps) {
  return (
    <div className="relative flex-1 w-full min-w-[250px]">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search size={18} className="text-slate-400" />
      </div>
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-2xl text-[14px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-sm"
      />
      
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-4 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors bg-transparent outline-none"
          title="Limpiar búsqueda"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}