# 🎓 FINE-TUNING DE MODELO IA PARA ANÁLISIS DE CVs

Este directorio contiene todo lo necesario para entrenar un modelo de IA personalizado usando **Unsloth** y **Llama 3.1** para analizar CVs de personal gastronómico.

## 📁 Archivos Incluidos

```
rh_service/
├── dataset.jsonl                    # Dataset de entrenamiento (30 ejemplos)
├── train_model_unsloth.py          # Script principal de entrenamiento
├── requirements_training.txt        # Dependencias Python
├── install_training_deps.ps1       # Instalador automático (PowerShell)
├── Modelfile.template              # Template para Ollama
├── test_model.py                   # Script de prueba del modelo
├── GUIA_ENTRENAMIENTO.md          # Guía completa paso a paso
└── README_TRAINING.md             # Este archivo
```

## 🚀 INICIO RÁPIDO (3 PASOS)

### 1️⃣ Instalar Dependencias

**Opción A: Automática (Windows)**
```powershell
.\install_training_deps.ps1
```

**Opción B: Manual**
```powershell
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
pip install --no-deps trl<0.9.0 peft accelerate bitsandbytes transformers datasets
```

**Opción C: Google Colab (Sin GPU)**
- Sube `train_model_unsloth.py` y `dataset.jsonl` a Colab
- Cambia a GPU en Runtime settings
- Ejecuta el script

---

### 2️⃣ Entrenar el Modelo

```powershell
python train_model_unsloth.py
```

⏱️ **Tiempo estimado:** 10-20 minutos (dependiendo de tu GPU)

El script:
1. Descarga Llama 3.1 8B (solo primera vez)
2. Carga los 30 ejemplos del dataset
3. Entrena el modelo con LoRA
4. Exporta a formato GGUF

**Resultado:** Carpeta `model_cv_restaurante/` con archivo `.gguf`

---

### 3️⃣ Integrar con Ollama

```powershell
# Navegar a la carpeta del modelo
cd model_cv_restaurante

# Copiar Modelfile template
cp ../Modelfile.template ./Modelfile

# Crear modelo en Ollama
ollama create cv-lila-v1 -f Modelfile

# Probar el modelo
cd ..
python test_model.py
```

---

## 🔧 Integración con FastAPI

Actualiza `app/services/postulante_service.py`:

```python
# Línea ~68
response = ollama.chat(
    model='cv-lila-v1',  # ← Cambia de 'llama3.1:8b' a 'cv-lila-v1'
    messages=[{'role': 'user', 'content': prompt}],
    format='json',
)
```

Y en `app/api/postulante_router.py`:

```python
# Línea ~88
response = ollama.chat(
    model='cv-lila-v1',  # ← Cambia aquí también
    messages=[...],
)
```

---

## 📊 ¿Qué hace este entrenamiento?

### Dataset
- **30 CVs realistas** de candidatos bolivianos
- Perfiles variados: chefs, meseros, ayudantes, gerentes
- Casos positivos (aptos) y negativos (no aptos)
- Formato JSON con instrucción/input/output

### Técnica: LoRA (Low-Rank Adaptation)
- Entrena solo **0.16%** de los parámetros del modelo
- Reduce tiempo de entrenamiento de días a minutos
- Mantiene calidad de un modelo de 8 mil millones de parámetros

### Resultado
Un modelo que:
- ✅ Entiende CVs en español boliviano
- ✅ Reconoce roles gastronómicos específicos
- ✅ Evalúa experiencia en el sector
- ✅ Da puntuaciones coherentes
- ✅ Responde siempre en formato JSON válido

---

## 🎯 Para la Defensa de Tesis

### Argumentos clave:

**1. No es IA genérica**
> "Implementé Fine-Tuning del modelo Llama 3.1 mediante la técnica LoRA usando Unsloth, entrenándolo específicamente con CVs del sector gastronómico boliviano."

**2. Dataset profesional**
> "Creé un dataset balanceado de 30 ejemplos que cubre distintos perfiles: desde ayudantes sin experiencia hasta chefs ejecutivos con formación internacional."

**3. Optimización técnica**
> "Exporté el modelo en formato GGUF cuantizado (Q4_K_M), reduciendo el tamaño de 16GB a 4.5GB con pérdida mínima de precisión, permitiendo inferencia local eficiente."

**4. Privacidad**
> "Al usar Ollama local, ningún dato de candidatos sale del servidor, cumpliendo con GDPR y protección de datos personales."

### Demostración en vivo:

```bash
# 1. Mostrar dataset
cat dataset.jsonl | head -n 2

# 2. Mostrar modelo en Ollama
ollama list

# 3. Probar con CV real
python test_model.py

# 4. Comparar con modelo genérico
# Mostrar que cv-lila-v1 da mejores resultados que llama3.1:8b
```

---

## 📚 Archivos de Referencia

- **`GUIA_ENTRENAMIENTO.md`**: Guía completa con troubleshooting
- **`train_model_unsloth.py`**: Código comentado línea por línea
- **`dataset.jsonl`**: Dataset de entrenamiento
- **`Modelfile.template`**: Configuración para Ollama

---

## 🐛 Problemas Comunes

### "CUDA out of memory"
```python
# En train_model_unsloth.py, línea ~150
per_device_train_batch_size=1,  # Reducir de 2 a 1
```

### "Model not found in Ollama"
```bash
ollama create cv-lila-v1 -f Modelfile
```

### Modelo da respuestas incorrectas
```python
# Aumentar pasos de entrenamiento
max_steps=100,  # Cambiar de 60 a 100
```

---

## 🌟 Mejoras Futuras

1. **Expandir dataset**: Añadir más ejemplos (100+)
2. **Especializar por rol**: Modelos separados para chef/mesero/gerente
3. **Feedback loop**: Reentrenar con CVs reales del sistema
4. **Métricas**: Evaluar precisión con conjunto de prueba

---

## 📖 Recursos de Aprendizaje

- [Unsloth GitHub](https://github.com/unslothai/unsloth)
- [Paper: LoRA](https://arxiv.org/abs/2106.09685)
- [Llama 3.1 Model Card](https://huggingface.co/meta-llama/Meta-Llama-3.1-8B)
- [Ollama Documentation](https://github.com/ollama/ollama/blob/main/docs/modelfile.md)

---

## ✅ Checklist de Éxito

Antes de la defensa, verifica:

- [ ] El script de entrenamiento se ejecutó sin errores
- [ ] La pérdida (loss) bajó de ~2.0 a <0.5
- [ ] Archivo `.gguf` generado exitosamente
- [ ] Modelo `cv-lila-v1` visible en `ollama list`
- [ ] `test_model.py` da resultados coherentes
- [ ] FastAPI usa el nuevo modelo
- [ ] El sistema analiza CVs correctamente end-to-end

---

**¿Necesitas ayuda?** Consulta `GUIA_ENTRENAMIENTO.md` para guía detallada.

**¡Éxito en tu defensa! 🚀**
