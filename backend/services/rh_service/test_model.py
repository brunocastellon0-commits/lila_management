"""
SCRIPT DE PRUEBA RÁPIDA DEL MODELO ENTRENADO
============================================

Este script te permite probar tu modelo antes de integrarlo con FastAPI.

USO:
    python test_model.py

REQUISITOS:
    - Haber ejecutado: ollama create cv-lila-v1 -f Modelfile
    - Tener Ollama corriendo en segundo plano
"""

import ollama
import json

print("=" * 70)
print("  PRUEBA DEL MODELO CV-LILA-V1")
print("=" * 70)
print()

# Verificar que el modelo existe
try:
    models = ollama.list()
    model_names = [m['name'] for m in models.get('models', [])]
    
    if 'cv-lila-v1:latest' not in model_names and 'cv-lila-v1' not in model_names:
        print("❌ ERROR: Modelo 'cv-lila-v1' no encontrado en Ollama")
        print()
        print("Modelos disponibles:")
        for name in model_names:
            print(f"  - {name}")
        print()
        print("Para crear el modelo, ejecuta:")
        print("  1. cd model_cv_restaurante")
        print("  2. ollama create cv-lila-v1 -f Modelfile")
        exit(1)
    
    print("✓ Modelo 'cv-lila-v1' encontrado en Ollama")
    print()
    
except Exception as e:
    print(f"❌ ERROR conectando con Ollama: {e}")
    print()
    print("Verifica que Ollama esté corriendo:")
    print("  - Windows: Busca el ícono de Ollama en la bandeja del sistema")
    print("  - O ejecuta: ollama serve")
    exit(1)

# CVs de prueba
test_cases = [
    {
        "nombre_test": "Chef Experimentado",
        "cv": """
        CV - CARLOS MENDOZA
        Email: carlos.chef@gmail.com | Tel: 77889900
        
        EXPERIENCIA:
        - Chef de Partida en Hotel 5 estrellas (3 años)
        - Sous Chef en Restaurante La Casona (2 años)
        
        FORMACIÓN:
        - Técnico en Gastronomía
        - Curso de cocina molecular
        
        HABILIDADES:
        - Cocina internacional y fusión
        - Gestión de equipo de cocina
        - Control de costos
        """
    },
    {
        "nombre_test": "Sin Experiencia",
        "cv": """
        HOJA DE VIDA
        Juan Perez
        Tel: 68899001
        
        Busco trabajo.
        He trabajado en construcción.
        Quiero cambiar de rubro.
        """
    },
    {
        "nombre_test": "Mesera con Potencial",
        "cv": """
        CV - LUCIA TORRES
        Contacto: 76543210
        
        EXPERIENCIA:
        - Cajera en supermercado (1 año)
        - Atención al cliente en tienda (6 meses)
        
        HABILIDADES:
        - Amable y responsable
        - Manejo de caja
        - Me gusta la gastronomía
        """
    },
]

print("=" * 70)
print("EJECUTANDO PRUEBAS...")
print("=" * 70)
print()

for i, test in enumerate(test_cases, 1):
    print(f"[PRUEBA {i}/3] {test['nombre_test']}")
    print("-" * 70)
    
    try:
        # Llamar al modelo
        response = ollama.chat(
            model='cv-lila-v1',
            messages=[
                {
                    'role': 'user',
                    'content': f"Analiza el siguiente CV y responde en formato JSON:\n\n{test['cv']}"
                }
            ],
            format='json',  # Forzar formato JSON
            options={'temperature': 0.1}
        )
        
        # Parsear respuesta
        resultado = json.loads(response['message']['content'])
        
        # Mostrar resultado formateado
        print(f"📋 Nombre:       {resultado.get('nombre', 'N/A')}")
        print(f"📊 Puntuación:   {resultado.get('puntuacion', 0)}/100")
        print(f"💭 Razonamiento: {resultado.get('razonamiento', 'N/A')}")
        print(f"✅ Es Apto:      {'SÍ' if resultado.get('es_apto', False) else 'NO'}")
        print()
        
    except json.JSONDecodeError as e:
        print(f"❌ ERROR: El modelo no devolvió JSON válido")
        print(f"   Respuesta: {response['message']['content'][:200]}")
        print()
    except Exception as e:
        print(f"❌ ERROR: {e}")
        print()
    
    print()

print("=" * 70)
print("PRUEBAS COMPLETADAS")
print("=" * 70)
print()
print("¿Qué verificar?")
print()
print("✓ El modelo debería dar puntuaciones altas (80-95) al chef experimentado")
print("✓ Puntuaciones bajas (20-40) a candidatos sin experiencia")
print("✓ Puntuaciones medias (50-70) a candidatos con potencial")
print()
print("Si los resultados son coherentes, tu modelo está funcionando bien.")
print()
print("PRÓXIMO PASO:")
print("  Actualiza 'postulante_service.py' para usar model='cv-lila-v1'")
print()
