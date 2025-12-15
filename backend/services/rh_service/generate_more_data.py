"""
GENERADOR AUTOMÁTICO DE CVs PARA DATASET
========================================

Este script genera CVs sintéticos adicionales para expandir tu dataset.

USO:
    python generate_more_data.py --cantidad 20

El script genera CVs variados con:
- Nombres bolivianos realistas
- Experiencia en gastronomía
- Diferentes roles (chef, mesero, cajero, etc.)
- Formación variada
- Casos aptos y no aptos
"""

import json
import random
from typing import Dict, List

# Datos para generación
NOMBRES = [
    "Juan", "María", "Carlos", "Ana", "Luis", "Carmen", "Jorge", "Rosa",
    "Pedro", "Lucia", "Daniel", "Patricia", "Miguel", "Laura", "Fernando",
    "Gabriela", "Roberto", "Silvia", "Ricardo", "Andrea", "Mauricio", "Valeria",
    "Ernesto", "Carolina", "Diego", "Sandra", "Felipe", "Isabel", "Oscar",
    "Beatriz", "Ramiro", "Daniela", "Alejandro", "Veronica"
]

APELLIDOS = [
    "Perez", "Mamani", "Quispe", "Rodriguez", "Fernandez", "Morales", 
    "Gutierrez", "Solis", "Copa", "Mendoza", "Montaño", "Choque", "Ríos",
    "Vega", "Suarez", "Flores", "Paz", "Lopez", "Torres", "Sánchez",
    "Melgar", "Delgado", "Vargas", "Castillo", "Cruz", "Ticona", "Molina",
    "Aguilar", "Arce", "Rocha", "Pinto"
]

CIUDADES = ["Santa Cruz", "La Paz", "Cochabamba", "Tarija", "Sucre", "Oruro"]

ROLES_EXPERIENCIA = {
    "Chef": {
        "exp_años": (3, 12),
        "lugares": ["Hotel 5 estrellas", "Restaurante de autor", "Crucero internacional", 
                   "Resort & Spa", "Club empresarial", "Restaurante Gustu"],
        "habilidades": ["cocina internacional", "gestión de equipo", "control de costos",
                       "desarrollo de menús", "cocina molecular", "cocina fusión"],
        "formacion": ["Le Cordon Bleu", "Técnico en Gastronomía", "Chef profesional",
                     "Escuela de Hostelería", "Diplomado en cocina"],
        "puntuacion": (85, 98),
        "apto": True
    },
    "Mesero": {
        "exp_años": (1, 5),
        "lugares": ["Restaurante El Hornito", "Café La Esquina", "Restaurante Michelangelo",
                   "Hotel Los Tajibos", "Pizzería Don Giuseppe"],
        "habilidades": ["atención al cliente", "manejo de POS", "trabajo en equipo",
                       "conocimiento de vinos", "servicio francés"],
        "formacion": ["Curso de mesero", "Bachiller", "Capacitación en servicio"],
        "puntuacion": (70, 90),
        "apto": True
    },
    "Cocinero": {
        "exp_años": (1, 6),
        "lugares": ["Restaurante familiar", "Comedor universitario", "Catering de eventos",
                   "Restaurante de comida rápida", "Cocina central"],
        "habilidades": ["preparación de alimentos", "trabajo bajo presión", "técnicas de corte",
                       "manejo de parrilla", "cocina criolla"],
        "formacion": ["Técnico en cocina", "INFOCAL", "Curso básico de cocina"],
        "puntuacion": (60, 85),
        "apto": True
    },
    "Ayudante": {
        "exp_años": (0, 2),
        "lugares": ["Comedor popular", "Restaurante local", "Cocina de eventos"],
        "habilidades": ["limpieza", "preparación básica", "responsabilidad"],
        "formacion": ["Secundaria completa", "Carnet de salud"],
        "puntuacion": (45, 70),
        "apto": True
    },
    "Cajero": {
        "exp_años": (1, 4),
        "lugares": ["Restaurante", "Supermercado", "Farmacia", "Tienda comercial"],
        "habilidades": ["manejo de caja", "facturación", "atención al cliente", "arqueo"],
        "formacion": ["Bachiller", "Curso de cajero"],
        "puntuacion": (60, 80),
        "apto": True
    },
    "Sin_Experiencia": {
        "exp_años": (0, 0),
        "lugares": ["Construcción", "Vendedor ambulante", "Ninguno"],
        "habilidades": ["ganas de aprender", "puntualidad"],
        "formacion": ["Secundaria incompleta", "Bachiller"],
        "puntuacion": (20, 40),
        "apto": False
    }
}

