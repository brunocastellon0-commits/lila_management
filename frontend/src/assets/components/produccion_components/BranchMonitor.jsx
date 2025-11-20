import React, { useState } from 'react';
import { AlertCircle, Send, Factory, X } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

// --- DATA ---

const stockData = [
  {
    product: "Croissants",
    category: "Panadería",
    central: 150,
    branchA: 25,
    branchB: 8,
    branchC: 30,
    minStock: 15
  },
  {
    product: "Café Tostado Medio",
    category: "Tostaduría",
    central: 45,
    branchA: 12,
    branchB: 3,
    branchC: 18,
    minStock: 10
  },
  {
    product: "Pan Ciabatta",
    category: "Panadería",
    central: 80,
    branchA: 5,
    branchB: 22,
    branchC: 15,
    minStock: 12
  },
  {
    product: "Salsa de Tomate",
    category: "Conservas",
    central: 120,
    branchA: 30,
    branchB: 28,
    branchC: 35,
    minStock: 20
  },
  {
    product: "Pickles Artesanales",
    category: "Conservas",
    central: 65,
    branchA: 18,
    branchB: 6,
    branchC: 25,
    minStock: 10
  }
];

// --- MAIN COMPONENT ---

export default function BranchMonitor() {
  const [notification, setNotification] = useState(null);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const getStockStatus = (current, min) => {
    if (current < min) return "low";
    if (current < min * 1.5) return "medium";
    return "high";
  };

  const renderStockCell = (stock, minStock, centralStock, branchName, product) => {
    const status = getStockStatus(stock, minStock);
    
    return (
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${
              status === "low" ? "bg-[#FF5252]" : 
              status === "medium" ? "bg-yellow-500" : 
              "bg-[#00C853]"
            }`}></span>
            <span className={status === "low" ? "text-[#FF5252]" : "text-gray-900"}>
              {stock}
            </span>
          </div>
          {status === "low" && (
            <>
              <AlertCircle className="w-4 h-4 text-[#FF5252]" />
              {centralStock >= minStock ? (
                <Button 
                  size="sm" 
                  className="h-7 bg-[#00C853] hover:bg-[#00C853]/90 text-white"
                  onClick={() => showNotification(`Enviando ${product} a ${branchName}`)}
                >
                  <Send className="w-3 h-3 mr-1" />
                  Enviar
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-7 border-[#00B8D4] text-[#00B8D4] hover:bg-[#E0F7FA]"
                  onClick={() => showNotification(`Iniciando producción de ${product}`)}
                >
                  <Factory className="w-3 h-3 mr-1" />
                  Producir
                </Button>
              )}
            </>
          )}
        </div>
      </TableCell>
    );
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="bg-white border border-gray-200 text-gray-800 px-4 py-3 rounded shadow-lg flex items-center gap-3">
            <span className="text-sm font-medium">{notification}</span>
            <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <Card className="p-6 border border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Monitor de Sucursales</h2>
            <p className="text-sm text-gray-600">Estado de inventario en tiempo real</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Planta Central</TableHead>
                <TableHead>Sucursal Centro</TableHead>
                <TableHead>Sucursal Norte</TableHead>
                <TableHead>Sucursal Sur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockData.map((item) => (
                <TableRow key={item.product}>
                  <TableCell className="font-medium text-gray-900">{item.product}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className="border-[#00B8D4] bg-[#E0F7FA] text-[#00B8D4]"
                    >
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${
                        item.central >= item.minStock * 2 ? "bg-[#00C853]" : "bg-yellow-500"
                      }`}></span>
                      <span className="text-gray-700">{item.central}</span>
                    </div>
                  </TableCell>
                  {renderStockCell(item.branchA, item.minStock, item.central, "Sucursal Centro", item.product)}
                  {renderStockCell(item.branchB, item.minStock, item.central, "Sucursal Norte", item.product)}
                  {renderStockCell(item.branchC, item.minStock, item.central, "Sucursal Sur", item.product)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}