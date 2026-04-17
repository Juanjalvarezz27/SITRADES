"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, SearchX, X } from "lucide-react";
import { toast } from "react-toastify";
import ConfigTable from "./ConfigTable";

interface CatalogoTabProps {
  endpoint: string;
  nombreCatalogo: string;
  isSoftDelete?: boolean;
}

export default function CatalogoTab({ endpoint, nombreCatalogo, isSoftDelete }: CatalogoTabProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(endpoint);
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (error) {
      toast.error("Error al cargar " + nombreCatalogo);
    } finally {
      setLoading(false);
    }
  }, [endpoint, nombreCatalogo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGuardarNuevo = async () => {
    if (!nuevoNombre.trim()) return;
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nuevoNombre })
      });
      if (!res.ok) throw new Error();
      toast.success("Registro creado");
      setNuevoNombre("");
      setIsAdding(false);
      fetchData();
    } catch (error) {
      toast.error("Error al guardar");
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-center sm:justify-end mb-8">
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-primary text-white px-8 py-3 rounded-2xl font-medium text-[15px] active:scale-95 transition-all"
          >
            <Plus size={18} /> Agregar registro
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto animate-in fade-in slide-in-from-top-1">
            <input
              autoFocus
              className="w-full sm:w-80 px-5 py-3 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-brand-primary text-slate-700 text-sm font-medium"
              placeholder="Escribe el nombre..."
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGuardarNuevo()}
            />
            <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={handleGuardarNuevo} className="flex-1 sm:flex-none bg-brand-primary text-white p-3.5 rounded-2xl flex justify-center active:scale-90 transition-transform">
                <Plus size={20} />
              </button>
              <button onClick={() => { setIsAdding(false); setNuevoNombre(""); }} className="flex-1 sm:flex-none bg-slate-700 text-white p-3.5 rounded-2xl flex justify-center active:scale-90 transition-transform">
                <X size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/30">
          <SearchX size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-600 font-medium text-sm tracking-tight">No se encontraron registros en este catálogo</p>
        </div>
      ) : (
        <ConfigTable 
            data={data} 
            endpoint={endpoint} 
            onRefresh={fetchData} 
            isSoftDelete={isSoftDelete} 
        />
      )}
    </div>
  );
}