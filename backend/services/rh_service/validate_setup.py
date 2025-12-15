"""
SCRIPT DE VALIDACIÓN DEL ENTORNO
=================================

Este script verifica que todo esté listo para entrenar el modelo.

USO:
    python validate_setup.py
"""

import sys
import os
from pathlib import Path

def print_header(text):
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60)

def print_check(text, status):
    icon = "✓" if status else "✗"
    color = "\033[92m" if status else "\033[91m"
    reset = "\033[0m"
    print(f"{color}{icon}{reset} {text}")

def check_python_version():
    """Verifica que Python sea 3.10 o 3.11"""
    version = sys.version_info
    major, minor = version.major, version.minor
    
    is_valid = (major == 3 and minor in [10, 11])
    
    print_check(
        f"Python {major}.{minor} (se recomienda 3.10 o 3.11)",
        is_valid
    )
    
    if not is_valid:
        print("  ⚠️ Advertencia: Unsloth funciona mejor con Python 3.10-3.11")
    
    return is_valid

def check_gpu():
    """Verifica si hay GPU disponible"""
    try:
        import torch
        has_gpu = torch.cuda.is_available()
        
        if has_gpu:
            gpu_name = torch.cuda.get_device_name(0)
            print_check(f"GPU disponible: {gpu_name}", True)
        else:
            print_check("GPU no disponible", False)
            print("  ⚠️ Advertencia: El entrenamiento será MUY lento sin GPU")
            print("  💡 Considera usar Google Colab con GPU T4 gratis")
        
        return has_gpu
    except ImportError:
        print_check("PyTorch no instalado", False)
        return False

def check_dependencies():
    """Verifica dependencias principales"""
    deps = {
        "torch": "PyTorch",
        "transformers": "Transformers (Hugging Face)",
        "datasets": "Datasets",
        "accelerate": "Accelerate",
        "bitsandbytes": "BitsAndBytes",
        "peft": "PEFT (LoRA)",
        "trl": "TRL (Trainer)",
    }
    
    results = {}
    for package, name in deps.items():
        try:
            __import__(package)
            print_check(f"{name} instalado", True)
            results[package] = True
        except ImportError:
            print_check(f"{name} NO instalado", False)
            results[package] = False
    
    return all(results.values())

def check_unsloth():
    """Verifica instalación de Unsloth"""
    try:
        from unsloth import FastLanguageModel
        print_check("Unsloth instalado y funcional", True)
        return True
    except ImportError:
        print_check("Unsloth NO instalado", False)
        print("  💡 Instalar: pip install \"unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git\"")
        return False

def check_files():
    """Verifica que los archivos necesarios existan"""
    files = {
        "dataset.jsonl": "Dataset de entrenamiento",
        "train_model_unsloth.py": "Script de entrenamiento",
        "Modelfile.template": "Template de Ollama",
        "test_model.py": "Script de prueba",
    }
    
    results = {}
    for file, desc in files.items():
        exists = Path(file).exists()
        print_check(f"{desc}: {file}", exists)
        results[file] = exists
    
    return all(results.values())