def generar_telefono() -> str:
    """Genera un número de teléfono boliviano."""
    prefijos = ["77", "76", "75", "73", "72", "71", "70", "69", "68", "60"]
    return f"{random.choice(prefijos)}{random.randint(100000, 999999)}"

def generar_cv(rol: str, datos_rol: Dict) -> Dict:
    """Genera un CV sintético basado en el rol."""
    
    nombre = f"{random.choice(NOMBRES)} {random.choice(APELLIDOS)}"
    if random.random() < 0.3:  # 30% con segundo apellido
        nombre += f" {random.choice(APELLIDOS)}"
    
    telefono = generar_telefono()
    
    # Generar correo (70% tienen)
    tiene_correo = random.random() < 0.7
    if tiene_correo:
        nombre_email = nombre.split()[0].lower()
        apellido_email = nombre.split()[1].lower()
        dominios = ["gmail.com", "hotmail.com", "outlook.com", "mail.com"]
        correo = f"{nombre_email}.{apellido_email}@{random.choice(dominios)}"
    else:
        correo = None
    
    # Experiencia
    años = random.randint(*datos_rol["exp_años"])
    
    # Construir texto del CV
    cv_partes = []
    cv_partes.append(f"CV - {nombre.upper()}")
    cv_partes.append(f"Teléfono: {telefono}")
    if correo:
        cv_partes.append(f"Email: {correo}")
    cv_partes.append("")
    
    if años > 0:
        cv_partes.append("EXPERIENCIA:")
        num_trabajos = min(años, random.randint(1, 3))
        for _ in range(num_trabajos):
            lugar = random.choice(datos_rol["lugares"])
            tiempo = random.randint(1, años)
            cv_partes.append(f"- {rol} en {lugar} ({tiempo} {'año' if tiempo == 1 else 'años'})")
    else:
        cv_partes.append("Sin experiencia laboral previa.")
    
    cv_partes.append("")
    
    # Habilidades
    if datos_rol["habilidades"]:
        cv_partes.append("HABILIDADES:")
        num_habilidades = random.randint(2, min(4, len(datos_rol["habilidades"])))
        habs = random.sample(datos_rol["habilidades"], num_habilidades)
        for hab in habs:
            cv_partes.append(f"- {hab.capitalize()}")
        cv_partes.append("")
    
    # Formación
    if datos_rol["formacion"]:
        cv_partes.append("FORMACIÓN:")
        form = random.choice(datos_rol["formacion"])
        cv_partes.append(f"- {form}")
    
    cv_texto = "\n".join(cv_partes)
    
    # Generar output JSON
    puntuacion = random.randint(*datos_rol["puntuacion"])
    
    # Razonamiento basado en puntuación
    if puntuacion >= 85:
        razones = [
            f"Amplia experiencia de {años} años en el sector. Formación sólida y habilidades avanzadas.",
            f"Perfil altamente calificado con {años} años de trayectoria. Excelente para posiciones de liderazgo.",
            f"Candidato excepcional con formación profesional y experiencia comprobada de {años} años."
        ]
    elif puntuacion >= 65:
        razones = [
            f"Experiencia relevante de {años} años. Buen candidato con habilidades transferibles.",
            f"Perfil sólido con {años} años en el sector. Capacidad demostrada de desempeño.",
            f"Candidato competente con {años} años de experiencia práctica."
        ]
    elif puntuacion >= 45:
        razones = [
            "Experiencia limitada pero muestra potencial. Requiere capacitación inicial.",
            "Habilidades básicas presentes. Podría desarrollarse con entrenamiento adecuado.",
            "Candidato con actitud positiva pero poca experiencia específica."
        ]
    else:
        razones = [
            "Sin experiencia relevante en gastronomía. Formación insuficiente.",
            "Perfil no alineado con requisitos del sector. Falta experiencia específica.",
            "Habilidades no transferibles al sector gastronómico."
        ]
    
    razonamiento = random.choice(razones)
    
    output = {
        "nombre": nombre,
        "puntuacion": puntuacion,
        "razonamiento": razonamiento,
        "es_apto": datos_rol["apto"]
    }
    
    # Crear ejemplo completo
    ejemplo = {
        "instruction": "Eres un reclutador experto para restaurantes. Analiza el CV y extrae: nombre, puntuacion (0-100), razonamiento breve, y si es_apto (true/false). Responde en formato JSON.",
        "input": cv_texto,
        "output": json.dumps(output, ensure_ascii=False)
    }
    
    return ejemplo

