"""
ENTRENAMIENTO DE MODELO LLAMA 3.1 CON UNSLOTH
==============================================
Este script realiza fine-tuning de Llama 3.1 para análisis de CVs gastronómicos.

REQUISITOS PREVIOS:
-------------------
1. Instalar dependencias (ejecutar en terminal):
   pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
   pip install --no-deps "xformers<0.0.27" "trl<0.9.0" peft accelerate bitsandbytes

2. Tener el archivo dataset.jsonl en la misma carpeta

PASOS DEL SCRIPT:
-----------------
1. Carga el modelo base Llama 3.1 8B (cuantizado en 4 bits)
2. Configura LoRA para entrenamiento eficiente
3. Carga y formatea el dataset
4. Entrena el modelo (60 pasos, ~5-10 minutos)
5. Exporta a formato GGUF para Ollama

AUTOR: Sistema de RRHH - Restaurante Lila
FECHA: Diciembre 2024
"""

import os
import torch
from unsloth import FastLanguageModel
from datasets import load_dataset
from trl import SFTTrainer
from transformers import TrainingArguments

# ==============================================
# CONFIGURACIÓN BÁSICA
# ==============================================

print("=" * 60)
print("INICIANDO ENTRENAMIENTO DE MODELO PARA ANÁLISIS DE CVs")
print("=" * 60)

# Parámetros del modelo
MAX_SEQ_LENGTH = 2048  # Longitud máxima de contexto
DTYPE = None  # Auto-detecta el mejor tipo de dato
LOAD_IN_4BIT = True  # Cuantización 4-bit para ahorrar memoria

print("\n[1/6] Configuración:")
print(f"   - Longitud máxima: {MAX_SEQ_LENGTH} tokens")
print(f"   - Cuantización 4-bit: {LOAD_IN_4BIT}")
print(f"   - GPU disponible: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"   - GPU: {torch.cuda.get_device_name(0)}")
print()

# ==============================================
# PASO 1: CARGAR MODELO BASE
# ==============================================

print("[2/6] Descargando modelo base Llama 3.1 8B...")
print("      (Esto puede tardar varios minutos la primera vez)")

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/Meta-Llama-3.1-8B-bnb-4bit",
    max_seq_length=MAX_SEQ_LENGTH,
    dtype=DTYPE,
    load_in_4bit=LOAD_IN_4BIT,
)

print("✓ Modelo base cargado exitosamente\n")

# ==============================================
# PASO 2: CONFIGURAR LoRA (FINE-TUNING EFICIENTE)
# ==============================================

print("[3/6] Configurando LoRA para fine-tuning...")

model = FastLanguageModel.get_peft_model(
    model,
    r=16,  # Rango de LoRA (más alto = más parámetros entrenables)
    target_modules=[
        "q_proj", "k_proj", "v_proj", "o_proj",  # Attention layers
        "gate_proj", "up_proj", "down_proj",      # MLP layers
    ],
    lora_alpha=16,  # Factor de escala LoRA
    lora_dropout=0,  # Sin dropout para maximizar aprendizaje
    bias="none",  # No entrenar bias
    use_gradient_checkpointing="unsloth",  # Ahorro de memoria
    random_state=3407,  # Semilla para reproducibilidad
)

print("✓ LoRA configurado correctamente")
print(f"   - Parámetros entrenables: ~{16 * 8}M de {8000}M totales (~{(16*8/8000)*100:.2f}%)")
print()

# ==============================================
# PASO 3: CARGAR Y FORMATEAR DATASET
# ==============================================

print("[4/6] Cargando dataset.jsonl...")

# Formato Alpaca (estándar para instruction-tuning)
alpaca_prompt = """Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.

### Instruction:
{}

### Input:
{}

### Response:
{}"""

def formatting_prompts_func(examples):
    """
    Formatea cada ejemplo del dataset al formato Alpaca.
    """
    instructions = examples["instruction"]
    inputs = examples["input"]
    outputs = examples["output"]
    texts = []
    
    for instruction, input_text, output in zip(instructions, inputs, outputs):
        # Formato completo con EOS token al final
        text = alpaca_prompt.format(instruction, input_text, output) + tokenizer.eos_token
        texts.append(text)
    
    return {"text": texts}

# Cargar dataset desde archivo local
dataset = load_dataset("json", data_files="dataset.jsonl", split="train")
print(f"✓ Dataset cargado: {len(dataset)} ejemplos")

# Formatear todo el dataset
dataset = dataset.map(formatting_prompts_func, batched=True)
print("✓ Dataset formateado al estilo Alpaca\n")

# Mostrar un ejemplo para verificación
print("--- EJEMPLO DE ENTRENAMIENTO ---")
print(dataset[0]["text"][:500] + "...")
print("--------------------------------\n")

