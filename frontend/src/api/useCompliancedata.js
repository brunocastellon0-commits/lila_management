import { useState, useEffect, useMemo } from 'react';
import { complianceService } from '../api/compliance';

export const useComplianceData = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Métrica general calculada
  const [complianceScore, setComplianceScore] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const rawDocs = await complianceService.getDocuments(); // Array de DocumentResponse
        const adaptedDocs = rawDocs.map(adaptDocumentToUI);
        setDocuments(adaptedDocs);
        calculateScore(adaptedDocs);
      } catch (err) {
        console.error("Error cargando cumplimiento:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Lógica de Negocio (El Adapter) ---
  
  const calculateScore = (docs) => {
    if (!docs.length) return setComplianceScore(0);
    const activeDocs = docs.filter(d => d.status === 'active').length;
    // Regla de negocio simple: % de documentos activos
    setComplianceScore(Math.round((activeDocs / docs.length) * 100));
  };

  const adaptDocumentToUI = (doc) => {
    // doc es type DocumentResponse: { id, tipo, url_archivo, fecha_vencimiento, aprobado_admin, ... }
    
    // 1. Cálculo de días restantes
    let daysLeft = 0;
    let progress = 0;
    let status = 'active'; // active, warning, critical
    let color = 'emerald';

    if (doc.fecha_vencimiento) {
      const today = new Date();
      const vencimiento = new Date(doc.fecha_vencimiento);
      const diffTime = vencimiento - today;
      daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Lógica de semáforo
      if (daysLeft < 0) {
        status = 'critical'; // Vencido
        color = 'rose';
        progress = 0;
      } else if (daysLeft < 30) {
        status = 'warning'; // Por vencer
        color = 'amber';
        progress = (daysLeft / 365) * 100; // Asumiendo ciclo anual para la barra visual
      } else {
        status = 'active'; // Vigente
        color = 'emerald';
        progress = 100;
      }
    } else {
      // Si no tiene fecha vencimiento, es permanente o indefinido
      daysLeft = 999;
      status = 'active';
    }

    // 2. Regla de Aprobación Admin (Override de status si no está aprobado)
    if (!doc.aprobado_admin) {
        status = 'warning';
        color = 'blue'; // Color distintivo para "En revisión"
    }

    // 3. Inferencia de Entidad (Ya que no viene del back, lo deducimos del tipo)
    // Esto es un parche hasta que el backend envíe la "Entidad Emisora"
    const inferEntity = (tipo) => {
        const t = tipo.toLowerCase();
        if (t.includes('bomberos')) return 'Unidad de Bomberos';
        if (t.includes('sanitario')) return 'SEDES';
        if (t.includes('funcionamiento')) return 'Gobierno Municipal';
        if (t.includes('impuestos')) return 'SIN';
        return 'Autoridad Competente';
    };

    return {
      id: doc.id,
      title: doc.tipo, // Mapeo directo
      entity: inferEntity(doc.tipo),
      status: status,
      progress: progress,
      daysLeft: daysLeft,
      url: doc.url_archivo, // Guardamos la URL real
      aprobado: doc.aprobado_admin,
      // Usamos una imagen genérica porque el backend devuelve un link a archivo (pdf/doc), no una imagen cover
      image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=500&q=80", 
      color: color
    };
  };

  // Función para refrescar los datos manualmente
  const refreshDocuments = async () => {
    try {
      setLoading(true);
      const rawDocs = await complianceService.getDocuments();
      const adaptedDocs = rawDocs.map(adaptDocumentToUI);
      setDocuments(adaptedDocs);
      calculateScore(adaptedDocs);
    } catch (err) {
      console.error("Error refrescando cumplimiento:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { documents, complianceScore, loading, error, refreshDocuments };
};