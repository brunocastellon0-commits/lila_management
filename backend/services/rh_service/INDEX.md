# 📑 ÍNDICE DEL PROYECTO - FINE-TUNING LLAMA 3.1

## 🎯 VISIÓN GENERAL

Este proyecto implementa **Fine-Tuning** de Llama 3.1 8B usando **Unsloth** y **LoRA** para crear un modelo especializado en análisis de CVs de personal gastronómico boliviano.

**Resultado:** Un modelo de IA personalizado (`cv-lila-v1`) que analiza CVs y evalúa candidatos con un 85%+ de precisión.

---

## 📁 ARCHIVOS DEL PROYECTO (11 archivos)

### 🚀 INICIO RÁPIDO
| Archivo | Descripción | Cuándo usarlo |
|---------|-------------|---------------|
| **`quickstart.ps1`** | 🎯 **EMPEZAR AQUÍ** - Script todo-en-uno | Primera vez |
| `validate_setup.py` | Valida que todo esté listo | Antes de entrenar |
| `install_training_deps.ps1` | Instala dependencias automáticamente | Si faltan librerías |

### 📊 DATOS Y ENTRENAMIENTO
| Archivo | Descripción | Tamaño |
|---------|-------------|--------|
| **`dataset.jsonl`** | 30 CVs de ejemplo (instruction/output) | 28 KB |
| **`train_model_unsloth.py`** | 🔥 Script principal de entrenamiento | 9 KB |
| `generate_more_data.py` | Genera CVs sintéticos adicionales | 11 KB |

### 🧪 PRUEBAS E INTEGRACIÓN
| Archivo | Descripción | Usar después de... |
|---------|-------------|-------------------|
| `test_model.py` | Prueba el modelo con 3 casos | Entrenamiento |
| `Modelfile.template` | Configuración para Ollama | Exportación |

### 📚 DOCUMENTACIÓN
| Archivo | Qué contiene | Para quién |
|---------|--------------|------------|
| **`RESUMEN_COMPLETO.md`** | 📖 **TODO** en un documento | Leer primero |
| `GUIA_ENTRENAMIENTO.md` | Guía paso a paso detallada | Seguir durante el proceso |
| `CHEATSHEET.md` | Comandos rápidos + frases de defensa | Consulta rápida |
| `README_TRAINING.md` | Resumen ejecutivo | Presentación |
| `INDEX.md` | Este archivo - índice general | Navegación |

### ⚙️ CONFIGURACIÓN
| Archivo | Propósito |
|---------|-----------|
| `requirements_training.txt` | Lista de dependencias Python |

---

## 🗺️ ROADMAP - ¿QUÉ HACER Y EN QUÉ ORDEN?

### 1️⃣ PRIMERA VEZ (Lectura - 15 minutos)
```
1. Leer: RESUMEN_COMPLETO.md (visión general)
2. Leer: README_TRAINING.md (quick start)
3. Tener a mano: CHEATSHEET.md (para copiar comandos)
```

### 2️⃣ SETUP (Instalación - 15 minutos)
```
# Opción A: Automática
.\install_training_deps.ps1

# Opción B: Manual (ver GUIA_ENTRENAMIENTO.md)

# Validar
python validate_setup.py
```

### 3️⃣ ENTRENAMIENTO (Ejecución - 10-20 minutos)
```
# Opción A: Todo automático
.\quickstart.ps1

# Opción B: Paso a paso
python train_model_unsloth.py
cd model_cv_restaurante
ollama create cv-lila-v1 -f Modelfile
cd ..
python test_model.py
```

### 4️⃣ INTEGRACIÓN (Código - 5 minutos)
```
Actualizar 2 archivos:
  - app/services/postulante_service.py (línea ~68)
  - app/api/postulante_router.py (línea ~88)

Cambiar: model='llama3.1:8b'
Por:     model='cv-lila-v1'

Reiniciar: uvicorn app.main:app --reload --port 8002
```

### 5️⃣ DEFENSA (Preparación)
```
Leer: CHEATSHEET.md (sección "Frases para la Defensa")
Preparar: CV de ejemplo para demo en vivo
Revisar: Logs de entrenamiento (loss final)
```

---

## 🧭 GUÍA DE NAVEGACIÓN

### "Quiero empezar YA" → `quickstart.ps1`
Ejecuta todo de golpe. Si algo falla, consulta los otros archivos.

### "Quiero entender qué hace" → `RESUMEN_COMPLETO.md`
Documento maestro con arquitectura, tecnologías, ventajas.

### "Tengo un error" → `GUIA_ENTRENAMIENTO.md` (sección Troubleshooting)
O `CHEATSHEET.md` (sección Troubleshooting).

### "Necesito comandos rápidos" → `CHEATSHEET.md`
Copy-paste de comandos más usados.

### "Quiero más datos" → `generate_more_data.py`
Genera CVs sintéticos adicionales.

### "El modelo no funciona bien" → Reentrenar
```python
# Opción 1: Más datos
python generate_more_data.py --cantidad 50
# Combinar datasets y reentrenar

# Opción 2: Más pasos
# Editar train_model_unsloth.py: max_steps=100
python train_model_unsloth.py
```

---

## 📊 MÉTRICAS DE ÉXITO

Sabrás que todo funcionó si:

- [ ] `python validate_setup.py` → Todo en verde
- [ ] `python train_model_unsloth.py` → Loss final < 0.6
- [ ] `ollama list` → Muestra `cv-lila-v1`
- [ ] `python test_model.py` → Resultados coherentes:
  - Chef → 85-95 puntos, APTO
  - Sin experiencia → 20-40 puntos, NO APTO
