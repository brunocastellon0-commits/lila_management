# ==============================================================================
# SCRIPT DE INICIO RAPIDO - TODO EN UNO
# ==============================================================================
# Este script ejecuta todo el proceso de forma semiautomatica:
# 1. Valida el entorno
# 2. Entrena el modelo
# 3. Crea el modelo en Ollama
# 4. Ejecuta pruebas
#
# USO: .\quickstart.ps1
# ==============================================================================

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  QUICK START - ENTRENAMIENTO DE MODELO CV LILA v1" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# ==============================================================================
# PASO 1: VALIDACION
# ==============================================================================

Write-Host "[PASO 1/4] Validando entorno..." -ForegroundColor Yellow
Write-Host ""

python validate_setup.py

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Validacion fallo. Corrige los errores antes de continuar." -ForegroundColor Red
    Write-Host ""
    Write-Host "SUGERENCIA:" -ForegroundColor Yellow
    Write-Host "   Si faltan dependencias, ejecuta: .\install_training_deps.ps1" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Entorno validado correctamente" -ForegroundColor Green
Write-Host ""

# Preguntar si continuar
$continue = Read-Host "Continuar con el entrenamiento? (s/n)"
if ($continue -ne "s") {
    Write-Host "Proceso cancelado." -ForegroundColor Yellow
    exit 0
}

# ==============================================================================
# PASO 2: ENTRENAMIENTO
# ==============================================================================

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "[PASO 2/4] Entrenando modelo..." -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Esto tardara aproximadamente 10-20 minutos." -ForegroundColor White
Write-Host "Observa que la Loss vaya bajando progresivamente." -ForegroundColor White
Write-Host ""

python train_model_unsloth.py

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Error durante el entrenamiento." -ForegroundColor Red
    Write-Host ""
    Write-Host "POSIBLES CAUSAS:" -ForegroundColor Yellow
    Write-Host "   - CUDA out of memory: Reduce batch_size en train_model_unsloth.py" -ForegroundColor White
    Write-Host "   - Falta alguna dependencia: Ejecuta install_training_deps.ps1" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Entrenamiento completado" -ForegroundColor Green
Write-Host ""

# Verificar que se genero el archivo .gguf
if (Test-Path "model_cv_restaurante\*.gguf") {
    $ggufFile = (Get-ChildItem "model_cv_restaurante\*.gguf" | Select-Object -First 1).Name
    Write-Host "Modelo exportado: $ggufFile" -ForegroundColor Green
} else {
    Write-Host "ERROR: No se encontro archivo .gguf en model_cv_restaurante/" -ForegroundColor Red
    exit 1
}

# ==============================================================================
# PASO 3: INTEGRACION CON OLLAMA
# ==============================================================================

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "[PASO 3/4] Creando modelo en Ollama..." -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que Ollama este corriendo
Write-Host "Verificando Ollama..." -ForegroundColor White
$ollamaRunning = $false
try {
    $result = ollama list 2>$null
    if ($?) {
        $ollamaRunning = $true
        Write-Host "Ollama esta corriendo" -ForegroundColor Green
    }
} catch {
    $ollamaRunning = $false
}

if (-not $ollamaRunning) {
    Write-Host "ERROR: Ollama no esta corriendo" -ForegroundColor Red
    Write-Host ""
    Write-Host "SOLUCION:" -ForegroundColor Yellow
    Write-Host "   1. Busca el icono de Ollama en la bandeja del sistema" -ForegroundColor White
    Write-Host "   2. O ejecuta: ollama serve" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "Continuar de todas formas? (s/n)"
    if ($continue -ne "s") {
        exit 1
    }
}

# Copiar Modelfile
Write-Host ""
Write-Host "Preparando Modelfile..." -ForegroundColor White

if (-not (Test-Path "model_cv_restaurante\Modelfile")) {
    Copy-Item "Modelfile.template" "model_cv_restaurante\Modelfile"
    Write-Host "Modelfile copiado" -ForegroundColor Green
} else {
    Write-Host "Modelfile ya existe" -ForegroundColor Yellow
}

# Crear modelo en Ollama
Write-Host ""
Write-Host "Creando modelo cv-lila-v1 en Ollama..." -ForegroundColor White
Write-Host "(Esto puede tardar 2-3 minutos)" -ForegroundColor Gray
Write-Host ""

Push-Location "model_cv_restaurante"
ollama create cv-lila-v1 -f Modelfile
$createResult = $LASTEXITCODE
Pop-Location

if ($createResult -eq 0) {
    Write-Host ""
    Write-Host "Modelo cv-lila-v1 creado exitosamente" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Hubo un problema creando el modelo" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Intenta manualmente:" -ForegroundColor White
    Write-Host "   cd model_cv_restaurante" -ForegroundColor Gray
    Write-Host "   ollama create cv-lila-v1 -f Modelfile" -ForegroundColor Gray
    Write-Host ""
}

# ==============================================================================
# PASO 4: PRUEBAS
# ==============================================================================

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "[PASO 4/4] Ejecutando pruebas..." -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

if ($createResult -eq 0) {
    python test_model.py
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Pruebas completadas" -ForegroundColor Green
    }
} else {
    Write-Host "Saltando pruebas (modelo no creado)" -ForegroundColor Yellow
}

# ==============================================================================
# RESUMEN FINAL
# ==============================================================================

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  PROCESO COMPLETADO" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "CHECKLIST:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Modelo entrenado" -ForegroundColor Green
Write-Host "  Exportado a GGUF" -ForegroundColor Green

if ($createResult -eq 0) {
    Write-Host "  Registrado en Ollama como cv-lila-v1" -ForegroundColor Green
} else {
    Write-Host "  Pendiente: Registrar en Ollama" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "PROXIMOS PASOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Actualizar codigo FastAPI:" -ForegroundColor White
Write-Host ""
Write-Host "   Archivo: app\services\postulante_service.py (linea ~68)" -ForegroundColor Gray
Write-Host '   Cambiar: model="llama3.1:8b"' -ForegroundColor Gray
Write-Host '   Por:     model="cv-lila-v1"' -ForegroundColor Green
Write-Host ""
Write-Host "   Archivo: app\api\postulante_router.py (linea ~88)" -ForegroundColor Gray
Write-Host '   Cambiar: model="llama3.1:8b"' -ForegroundColor Gray
Write-Host '   Por:     model="cv-lila-v1"' -ForegroundColor Green
Write-Host ""
Write-Host "2. Reiniciar el servidor FastAPI:" -ForegroundColor White
Write-Host "   uvicorn app.main:app --reload --port 8002" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Probar con un CV real desde el frontend!" -ForegroundColor White
Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "DOCUMENTACION:" -ForegroundColor Yellow
Write-Host "   - GUIA_ENTRENAMIENTO.md (guia completa)" -ForegroundColor White
Write-Host "   - CHEATSHEET.md (comandos rapidos)" -ForegroundColor White
Write-Host "   - RESUMEN_COMPLETO.md (todo el proyecto)" -ForegroundColor White
Write-Host ""
Write-Host "EXITO EN TU DEFENSA!" -ForegroundColor Green
Write-Host ""
