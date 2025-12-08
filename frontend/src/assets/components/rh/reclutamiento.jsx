import { useState, useEffect, useRef } from "react";
// --- UI Components ---
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";
import { Toaster } from "../ui/sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";

// --- Icons ---
import { 
  Search, Upload, Calendar, CheckCircle, XCircle, Send,
  Loader2, Clock, Star, User, Mail, Phone, Bot,
  Sparkles, MessageSquare, Trash2, X, ChevronRight, FileText
} from "lucide-react";

// URL del Gateway
const API_BASE_URL = "http://localhost:7000/api/rh";

// ==========================================
// SERVICIO API (Lógica de Negocio)
// ==========================================
const recruitmentService = {
  getAllPostulantes: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/postulantes`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching postulantes:', error);
      throw error;
    }
  },
  
  createPostulante: async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/postulantes`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error creating postulante:', error);
      throw error;
    }
  },
  
  updatePostulante: async (id, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/postulantes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error updating postulante:', error);
      throw error;
    }
  },
  
  chatWithIA: async (pregunta) => {
    try {
      const response = await fetch(`${API_BASE_URL}/postulantes/chat-rrhh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pregunta }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error chatting with IA:', error);
      return { respuesta: "Error de conexión con el servidor de IA." };
    }
  }
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function GestionReclutamientoContent() {
  // --- ESTADOS DE DATOS ---
  const [postulantes, setPostulantes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [filterApto, setFilterApto] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // --- ESTADOS DEL CHAT ---
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content: "¡Hola! Soy tu asistente de reclutamiento. Puedo ayudarte a encontrar los mejores candidatos, filtrar por habilidades y gestionar entrevistas. ¿En qué puedo ayudarte?"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Sugerencias Rápidas para el Chat
  const quickPrompts = [
    "🏆 Mejores candidatos",
    "📧 Redactar correo rechazo",
    "📅 Entrevistas pendientes",
    "🔍 Buscar skills Python"
  ];
  
  // --- ESTADOS DE MODALES ---
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [entrevistaModalOpen, setEntrevistaModalOpen] = useState(false);
  const [selectedPostulante, setSelectedPostulante] = useState(null);
  
  // --- ESTADOS FORMULARIO ENTREVISTA ---
  const [entrevistaData, setEntrevistaData] = useState({
    fecha: "",
    hora: "",
    modalidad: "presencial",
    notas: ""
  });

  // --- EFFECT: CARGA DE DATOS ---
  useEffect(() => {
    loadPostulantes();
  }, [refreshTrigger]);

  // --- EFFECT: SCROLL CHAT ---
  useEffect(() => {
    if (chatModalOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, chatModalOpen, chatLoading]);

  // --- HANDLERS ---
  const loadPostulantes = async () => {
    setLoading(true);
    try {
      const data = await recruitmentService.getAllPostulantes();
      setPostulantes(data || []);
    } catch (error) {
      toast.error("Error al cargar los postulantes");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadCV = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const file = formData.get('cv');
    
    if (!file || file.size === 0) {
      toast.error("Por favor selecciona un archivo CV");
      return;
    }

    setUploadLoading(true);
    try {
      await recruitmentService.createPostulante(formData);
      toast.success("CV procesado exitosamente", { description: "Análisis de IA completado" });
      setUploadModalOpen(false);
      setRefreshTrigger(prev => prev + 1);
      e.target.reset();
    } catch (error) {
      toast.error("Error al procesar CV");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSendMessage = async (textOverride = null) => {
    const textToSend = textOverride || chatInput;
    if (!textToSend.trim()) return;

    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: textToSend }]);
    setChatLoading(true);

    try {
      const response = await recruitmentService.chatWithIA(textToSend);
      setChatMessages(prev => [...prev, { role: "assistant", content: response.respuesta }]);
    } catch (error) {
      toast.error("Error en el chat IA");
    } finally {
      setChatLoading(false);
    }
  };

  const handleAgendarEntrevista = (postulante) => {
    setSelectedPostulante(postulante);
    setEntrevistaModalOpen(true);
    setEntrevistaData({ fecha: "", hora: "", modalidad: "presencial", notas: "" });
  };

  const handleSaveEntrevista = async () => {
    if (!entrevistaData.fecha || !entrevistaData.hora) {
      toast.error("Por favor completa fecha y hora");
      return;
    }

    try {
      await recruitmentService.updatePostulante(selectedPostulante.id, {
        estado_entrevista: "agendada",
        fecha_entrevista: `${entrevistaData.fecha} ${entrevistaData.hora}`,
        modalidad_entrevista: entrevistaData.modalidad,
        notas_entrevista: entrevistaData.notas
      });
      
      toast.success("Entrevista agendada correctamente");
      setEntrevistaModalOpen(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      toast.error("Error al agendar entrevista");
    }
  };

  const handleToggleApto = async (postulante) => {
    try {
      await recruitmentService.updatePostulante(postulante.id, {
        es_apto: !postulante.es_apto
      });
      toast.success(`Candidato marcado como ${!postulante.es_apto ? "apto" : "no apto"}`);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      toast.error("Error al actualizar estado");
    }
  };

  // --- FILTROS ---
  const filteredPostulantes = postulantes.filter((p) => {
    const matchesSearch = p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || p.correo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesApto = filterApto === "todos" || (filterApto === "apto" ? p.es_apto : !p.es_apto);
    const matchesEstado = filterEstado === "todos" || p.estado_entrevista === filterEstado;
    return matchesSearch && matchesApto && matchesEstado;
  });

  const aptoCount = postulantes.filter(p => p.es_apto).length;
  const pendienteCount = postulantes.filter(p => p.estado_entrevista === "pendiente").length;
  const avgScore = postulantes.length > 0 ? Math.round(postulantes.reduce((acc, p) => acc + (p.match_score || 0), 0) / postulantes.length) : 0;

  return (
    <div className="p-8 bg-[#0c0e12] min-h-screen font-sans text-gray-200">
      <Toaster />

      {/* --- HEADER --- */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight font-['Outfit']">
              Reclutamiento Inteligente
            </h1>
            <p className="text-gray-400 font-light">
              Gestión de candidatos con análisis de IA y chat asistente
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => setChatModalOpen(true)} 
              className="bg-[#13161C] hover:bg-white/5 text-[#2A9D8F] border border-[#2A9D8F]/30 hover:border-[#2A9D8F] shadow-lg transition-all duration-300 font-semibold px-6 py-6 rounded-xl"
            >
              <Bot className="w-5 h-5 mr-2" /> 
              Chat IA
            </Button>
            <Button 
              onClick={() => setUploadModalOpen(true)} 
              className="bg-gradient-to-r from-[#1B4F55] to-[#2A9D8F] hover:from-[#2A9D8F] hover:to-[#1B4F55] text-white shadow-lg shadow-[#2A9D8F]/20 hover:shadow-[#2A9D8F]/40 transition-all duration-300 font-bold px-6 py-6 rounded-xl border border-white/10"
            >
              <Upload className="w-5 h-5 mr-2" /> 
              Subir CV
            </Button>
          </div>
        </div>

        {/* --- TARJETAS DE MÉTRICAS (Detalladas) --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#13161C] p-6 rounded-[2rem] border border-white/10 shadow-lg shadow-black/20 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total</h3>
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <p className="text-3xl font-bold text-white font-['Outfit']">{loading ? "-" : postulantes.length}</p>
            <p className="text-xs text-gray-400 mt-2 font-medium">Candidatos registrados</p>
          </div>

          <div className="bg-[#13161C] p-6 rounded-[2rem] border border-white/10 shadow-lg shadow-black/20 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-emerald-500/80 uppercase tracking-widest group-hover:text-emerald-400 transition-colors">Aptos</h3>
              <CheckCircle className="h-5 w-5 text-emerald-600 group-hover:text-emerald-400 transition-colors" />
            </div>
            <p className="text-3xl font-bold text-white font-['Outfit']">{loading ? "-" : aptoCount}</p>
            <p className="text-xs text-emerald-600 mt-2 font-medium group-hover:text-emerald-400">Candidatos calificados</p>
          </div>

          <div className="bg-[#13161C] p-6 rounded-[2rem] border border-white/10 shadow-lg shadow-black/20 hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-amber-500/80 uppercase tracking-widest group-hover:text-amber-400 transition-colors">Pendiente</h3>
              <Clock className="h-5 w-5 text-amber-600 group-hover:text-amber-400 transition-colors" />
            </div>
            <p className="text-3xl font-bold text-white font-['Outfit']">{loading ? "-" : pendienteCount}</p>
            <p className="text-xs text-amber-600 mt-2 font-medium group-hover:text-amber-400">Entrevistas por agendar</p>
          </div>

          <div className="bg-[#13161C] p-6 rounded-[2rem] border border-white/10 shadow-lg shadow-black/20 hover:border-[#2A9D8F]/30 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[#2A9D8F]/80 uppercase tracking-widest group-hover:text-[#2A9D8F] transition-colors">Promedio</h3>
              <Star className="h-5 w-5 text-[#2A9D8F]/60 group-hover:text-[#2A9D8F] transition-colors" />
            </div>
            <p className="text-3xl font-bold text-white font-['Outfit']">{loading ? "-" : avgScore}%</p>
            <p className="text-xs text-[#2A9D8F] mt-2 font-medium">Score de compatibilidad</p>
          </div>
        </div>

        {/* --- FILTROS --- */}
        <div className="bg-[#13161C] p-6 rounded-[2rem] border border-white/10 shadow-lg shadow-black/20 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#0c0e12] border-white/10 focus:border-[#2A9D8F] focus:ring-1 focus:ring-[#2A9D8F] rounded-xl font-medium text-white placeholder:text-gray-600"
              />
            </div>

            <Select value={filterApto} onValueChange={setFilterApto}>
              <SelectTrigger className="bg-[#0c0e12] border-white/10 focus:border-[#2A9D8F] focus:ring-1 focus:ring-[#2A9D8F] rounded-xl font-medium text-gray-200">
                <SelectValue placeholder="Filtrar por aptitud" />
              </SelectTrigger>
              <SelectContent className="bg-[#13161C] border-white/10 text-gray-200">
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="apto">✓ Aptos</SelectItem>
                <SelectItem value="no-apto">✗ No Aptos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="bg-[#0c0e12] border-white/10 focus:border-[#2A9D8F] focus:ring-1 focus:ring-[#2A9D8F] rounded-xl font-medium text-gray-200">
                <SelectValue placeholder="Estado de entrevista" />
              </SelectTrigger>
              <SelectContent className="bg-[#13161C] border-white/10 text-gray-200">
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="agendada">Agendada</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* --- TABLA DE POSTULANTES --- */}
      <div className="bg-[#13161C] rounded-[2rem] border border-white/10 shadow-lg shadow-black/20 overflow-hidden min-h-[400px]">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#0c0e12] hover:bg-[#0c0e12] border-b border-white/10">
              <TableHead className="font-bold text-gray-400 py-5">Candidato</TableHead>
              <TableHead className="font-bold text-gray-400">Contacto</TableHead>
              <TableHead className="font-bold text-gray-400">Score</TableHead>
              <TableHead className="font-bold text-gray-400">Análisis IA</TableHead>
              <TableHead className="font-bold text-gray-400">Estado</TableHead>
              <TableHead className="font-bold text-gray-400">Entrevista</TableHead>
              <TableHead className="font-bold text-gray-400 text-right pr-6">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Loader2 className="h-10 w-10 text-[#2A9D8F] animate-spin" />
                      <p className="text-gray-500 text-sm font-medium">Sincronizando postulantes...</p>
                    </div>
                  </TableCell>
                </TableRow>
            ) : filteredPostulantes.map((postulante) => (
              <TableRow key={postulante.id} className="hover:bg-white/5 border-b border-white/5 transition-colors duration-150">
                <TableCell className="py-4 pl-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-11 h-11 border-2 border-[#2A9D8F]/30 shadow-sm">
                      <AvatarFallback className="bg-[#1B4F55] text-[#2A9D8F] font-bold text-sm">
                        {postulante.nombre?.[0]}{postulante.nombre?.split(' ')[1]?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-white">{postulante.nombre}</p>
                      <p className="text-xs text-gray-500 font-medium">
                        {new Date(postulante.fecha_postulacion).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-3.5 h-3.5 text-[#2A9D8F]" />
                      <span className="text-gray-300 font-medium">{postulante.correo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-3.5 h-3.5 text-[#2A9D8F]" />
                      <span className="text-gray-300 font-medium">{postulante.telefono}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex items-center gap-2">
                    <div className="relative w-16 h-16">
                      {/* SVG SCORE RESTAURADO */}
                      <svg className="transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-700" strokeWidth="3" />
                        <circle cx="18" cy="18" r="16" fill="none"
                          className={`${
                            postulante.match_score >= 70 ? "stroke-emerald-500" :
                            postulante.match_score >= 50 ? "stroke-amber-500" : "stroke-rose-500"
                          }`}
                          strokeWidth="3"
                          strokeDasharray={`${postulante.match_score * 100.53 / 100}, 100.53`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">{postulante.match_score}</span>
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4 max-w-xs">
                  <p className="text-sm text-gray-400 line-clamp-2 font-light">{postulante.analisis_ia}</p>
                </TableCell>

                <TableCell className="py-4">
                  {postulante.es_apto ? (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold border px-3 py-1 rounded-lg">✓ Apto</Badge>
                  ) : (
                    <Badge variant="outline" className="border-rose-500/20 bg-rose-500/10 text-rose-400 font-bold px-3 py-1 rounded-lg">✗ No Apto</Badge>
                  )}
                </TableCell>

                <TableCell className="py-4">
                  {postulante.estado_entrevista === "agendada" ? (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-semibold text-blue-400">
                        {new Date(postulante.fecha_entrevista).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  ) : (
                    <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-400 font-bold px-3 py-1 rounded-lg">Pendiente</Badge>
                  )}
                </TableCell>

                <TableCell className="py-4 pr-6">
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => handleAgendarEntrevista(postulante)} className="border-white/10 text-gray-300 hover:bg-white/10 hover:text-white rounded-lg font-semibold bg-transparent">
                      <Calendar className="w-3.5 h-3.5 mr-1" /> Agendar
                    </Button>
                    <Button size="sm" variant={postulante.es_apto ? "outline" : "default"} onClick={() => handleToggleApto(postulante)}
                      className={`rounded-lg font-semibold border ${postulante.es_apto ? "border-rose-500/30 text-rose-400 hover:bg-rose-500/10 bg-transparent" : "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"}`}>
                      {postulante.es_apto ? <><XCircle className="w-3.5 h-3.5 mr-1" /> No Apto</> : <><CheckCircle className="w-3.5 h-3.5 mr-1" /> Marcar Apto</>}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ========================================================= */}
      {/* MODAL DE CHAT PROFESIONAL (MEJORADO) */}
      {/* ========================================================= */}
      {chatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setChatModalOpen(false)} />
            
            <div className="relative bg-[#0c0e12] rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col border border-white/10 overflow-hidden ring-1 ring-white/5 animate-in zoom-in-95 duration-200">
                {/* Header Chat */}
                <div className="bg-[#13161C]/90 backdrop-blur-md p-4 border-b border-white/10 flex items-center justify-between z-10">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1B4F55] to-[#2A9D8F] flex items-center justify-center shadow-lg shadow-[#2A9D8F]/20 p-0.5">
                                <div className="w-full h-full bg-[#0c0e12] rounded-full flex items-center justify-center">
                                    <Bot className="w-6 h-6 text-[#2A9D8F]" />
                                </div>
                            </div>
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#13161C] rounded-full shadow-[0_0_8px_#10B981]"></span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white font-['Outfit'] tracking-wide">Recruiter AI Assistant</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2A9D8F] bg-[#2A9D8F]/10 px-1.5 py-0.5 rounded">Online</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                        <button onClick={() => setChatMessages([])} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors" title="Limpiar Chat">
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setChatModalOpen(false)} className="p-2 hover:bg-rose-500/10 rounded-lg text-gray-400 hover:text-rose-400 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Mensajes */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0c0e12] relative scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                    <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

                    {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} items-end group`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === "user" ? "bg-gray-700 text-gray-300" : "bg-[#2A9D8F]/10 text-[#2A9D8F] border border-[#2A9D8F]/20"}`}>
                                {msg.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                            </div>
                            <div className={`max-w-[75%] px-5 py-3.5 shadow-md text-sm leading-relaxed relative ${msg.role === "user" ? "bg-white text-gray-900 rounded-2xl rounded-tr-sm font-medium" : "bg-[#1A1D24] text-gray-200 border border-white/10 rounded-2xl rounded-tl-sm"}`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {chatLoading && (
                        <div className="flex gap-4 items-end animate-in fade-in duration-300">
                             <div className="w-8 h-8 rounded-full bg-[#2A9D8F]/10 text-[#2A9D8F] border border-[#2A9D8F]/20 flex items-center justify-center"><Bot className="w-4 h-4" /></div>
                             <div className="bg-[#1A1D24] border border-white/5 rounded-2xl rounded-tl-sm px-4 py-4 shadow-sm">
                                <div className="flex gap-1.5 items-center">
                                    <div className="w-1.5 h-1.5 bg-[#2A9D8F] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-[#2A9D8F] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-[#2A9D8F] rounded-full animate-bounce"></div>
                                </div>
                             </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input & Prompts */}
                <div className="bg-[#13161C] border-t border-white/10 p-5 z-20">
                    {!chatLoading && (
                        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-1">
                            {quickPrompts.map((prompt, i) => (
                                <button key={i} onClick={() => handleSendMessage(prompt)} className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 hover:bg-[#2A9D8F]/20 border border-white/10 hover:border-[#2A9D8F]/50 text-xs text-gray-400 hover:text-[#2A9D8F] transition-all duration-200 flex items-center gap-1.5">
                                    <MessageSquare className="w-3 h-3" /> {prompt}
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="relative flex items-end gap-2 bg-[#0c0e12] border border-white/10 focus-within:border-[#2A9D8F]/50 focus-within:ring-1 focus-within:ring-[#2A9D8F]/20 rounded-xl p-2 transition-all duration-200 shadow-inner">
                        <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()} placeholder="Escribe tu consulta..." disabled={chatLoading} className="flex-1 bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-gray-600 min-h-[44px] py-2.5" />
                        <div className="flex gap-1 pb-1">
                            <Button onClick={() => handleSendMessage()} disabled={chatLoading || !chatInput.trim()} size="icon" className={`h-9 w-9 rounded-lg transition-all duration-300 ${!chatInput.trim() ? "bg-gray-800 text-gray-600" : "bg-gradient-to-r from-[#1B4F55] to-[#2A9D8F] text-white shadow-lg"}`}>
                                {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* MODAL UPLOAD CV */}
      {uploadModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setUploadModalOpen(false)} />
            <div className="relative bg-[#13161C] rounded-2xl border border-white/10 p-8 max-w-lg w-full shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-6">Subir CV</h2>
                <form onSubmit={handleUploadCV} className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-gray-400">Correo</label>
                        <Input name="correo" required placeholder="email@ejemplo.com" className="bg-[#0c0e12] border-white/10 text-white mt-1" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-400">Teléfono</label>
                        <Input name="telefono" required placeholder="+591 ..." className="bg-[#0c0e12] border-white/10 text-white mt-1" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-400">CV (PDF)</label>
                        <Input type="file" name="cv" accept=".pdf" required className="bg-[#0c0e12] border-white/10 text-gray-300 mt-1 file:bg-[#2A9D8F] file:text-white file:border-0" />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setUploadModalOpen(false)} className="flex-1 border-white/10 text-gray-300 hover:text-white bg-transparent">Cancelar</Button>
                        <Button type="submit" disabled={uploadLoading} className="flex-1 bg-[#2A9D8F] hover:bg-[#1B4F55] text-white">
                            {uploadLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subir y Analizar"}
                        </Button>
                    </div>
                </form>
            </div>
         </div>
      )}

      {/* MODAL AGENDAR ENTREVISTA */}
      {entrevistaModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEntrevistaModalOpen(false)} />
            <div className="relative bg-[#13161C] rounded-2xl border border-white/10 p-8 max-w-md w-full shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Agendar Entrevista</h2>
                <p className="text-gray-400 mb-6">Para: <span className="text-[#2A9D8F]">{selectedPostulante?.nombre}</span></p>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Fecha</label>
                            <Input type="date" className="bg-[#0c0e12] border-white/10 text-white mt-1 [color-scheme:dark]" value={entrevistaData.fecha} onChange={e => setEntrevistaData({...entrevistaData, fecha: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Hora</label>
                            <Input type="time" className="bg-[#0c0e12] border-white/10 text-white mt-1 [color-scheme:dark]" value={entrevistaData.hora} onChange={e => setEntrevistaData({...entrevistaData, hora: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Notas</label>
                        <Textarea className="bg-[#0c0e12] border-white/10 text-white mt-1 min-h-[100px]" placeholder="Detalles..." value={entrevistaData.notas} onChange={e => setEntrevistaData({...entrevistaData, notas: e.target.value})} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" onClick={() => setEntrevistaModalOpen(false)} className="flex-1 border-white/10 text-gray-300 bg-transparent">Cancelar</Button>
                        <Button onClick={handleSaveEntrevista} className="flex-1 bg-[#2A9D8F] text-white">Confirmar</Button>
                    </div>
                </div>
            </div>
         </div>
      )}

    </div>
  );
}