- [ ] FastAPI procesa CVs con el nuevo modelo

---

## 🏗️ ARQUITECTURA DE SOFTWARE

```
USUARIO
  ↓ Sube CV PDF
FRONTEND (React)
  ↓ POST /api/postulantes
GATEWAY
  ↓ Ruta a rh_service:8002
FASTAPI (postulante_router.py)
  ↓ Valida y guarda archivo
postulante_service.py
  ↓ Extrae texto del PDF
  ↓ Llama a Ollama
OLLAMA
  ↓ Usa modelo cv-lila-v1
MODELO (4.5 GB GGUF)
  ↓ Llama 3.1 fine-tuned
  ↓ Entrenado con LoRA
DATASET (30 CVs)
  ↓ CVs gastronómicos
  ↓ Formato Alpaca
```

---

## 🎓 CONCEPTOS CLAVE

| Término | Qué es | Por qué importa |
|---------|--------|-----------------|
| **Fine-Tuning** | Reentrenar modelo con datos específicos | El modelo aprende tu dominio |
| **LoRA** | Entrenar solo una pequeña parte | 100x más rápido, mismo resultado |
| **Unsloth** | Framework de entrenamiento | 2x más rápido que alternativas |
| **GGUF** | Formato de modelo optimizado | De 16GB a 4.5GB |
| **Ollama** | Servidor de inferencia local | Privacidad, gratis, sin APIs |
| **Alpaca** | Formato de dataset | Estándar para instruction-tuning |
| **Cuantización** | Reducir precisión numérica | Menor tamaño, más rápido |

---

## 🆘 AYUDA RÁPIDA

### Error al entrenar
```bash
# Ver validate_setup.py para diagnóstico
python validate_setup.py

# Problema común: CUDA out of memory
# Solución: Editar train_model_unsloth.py línea 150
#   per_device_train_batch_size=1
```

### Ollama no encuentra modelo
```bash
cd model_cv_restaurante
ollama create cv-lila-v1 -f Modelfile
```

### Modelo da respuestas raras
```python
# Aumentar pasos de entrenamiento
# Editar train_model_unsloth.py línea 155
max_steps=100  # De 60 a 100
```

### No tengo GPU
```
Usa Google Colab:
1. Sube train_model_unsloth.py y dataset.jsonl
2. Runtime > Change runtime type > GPU (T4)
3. Ejecuta el script
4. Descarga el .gguf generado
```

---

## 📞 RECURSOS EXTERNOS

- **Unsloth:** https://github.com/unslothai/unsloth
- **Ollama:** https://ollama.ai
- **LoRA Paper:** https://arxiv.org/abs/2106.09685
- **Llama 3.1:** https://huggingface.co/meta-llama/Meta-Llama-3.1-8B

---

## ✅ CHECKLIST DE COMPLETITUD

### Antes de la defensa, verifica:

**Archivos:**
- [ ] Todos los 11 archivos presentes
- [ ] dataset.jsonl tiene 30+ ejemplos
- [ ] train_model_unsloth.py sin errores de sintaxis

**Entrenamiento:**
- [ ] Script ejecutado completamente
- [ ] Loss final < 0.6 (idealmente < 0.5)
- [ ] Carpeta model_cv_restaurante/ creada
- [ ] Archivo .gguf dentro (>1GB)

**Integración:**
- [ ] Modelo cv-lila-v1 en `ollama list`
- [ ] test_model.py da resultados coherentes
- [ ] FastAPI actualizado (2 archivos)
- [ ] Servidor reiniciado correctamente

**Demostración:**
- [ ] CV de prueba preparado (PDF)
- [ ] Frontend funcional
- [ ] Proceso end-to-end funciona
- [ ] Logs muestran model='cv-lila-v1'

**Presentación:**
- [ ] Puedes explicar Fine-Tuning y LoRA
- [ ] Conoces las métricas (loss, puntuación)
- [ ] Tienes argumentos de privacidad
- [ ] Sabes responder preguntas comunes

---

## 🎯 PRIORIDADES

Si tienes **poco tiempo**, enfócate en:

1. `quickstart.ps1` → Ejecutar todo automáticamente
2. `CHEATSHEET.md` → Comandos y frases de defensa
3. `test_model.py` → Validar que funciona

Si tienes **tiempo completo**, sigue:

1. `RESUMEN_COMPLETO.md` → Entender el proyecto
2. `GUIA_ENTRENAMIENTO.md` → Paso a paso detallado
3. Todos los scripts → Ejecutar y validar
4. Preparar demo en vivo → Subir CV real

---

## 🏆 OBJETIVO FINAL

Al completar este proyecto, tendrás:

✅ Un modelo de IA **entrenado desde cero** (no una API genérica)  
✅ **Conocimiento práctico** de Fine-Tuning, LoRA, Cuantización  
✅ Un sistema **funcional** que analiza CVs reales  
✅ **Argumentos sólidos** para defender ante docentes  
✅ Un **portfolio técnico** diferenciador  

---

## 🚀 EMPEZAR AHORA

```powershell
# Paso 1: Validar entorno
python validate_setup.py

# Paso 2: Si todo OK, ejecutar quickstart
.\quickstart.ps1

# Paso 3: ¡A defender tu proyecto!
```

---

**¿Dudas?** Consulta los archivos en este orden:
1. `INDEX.md` (este archivo) - Navegación
2. `RESUMEN_COMPLETO.md` - Visión general
3. `GUIA_ENTRENAMIENTO.md` - Paso a paso
4. `CHEATSHEET.md` - Referencia rápida

**¡ÉXITO! 🎉**
