import React, { useState } from 'react';
import { 
  Search, 
  ChefHat, 
  Clock, 
  Users, 
  Flame, 
  ArrowRight, 
  Plus, 
  MoreVertical,
  BookOpen,
  Filter,
  Edit,
  Trash2,
  Share2
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
// 1. CORRECCIÓN: Usamos Select en lugar de DropdownMenu
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectGroup,
  SelectLabel
} from "../ui/select"; 

// --- MOCK DATA ---
const recipesData = [
  {
    id: 1,
    title: "Croissants de Mantequilla",
    category: "Panadería",
    difficulty: "Alta",
    time: "4h 30m",
    yield: "12 u.",
    calories: "280 kcal",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
    status: "approved"
  },
  {
    id: 2,
    title: "Cold Brew Signature",
    category: "Bebidas",
    difficulty: "Baja",
    time: "12h",
    yield: "1 Lt",
    calories: "5 kcal",
    image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80",
    status: "approved"
  },
  {
    id: 3,
    title: "Tarta de Limón y Merengue",
    category: "Repostería",
    difficulty: "Media",
    time: "1h 15m",
    yield: "8 porc.",
    calories: "320 kcal",
    image: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=600&q=80",
    status: "experimental"
  },
  {
    id: 4,
    title: "Salsa de Tomate Base",
    category: "Salsas",
    difficulty: "Baja",
    time: "45m",
    yield: "2 Lt",
    calories: "80 kcal",
    image: "https://images.unsplash.com/photo-1563287667-422849c31317?auto=format&fit=crop&w=600&q=80",
    status: "approved"
  },
  {
    id: 5,
    title: "Pan Masa Madre Integral",
    category: "Panadería",
    difficulty: "Muy Alta",
    time: "24h",
    yield: "2 u.",
    calories: "210 kcal",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    status: "draft"
  },
  {
    id: 6,
    title: "Galletas Choco-Chips",
    category: "Repostería",
    difficulty: "Baja",
    time: "30m",
    yield: "24 u.",
    calories: "150 kcal",
    image: "https://images.unsplash.com/photo-1499636138143-bd630f5cf388?auto=format&fit=crop&w=600&q=80",
    status: "approved"
  }
];

const categories = ["Todos", "Panadería", "Repostería", "Bebidas", "Salsas"];