def check_dataset():
    """Verifica que el dataset sea válido"""
    try:
        import json
        
        if not Path("dataset.jsonl").exists():
            print_check("Dataset no encontrado", False)
            return False
        
        with open("dataset.jsonl", 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Verificar formato
        valid = True
        for i, line in enumerate(lines[:5], 1):  # Revisar primeras 5
            try:
                data = json.loads(line)
                if not all(k in data for k in ["instruction", "input", "output"]):
                    valid = False
                    break
            except json.JSONDecodeError:
                valid = False
                break
        
        if valid:
            print_check(f"Dataset válido: {len(lines)} ejemplos", True)
        else:
            print_check("Dataset con formato incorrecto", False)
        
        return valid
        
    except Exception as e:
        print_check(f"Error validando dataset: {e}", False)
        return False

def check_ollama():
    """Verifica si Ollama está instalado y corriendo"""
    try:
        import ollama
        models = ollama.list()
        print_check("Ollama disponible", True)
        
        # Verificar si cv-lila-v1 ya existe
        model_names = [m['name'] for m in models.get('models', [])]
        if 'cv-lila-v1:latest' in model_names or 'cv-lila-v1' in model_names:
            print("  ℹ️ Modelo cv-lila-v1 ya existe (puedes recrearlo si quieres)")
        
        return True
    except ImportError:
        print_check("Librería ollama NO instalada", False)
        print("  💡 Instalar: pip install ollama")
        return False
    except Exception as e:
        print_check("Ollama no está corriendo", False)
        print("  💡 Inicia Ollama: busca el ícono en la bandeja del sistema")
        return False

def check_disk_space():
    """Verifica espacio en disco"""
    import shutil
    
    total, used, free = shutil.disk_usage(".")
    free_gb = free // (2**30)  # Convertir a GB
    
    needed_gb = 15  # Necesitamos ~15GB
    has_space = free_gb >= needed_gb
    
    print_check(f"Espacio libre: {free_gb} GB (necesitas {needed_gb} GB)", has_space)
    
    if not has_space:
        print("  ⚠️ Advertencia: Puede que no haya suficiente espacio para el modelo")
    
    return has_space

def main():
    print_header("VALIDACIÓN DEL ENTORNO DE ENTRENAMIENTO")
    
    checks = {}
    
    # Check 1: Python
    print("\n[1/9] Versión de Python")
    checks['python'] = check_python_version()
    
    # Check 2: GPU
    print("\n[2/9] GPU / CUDA")
    checks['gpu'] = check_gpu()
    
    # Check 3: Dependencias básicas
    print("\n[3/9] Dependencias Python")
    checks['deps'] = check_dependencies()
    
    # Check 4: Unsloth
    print("\n[4/9] Unsloth")
    checks['unsloth'] = check_unsloth()
    
    # Check 5: Archivos
    print("\n[5/9] Archivos del proyecto")
    checks['files'] = check_files()
    
    # Check 6: Dataset
    print("\n[6/9] Dataset de entrenamiento")
    checks['dataset'] = check_dataset()
    
    # Check 7: Ollama
    print("\n[7/9] Ollama")
    checks['ollama'] = check_ollama()
    
    # Check 8: Espacio en disco
    print("\n[8/9] Espacio en disco")
    checks['space'] = check_disk_space()
    
    # Resumen
    print_header("RESUMEN")
    
    passed = sum(checks.values())
    total = len(checks)
    
    print(f"\nChecks pasados: {passed}/{total}")
    print()
    
    if passed == total:
        print("🎉 ¡TODO LISTO! Puedes ejecutar:")
        print("   python train_model_unsloth.py")
    elif passed >= 6:
        print("⚠️ Casi listo. Verifica los checks fallidos arriba.")
        print("   Algunos son opcionales (ej: GPU si usas Colab)")
    else:
        print("❌ Aún faltan dependencias importantes.")
        print("\n💡 PRÓXIMOS PASOS:")
        
        if not checks.get('deps') or not checks.get('unsloth'):
            print("  1. Ejecuta: .\\install_training_deps.ps1")
            print("     O manualmente:")
            print("     pip install torch transformers datasets accelerate")
            print("     pip install \"unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git\"")
        
        if not checks.get('ollama'):
            print("  2. Instala Ollama desde: https://ollama.ai")
            print("     pip install ollama")
        
        if not checks.get('files'):
            print("  3. Asegúrate de estar en la carpeta correcta")
            print("     cd c:\\Users\\antho\\ProyectosPersonales\\Lila_Restaurant\\backend\\services\\rh_service")
    
    print("\n" + "=" * 60)
    
    # Return code
    return 0 if passed >= 6 else 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