# ==============================================
# PASO 4: CONFIGURAR ENTRENAMIENTO
# ==============================================

print("[5/6] Configurando el entrenador...")

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,
    dataset_text_field="text",
    max_seq_length=MAX_SEQ_LENGTH,
    dataset_num_proc=2,  # Procesamiento paralelo
    args=TrainingArguments(
        per_device_train_batch_size=2,  # Batch size (ajustar según RAM)
        gradient_accumulation_steps=4,   # Acumular gradientes (batch efectivo = 2*4=8)
        warmup_steps=5,  # Pasos de calentamiento
        max_steps=60,  # Total de pasos (aumentar a 100-200 para mejor resultado)
        learning_rate=2e-4,  # Tasa de aprendizaje
        fp16=not torch.cuda.is_bf16_supported(),  # Precisión mixta FP16
        bf16=torch.cuda.is_bf16_supported(),      # O BF16 si está disponible
        logging_steps=1,  # Registrar pérdida cada paso
        output_dir="outputs",  # Carpeta de checkpoints
        optim="adamw_8bit",  # Optimizador 8-bit (ahorra memoria)
        weight_decay=0.01,  # Regularización
        lr_scheduler_type="linear",  # Scheduler de learning rate
        seed=3407,  # Semilla
        save_strategy="steps",  # Guardar checkpoints
        save_steps=30,  # Cada 30 pasos
    ),
)

print("✓ Entrenador configurado")
print(f"   - Batch size efectivo: {2 * 4}")
print(f"   - Pasos totales: 60")
print(f"   - Learning rate: 2e-4")
print()

# ==============================================
# PASO 5: ENTRENAR EL MODELO
# ==============================================

print("=" * 60)
print("[6/6] INICIANDO ENTRENAMIENTO...")
print("=" * 60)
print("\nEsto tardará aproximadamente 5-10 minutos.")
print("Observa la 'loss' (pérdida) - debería disminuir progresivamente.\n")

# ¡ENTRENAR!
trainer_stats = trainer.train()

print("\n" + "=" * 60)
print("✓ ENTRENAMIENTO COMPLETADO")
print("=" * 60)
print(f"\nEstadísticas finales:")
print(f"   - Pérdida final: {trainer_stats.training_loss:.4f}")
print(f"   - Tiempo total: {trainer_stats.metrics['train_runtime']:.2f} segundos")
print(f"   - Samples/segundo: {trainer_stats.metrics['train_samples_per_second']:.2f}")
print()

# ==============================================
# PASO 6: EXPORTAR A GGUF PARA OLLAMA
# ==============================================

print("[BONUS] Exportando modelo a formato GGUF para Ollama...")
print("        (Este proceso puede tardar 2-3 minutos)\n")

OUTPUT_DIR = "model_cv_restaurante"

try:
    # Guardar en formato GGUF cuantizado Q4_K_M (balance calidad/tamaño)
    model.save_pretrained_gguf(
        OUTPUT_DIR,
        tokenizer,
        quantization_method="q4_k_m"  # Cuantización de 4 bits (método K-means medio)
    )
    
    print("=" * 60)
    print("✓✓✓ MODELO EXPORTADO EXITOSAMENTE ✓✓✓")
    print("=" * 60)
    print(f"\nArchivo GGUF generado en: {OUTPUT_DIR}/")
    print("\n📋 PRÓXIMOS PASOS:")
    print("-" * 60)
    print("1. Busca el archivo .gguf en la carpeta 'model_cv_restaurante'")
    print("   (El nombre será algo como: unsloth.Q4_K_M.gguf)")
    print()
    print("2. Crea un archivo 'Modelfile' con este contenido:")
    print("   ---")
    print("   FROM ./unsloth.Q4_K_M.gguf")
    print('   SYSTEM "Eres un reclutador experto para restaurantes. Analiza CVs y responde en formato JSON."')
    print("   ---")
    print()
    print("3. En la terminal, ejecuta:")
    print("   cd model_cv_restaurante")
    print("   ollama create cv-lila-v1 -f Modelfile")
    print()
    print("4. Actualiza tu código en postulante_service.py:")
    print("   Cambia: model='llama3.1:8b'")
    print("   Por:    model='cv-lila-v1'")
    print()
    print("5. ¡Listo! Tu modelo personalizado está entrenado para tu restaurante.")
    print("=" * 60)
    
except Exception as e:
    print(f"\n❌ Error al exportar: {e}")
    print("\nPuedes exportar manualmente más tarde con:")
    print("model.save_pretrained_gguf('model_cv_restaurante', tokenizer, quantization_method='q4_k_m')")

print("\n🎉 PROCESO COMPLETADO CON ÉXITO 🎉\n")