def generar_dataset(cantidad: int = 20) -> List[Dict]:
    """Genera un dataset completo."""
    dataset = []
    
    # Distribución de roles (ponderada)
    roles_pesos = {
        "Chef": 0.15,
        "Mesero": 0.25,
        "Cocinero": 0.20,
        "Ayudante": 0.20,
        "Cajero": 0.10,
        "Sin_Experiencia": 0.10
    }
    
    for _ in range(cantidad):
        # Seleccionar rol según pesos
        rol = random.choices(
            list(roles_pesos.keys()),
            weights=list(roles_pesos.values())
        )[0]
        
        ejemplo = generar_cv(rol, ROLES_EXPERIENCIA[rol])
        dataset.append(ejemplo)
    
    return dataset

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Generar CVs sintéticos para dataset")
    parser.add_argument("--cantidad", type=int, default=20, help="Cantidad de CVs a generar")
    parser.add_argument("--output", type=str, default="dataset_extra.jsonl", help="Archivo de salida")
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("GENERADOR DE CVs SINTÉTICOS")
    print("=" * 60)
    print(f"\nGenerando {args.cantidad} CVs...")
    
    dataset = generar_dataset(args.cantidad)
    
    # Guardar en archivo JSONL
    with open(args.output, 'w', encoding='utf-8') as f:
        for ejemplo in dataset:
            f.write(json.dumps(ejemplo, ensure_ascii=False) + '\n')
    
    print(f"✓ {args.cantidad} CVs generados exitosamente")
    print(f"✓ Guardados en: {args.output}")
    print()
    print("Distribución por rol:")
    
    # Contar roles
    from collections import Counter
    roles_count = Counter()
    for ej in dataset:
        # Detectar rol por contenido
        output = json.loads(ej["output"])
        if output["puntuacion"] >= 85:
            roles_count["Chef/Profesional"] += 1
        elif output["puntuacion"] >= 65:
            roles_count["Mesero/Cocinero"] += 1
        elif output["puntuacion"] >= 45:
            roles_count["Ayudante/Junior"] += 1
        else:
            roles_count["Sin experiencia"] += 1
    
    for rol, count in roles_count.most_common():
        print(f"  - {rol}: {count}")
    
    print()
    print("SIGUIENTE PASO:")
    print(f"  1. Combina con dataset original:")
    print(f"     cat dataset.jsonl {args.output} > dataset_completo.jsonl")
    print(f"  2. Actualiza train_model_unsloth.py para usar dataset_completo.jsonl")
    print(f"  3. Reentrena el modelo con más datos")
    print()

if __name__ == "__main__":
    main()
