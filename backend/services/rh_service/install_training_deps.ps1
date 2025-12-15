# =============================================================================
# SCRIPT DE INSTALACIÓN AUTOMÁTICA - UNSLOTH + DEPENDENCIAS
# =============================================================================
# Este script instala todo lo necesario para entrenar el modelo con Unsloth
# Ejecutar: .\install_training_deps.ps1
# =============================================================================

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  INSTALACIÓN DE ENTORNO DE ENTRENAMIENTO  " -ForegroundColor Cyan
Write-Host "  Unsloth + Llama 3.1 Fine-Tuning          " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Python
Write-Host "[1/5] Verificando versión de Python..." -ForegroundColor Yellow
python --version

$pythonVersion = python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"
if ($pythonVersion -match "3\.(10|11)") {
    Write-Host "   OK Python $pythonVersion detectado" -ForegroundColor Green
} else {
    Write-Host "   ADVERTENCIA: Se recomienda Python 3.10 o 3.11" -ForegroundColor Red
    Write-Host "   Tu versión: $pythonVersion" -ForegroundColor Red
    $continue = Read-Host "Continuar de todas formas? (s/n)"
    if ($continue -ne "s") {
        exit
    }
}

Write-Host ""

# Verificar CUDA
Write-Host "[2/5] Verificando CUDA..." -ForegroundColor Yellow
$cudaAvailable = python -c "import torch; print(torch.cuda.is_available())" 2>$null
if ($cudaAvailable -eq "True") {
    Write-Host "   OK CUDA disponible" -ForegroundColor Green
    python -c "import torch; print(f'   GPU: {torch.cuda.get_device_name(0)}')"
} else {
    Write-Host "   ADVERTENCIA: CUDA no detectado" -ForegroundColor Red
    Write-Host "   El entrenamiento será MUY lento sin GPU" -ForegroundColor Red
    Write-Host "   Considera usar Google Colab en su lugar" -ForegroundColor Yellow
    $continue = Read-Host "Continuar sin GPU? (s/n)"
    if ($continue -ne "s") {
        exit
    }
}

Write-Host ""

# Instalar PyTorch con CUDA
Write-Host "[3/5] Instalando PyTorch con soporte CUDA..." -ForegroundColor Yellow
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

Write-Host ""

# Instalar Unsloth
Write-Host "[4/5] Instalando Unsloth (esto puede tardar)..." -ForegroundColor Yellow
pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"

Write-Host ""

# Instalar dependencias adicionales
Write-Host "[5/5] Instalando dependencias de entrenamiento..." -ForegroundColor Yellow
pip install --no-deps transformers datasets accelerate bitsandbytes peft "trl<0.9.0" "xformers<0.0.27"

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  INSTALACIÓN COMPLETADA                   " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Verificación final
Write-Host "Ejecutando verificación final..." -ForegroundColor Yellow
Write-Host ""

$testScript = @"
import sys
try:
    import torch
    import transformers
    import datasets
    import bitsandbytes
    import peft
    import trl
    from unsloth import FastLanguageModel
    
    print('OK Todas las librerías importadas correctamente')
    print(f'   - PyTorch: {torch.__version__}')
    print(f'   - Transformers: {transformers.__version__}')
    print(f'   - CUDA disponible: {torch.cuda.is_available()}')
    if torch.cuda.is_available():
        print(f'   - GPU: {torch.cuda.get_device_name(0)}')
    print('')
    print('Todo listo para entrenar!')
    sys.exit(0)
    
except ImportError as e:
    print(f'Error: {e}')
    print('Hubo un problema con la instalación')
    sys.exit(1)
"@

$testScript | python

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SIGUIENTE PASO:" -ForegroundColor Cyan
    Write-Host "  Ejecuta: python train_model_unsloth.py" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Hubo errores. Revisa los mensajes anteriores." -ForegroundColor Red
    Write-Host ""
}
