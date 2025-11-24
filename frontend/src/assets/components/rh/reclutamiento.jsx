import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert_dialog";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { 
  Search, 
  Upload, 
  MessageSquare, 
  Calendar, 
  CheckCircle, 
  XCircle,
  Send,
  Loader2,
  FileText,
  Clock,
  Star,
  User,
  Mail,
  Phone,
  Bot
} from "lucide-react";
import { Toaster } from "../ui/sonner";

// URL del Gateway
const API_BASE_URL = "http://localhost:7000/api/rh";

// Servicio de API para reclutamiento
const recruitmentService = {
  getAllPostulantes: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/postulantes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
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
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating postulante:', error);
      throw error;
    }
  },
  
  updatePostulante: async (id, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/postulantes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating postulante:', error);
      throw error;
    }
  },
  
  chatWithIA: async (pregunta) => {
    try {
      const response = await fetch(`${API_BASE_URL}/postulantes/chat-rrhh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pregunta }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error chatting with IA:', error);
      return {
        respuesta: "Lo siento, hay un problema de conexión con el asistente. Por favor, intenta de nuevo."
      };
    }
  }
};

export default function GestionReclutamientoContent() {
  const [postulantes, setPostulantes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [filterApto, setFilterApto] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Estados del chat
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content: "¡Hola! Soy tu asistente de reclutamiento. Puedo ayudarte a encontrar los mejores candidatos, filtrar por habilidades y gestionar entrevistas. ¿En qué puedo ayudarte?"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  
  // Estados de modales
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [entrevistaModalOpen, setEntrevistaModalOpen] = useState(false);
  const [selectedPostulante, setSelectedPostulante] = useState(null);
  
  // Estados del formulario de entrevista
  const [entrevistaData, setEntrevistaData] = useState({
    fecha: "",
    hora: "",
    modalidad: "presencial",
    notas: ""
  });

  useEffect(() => {
    loadPostulantes();
  }, [refreshTrigger]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const loadPostulantes = async () => {
    setLoading(true);
    try {
      const data = await recruitmentService.getAllPostulantes();
      setPostulantes(data);
    } catch (error) {
      console.error("Error cargando postulantes:", error);
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
      toast.success("CV procesado exitosamente", {
        description: "El análisis de IA se completó correctamente"
      });
      setUploadModalOpen(false);
      setRefreshTrigger(prev => prev + 1);
      e.target.reset();
    } catch (error) {
      toast.error("Error al procesar CV", {
        description: error.message
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput("");
    
    setChatMessages(prev => [...prev, {
      role: "user",
      content: userMessage
    }]);

    setChatLoading(true);
    try {
      const response = await recruitmentService.chatWithIA(userMessage);
      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: response.respuesta
      }]);
    } catch (error) {
      toast.error("Error en el chat", {
        description: "No se pudo obtener respuesta de la IA"
      });
    } finally {
      setChatLoading(false);
    }
  };

  const handleAgendarEntrevista = (postulante) => {
    setSelectedPostulante(postulante);
    setEntrevistaModalOpen(true);
    setEntrevistaData({
      fecha: "",
      hora: "",
      modalidad: "presencial",
      notas: ""
    });
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

  // Filtrar postulantes
  const filteredPostulantes = postulantes.filter((p) => {
    const matchesSearch = 
      p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.correo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesApto = filterApto === "todos" || 
      (filterApto === "apto" ? p.es_apto : !p.es_apto);
    
    const matchesEstado = filterEstado === "todos" || 
      p.estado_entrevista === filterEstado;

    return matchesSearch && matchesApto && matchesEstado;
  });

  const aptoCount = postulantes.filter(p => p.es_apto).length;
  const pendienteCount = postulantes.filter(p => p.estado_entrevista === "pendiente").length;
  const avgScore = postulantes.length > 0 
    ? Math.round(postulantes.reduce((acc, p) => acc + (p.match_score || 0), 0) / postulantes.length)
    : 0;

  if (loading) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 via-white to-purple-50/30 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-slate-200"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-purple-500 absolute"></div>
          </div>
          <p className="text-slate-600 font-semibold text-xl">Cargando postulantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-white to-purple-50/30 min-h-screen">
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
              Reclutamiento Inteligente
            </h1>
            <p className="text-slate-600 font-medium">
              Gestión de candidatos con análisis de IA y chat asistente
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => setChatModalOpen(true)} 
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 font-semibold px-6 py-2.5 rounded-xl border border-purple-400/20"
            >
              <Bot className="w-4 h-4 mr-2" /> 
              Chat IA
            </Button>
            <Button 
              onClick={() => setUploadModalOpen(true)} 
              className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 transition-all duration-300 font-semibold px-6 py-2.5 rounded-xl border border-teal-400/20"
            >
              <Upload className="w-4 h-4 mr-2" /> 
              Subir CV
            </Button>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide">Total</h3>
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{postulantes.length}</p>
            <p className="text-xs text-slate-500 mt-2 font-medium">Candidatos registrados</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wide">Aptos</h3>
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-bold text-emerald-600">{aptoCount}</p>
            <p className="text-xs text-emerald-700 mt-2 font-medium">Candidatos calificados</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-amber-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wide">Pendiente</h3>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-amber-600">{pendienteCount}</p>
            <p className="text-xs text-amber-700 mt-2 font-medium">Entrevistas por agendar</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wide">Promedio</h3>
              <Star className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{avgScore}%</p>
            <p className="text-xs text-blue-700 mt-2 font-medium">Score de compatibilidad</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 rounded-xl font-medium"
              />
            </div>

            <Select value={filterApto} onValueChange={setFilterApto}>
              <SelectTrigger className="border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 rounded-xl font-medium">
                <SelectValue placeholder="Filtrar por aptitud" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="apto">✓ Aptos</SelectItem>
                <SelectItem value="no-apto">✗ No Aptos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 rounded-xl font-medium">
                <SelectValue placeholder="Estado de entrevista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="agendada">Agendada</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabla de Postulantes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-slate-200">
              <TableHead className="font-bold text-slate-700">Candidato</TableHead>
              <TableHead className="font-bold text-slate-700">Contacto</TableHead>
              <TableHead className="font-bold text-slate-700">Score</TableHead>
              <TableHead className="font-bold text-slate-700">Análisis IA</TableHead>
              <TableHead className="font-bold text-slate-700">Estado</TableHead>
              <TableHead className="font-bold text-slate-700">Entrevista</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPostulantes.map((postulante) => (
              <TableRow key={postulante.id} className="hover:bg-purple-50/30 border-slate-100 transition-colors duration-150">
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-11 h-11 border-2 border-purple-100 shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-purple-100 to-purple-50 text-purple-700 font-bold text-sm">
                        {postulante.nombre?.[0]}{postulante.nombre?.split(' ')[1]?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-slate-900">{postulante.nombre}</p>
                      <p className="text-xs text-slate-500 font-medium">
                        {new Date(postulante.fecha_postulacion).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-700 font-medium">{postulante.correo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-700 font-medium">{postulante.telefono}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex items-center gap-2">
                    <div className="relative w-16 h-16">
                      <svg className="transform -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="16"
                          fill="none"
                          className="stroke-slate-200"
                          strokeWidth="3"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="16"
                          fill="none"
                          className={`${
                            postulante.match_score >= 70 
                              ? "stroke-emerald-500" 
                              : postulante.match_score >= 50 
                              ? "stroke-amber-500" 
                              : "stroke-rose-500"
                          }`}
                          strokeWidth="3"
                          strokeDasharray={`${postulante.match_score * 100.53 / 100}, 100.53`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-slate-900">{postulante.match_score}</span>
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4 max-w-xs">
                  <p className="text-sm text-slate-600 line-clamp-2 font-medium">{postulante.analisis_ia}</p>
                </TableCell>

                <TableCell className="py-4">
                  {postulante.es_apto ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-semibold">
                      ✓ Apto
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700 font-semibold">
                      ✗ No Apto
                    </Badge>
                  )}
                </TableCell>

                <TableCell className="py-4">
                  {postulante.estado_entrevista === "agendada" ? (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-700">
                        {new Date(postulante.fecha_entrevista).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  ) : (
                    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 font-semibold">
                      Pendiente
                    </Badge>
                  )}
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAgendarEntrevista(postulante)}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50 rounded-lg font-semibold"
                    >
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      Agendar
                    </Button>
                    <Button
                      size="sm"
                      variant={postulante.es_apto ? "outline" : "default"}
                      onClick={() => handleToggleApto(postulante)}
                      className={`rounded-lg font-semibold ${
                        postulante.es_apto
                          ? "border-rose-200 text-rose-700 hover:bg-rose-50"
                          : "bg-emerald-500 hover:bg-emerald-600 text-white"
                      }`}
                    >
                      {postulante.es_apto ? (
                        <><XCircle className="w-3.5 h-3.5 mr-1" /> No Apto</>
                      ) : (
                        <><CheckCircle className="w-3.5 h-3.5 mr-1" /> Marcar Apto</>
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Subir CV */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setUploadModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Subir CV para Análisis</h2>
            <form onSubmit={handleUploadCV} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Correo *
                </label>
                <Input
                  type="email"
                  name="correo"
                  required
                  placeholder="candidato@email.com"
                  className="border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Teléfono *
                </label>
                <Input
                  type="tel"
                  name="telefono"
                  required
                  placeholder="+591 70123456"
                  className="border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Archivo CV (PDF) *
                </label>
                <Input
                  type="file"
                  name="cv"
                  accept=".pdf"
                  required
                  className="border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 rounded-xl"
                />
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  La IA analizará el CV y generará un score automáticamente
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUploadModalOpen(false)}
                  className="flex-1 border-slate-200 rounded-xl font-semibold"
                  disabled={uploadLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={uploadLoading}
                  className="flex-1 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl font-semibold"
                >
                  {uploadLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Procesando con IA...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Subir y Analizar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal del Chat IA */}
      {chatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setChatModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[700px] flex flex-col border border-slate-200">
            {/* Header del Chat */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-6 rounded-t-2xl border-b border-purple-400/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Asistente IA de Reclutamiento</h2>
                    <p className="text-purple-100 text-sm font-medium">Pregúntame sobre candidatos y entrevistas</p>
                  </div>
                </div>
                <button
                  onClick={() => setChatModalOpen(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mensajes del Chat */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30"
                        : "bg-white text-slate-900 border border-slate-200 shadow-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed font-medium">{msg.content}</p>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input del Chat */}
            <div className="p-6 border-t border-slate-200 bg-white rounded-b-2xl">
              <div className="flex gap-3">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  placeholder="Pregunta sobre candidatos, filtros, entrevistas..."
                  disabled={chatLoading}
                  className="flex-1 border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 rounded-xl font-medium"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-xl px-6 font-semibold shadow-lg shadow-purple-500/30"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-3 font-medium">
                💡 Ejemplos: "¿Quién tiene el mejor score?", "Muéstrame candidatos para mesero", "¿Cuántas entrevistas tengo pendientes?"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Agendar Entrevista */}
      {entrevistaModalOpen && selectedPostulante && (
        <AlertDialog open={entrevistaModalOpen} onOpenChange={setEntrevistaModalOpen}>
          <AlertDialogContent className="max-w-md rounded-2xl border-slate-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold text-slate-900">
                Agendar Entrevista
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600 font-medium">
                Programa una entrevista con {selectedPostulante.nombre}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Fecha</label>
                <Input
                  type="date"
                  value={entrevistaData.fecha}
                  onChange={(e) => setEntrevistaData({...entrevistaData, fecha: e.target.value})}
                  className="border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Hora</label>
                <Input
                  type="time"
                  value={entrevistaData.hora}
                  onChange={(e) => setEntrevistaData({...entrevistaData, hora: e.target.value})}
                  className="border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Modalidad</label>
                <Select 
                  value={entrevistaData.modalidad} 
                  onValueChange={(value) => setEntrevistaData({...entrevistaData, modalidad: value})}
                >
                  <SelectTrigger className="border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presencial">Presencial</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="telefonica">Telefónica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Notas (Opcional)</label>
                <Textarea
                  value={entrevistaData.notas}
                  onChange={(e) => setEntrevistaData({...entrevistaData, notas: e.target.value})}
                  placeholder="Temas a tratar, requisitos específicos..."
                  className="border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl min-h-[80px]"
                />
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel className="font-bold border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleSaveEntrevista}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 font-bold shadow-lg shadow-blue-500/30 rounded-xl"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Confirmar Entrevista
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <Toaster />
    </div>
  );
}