export default function Recipes() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRecipes = recipesData.filter(recipe => {
    const matchesCategory = activeCategory === "Todos" || recipe.category === activeCategory;
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (diff) => {
    switch(diff) {
        case "Baja": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/20";
        case "Media": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/20";
        case "Alta": 
        case "Muy Alta": return "bg-rose-500/20 text-rose-400 border-rose-500/20";
        default: return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* --- HEADER VISUAL --- */}
      <div className="relative rounded-[2rem] overflow-hidden bg-[#13161C] border border-white/10 p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#2A9D8F] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <h2 className="text-4xl font-bold text-white font-['Outfit'] mb-2">Recetario Maestro</h2>
                <p className="text-gray-400 max-w-lg">
                    Gestiona los estándares de calidad de La Bourboneria. Crea, edita y distribuye las recetas oficiales.
                </p>
            </div>
            <Button className="h-12 px-6 bg-gradient-to-r from-[#1B4F55] to-[#2A9D8F] hover:shadow-[0_0_25px_rgba(42,157,143,0.5)] text-white border-0 rounded-2xl transition-all duration-300 font-semibold text-md group">
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                Nueva Receta
            </Button>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-8 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input 
                    placeholder="Buscar receta..." 
                    className="pl-12 h-12 rounded-2xl bg-[#0c0e12] border-white/10 text-white focus:ring-[#2A9D8F] focus:border-[#2A9D8F] transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 custom-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap border ${
                            activeCategory === cat 
                            ? "bg-[#2A9D8F] text-white border-[#2A9D8F] shadow-[0_0_15px_rgba(42,157,143,0.4)]" 
                            : "bg-[#0c0e12] text-gray-400 border-white/10 hover:border-white/30 hover:text-white"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* --- RECIPE GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
            <div 
                key={recipe.id} 
                className="group relative bg-[#13161C] rounded-[2rem] overflow-hidden border border-white/5 hover:border-[#2A9D8F]/50 transition-all duration-500 hover:shadow-[0_0_30px_-10px_rgba(42,157,143,0.3)] flex flex-col"
            >
                {/* Image Section */}
                <div className="h-56 overflow-hidden relative">
                    <img 
                        src={recipe.image} 
                        alt={recipe.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#13161C] via-[#13161C]/20 to-transparent opacity-90"></div>
                    
                    {/* Floating Badges */}
                    <div className="absolute top-4 left-4">
                        <Badge className={`backdrop-blur-md border border-white/10 font-normal ${getDifficultyColor(recipe.difficulty)}`}>
                            {recipe.difficulty}
                        </Badge>
                    </div>
                    
                    {/* 2. CORRECCIÓN: Botón de opciones usando Select */}
                    <div className="absolute top-4 right-4">
                        <Select>
                            <SelectTrigger className="w-8 h-8 p-0 bg-black/40 backdrop-blur-md border-transparent text-white hover:bg-[#2A9D8F] hover:text-white rounded-full flex items-center justify-center ring-0 focus:ring-0">
                                <MoreVertical className="w-4 h-4" />
                            </SelectTrigger>
                            <SelectContent align="end" className="bg-[#1A1D24] border-white/10 text-gray-300 rounded-xl shadow-xl min-w-[150px]">
                                <SelectGroup>
                                    <SelectLabel className="text-white text-xs px-2 py-1.5 font-semibold">Opciones</SelectLabel>
                                    <SelectItem value="edit" className="cursor-pointer hover:bg-white/10">
                                        <div className="flex items-center gap-2"><Edit className="w-3.5 h-3.5"/> Editar</div>
                                    </SelectItem>
                                    <SelectItem value="share" className="cursor-pointer hover:bg-white/10">
                                        <div className="flex items-center gap-2"><Share2 className="w-3.5 h-3.5"/> Compartir</div>
                                    </SelectItem>
                                    <SelectItem value="delete" className="cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-400">
                                        <div className="flex items-center gap-2"><Trash2 className="w-3.5 h-3.5"/> Eliminar</div>
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 relative flex-1 flex flex-col">
                    <div className="-mt-10 mb-3 relative z-10">
                        <span className="inline-block px-3 py-1 rounded-lg bg-[#2A9D8F] text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                            {recipe.category}
                        </span>
                    </div>

                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#2A9D8F] transition-colors line-clamp-1">
                            {recipe.title}
                        </h3>
                        
                        <div className="grid grid-cols-3 gap-2 mt-4 py-4 border-t border-white/5 border-b mb-4">
                            <div className="flex flex-col items-center justify-center text-center">
                                <Clock className="w-4 h-4 text-gray-500 mb-1" />
                                <span className="text-sm font-medium text-gray-300">{recipe.time}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center text-center border-l border-white/5">
                                <Users className="w-4 h-4 text-gray-500 mb-1" />
                                <span className="text-sm font-medium text-gray-300">{recipe.yield}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center text-center border-l border-white/5">
                                <Flame className="w-4 h-4 text-gray-500 mb-1" />
                                <span className="text-sm font-medium text-gray-300">{recipe.calories}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2">
                        <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full border-2 border-[#13161C] bg-gray-700 flex items-center justify-center text-xs text-white">JD</div>
                            <div className="w-8 h-8 rounded-full border-2 border-[#13161C] bg-gray-600 flex items-center justify-center text-xs text-white">AL</div>
                        </div>
                        <Button 
                            variant="ghost" 
                            className="text-[#2A9D8F] hover:text-white hover:bg-[#2A9D8F]/20 rounded-xl group/btn"
                        >
                            Ver Receta 
                            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </div>
        ))}

        {filteredRecipes.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-[#13161C] rounded-full flex items-center justify-center border border-white/10 mb-4 animate-pulse">
                    <BookOpen className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-white">No se encontraron recetas</h3>
                <p className="text-gray-500 mt-2">Intenta ajustar tu búsqueda o categoría.</p>
            </div>
        )}
      </div>
    </div>
  );
}