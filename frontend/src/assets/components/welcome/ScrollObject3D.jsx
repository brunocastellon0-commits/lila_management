
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

// ─── HOOK: Carga Three.js dinámicamente (evita bundle en SSR) ─────────────────
function useThree() {
  const [THREE, setTHREE] = useState(null);
  useEffect(() => {
    import('three').then(mod => setTHREE(mod));
  }, []);
  return THREE;
}

// ─── BUILDERS — constructores de geometría 3D procedural ─────────────────────

function buildShaker(THREE, scene) {
  const g = new THREE.Group();

  const silver = new THREE.MeshStandardMaterial({ color:0xd4cec0, metalness:0.92, roughness:0.1 });
  const gold   = new THREE.MeshStandardMaterial({ color:0xC8874E, metalness:0.85, roughness:0.18 });
  const accent = new THREE.MeshStandardMaterial({ color:0xE9C46A, metalness:0.9,  roughness:0.12 });

  // Cuerpo principal
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.62, 2.3, 64, 1, false), silver);
  body.castShadow = true;
  g.add(body);

  // Tapa cónica
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.45, 0.55, 48), gold);
  lid.position.y = 1.42;
  g.add(lid);

  // Cap semiesférico
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.21, 32, 16, 0, Math.PI*2, 0, Math.PI*0.55), gold);
  cap.position.y = 1.69;
  g.add(cap);

  // Anillos decorativos
  [-0.65, 0, 0.65].forEach(y => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.025, 16, 64), accent);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    g.add(ring);
  });

  // Base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.58, 0.18, 48), gold);
  base.position.y = -1.22;
  g.add(base);

  // Fondo redondeado
  const bottom = new THREE.Mesh(new THREE.SphereGeometry(0.62, 32, 16, 0, Math.PI*2, Math.PI*0.5, Math.PI*0.5), silver);
  bottom.position.y = -1.35;
  g.add(bottom);

  // Línea de costura (detalle realista)
  const seam = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.008, 8, 128), accent);
  seam.position.y = -1.22;
  seam.rotation.x = Math.PI / 2;
  g.add(seam);

  scene.add(g);
  return g;
}

function buildCoffeeBean(THREE, scene) {
  const g = new THREE.Group();

  const shell = new THREE.MeshStandardMaterial({ color:0x3D2008, metalness:0.04, roughness:0.72 });
  const crease = new THREE.MeshStandardMaterial({ color:0x160A02, metalness:0.02, roughness:0.9 });
  const shine  = new THREE.MeshStandardMaterial({ color:0x5C3010, metalness:0.1,  roughness:0.5 });

  // Cuerpo del grano — elipsoide
  const beanGeo = new THREE.SphereGeometry(1.2, 64, 48);
  const posAttr = beanGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    posAttr.setY(i, posAttr.getY(i) * 0.62);
    posAttr.setZ(i, posAttr.getZ(i) * 0.75);
    // Forma asimétrica del grano: un lado plano
    const xVal = posAttr.getX(i);
    if (xVal < 0) posAttr.setX(i, xVal * 0.85);
  }
  beanGeo.computeVertexNormals();
  g.add(new THREE.Mesh(beanGeo, shell));

  // Surco central — serie de esferas aplastadas
  for (let i = 0; i <= 12; i++) {
    const t = (i / 12 - 0.5) * 2;
    const creaseGeo = new THREE.SphereGeometry(0.08, 12, 8);
    const cm = new THREE.Mesh(creaseGeo, crease);
    cm.position.set(0, t * 1.1, 0.72);
    cm.scale.set(0.3, 1.0, 0.25);
    g.add(cm);
  }

  // Destello de grasa (los granos tostados brillan un poco)
  const shineGeo = new THREE.SphereGeometry(0.3, 16, 16);
  const shineMesh = new THREE.Mesh(shineGeo, shine);
  shineMesh.position.set(0.4, 0.3, 0.65);
  shineMesh.scale.set(1, 0.6, 0.3);
  g.add(shineMesh);

  g.rotation.x = 0.25;
  scene.add(g);
  return g;
}

function buildEspressoCup(THREE, scene) {
  const g = new THREE.Group();

  const ceramic = new THREE.MeshStandardMaterial({ color:0xF0EBE0, metalness:0.0, roughness:0.55 });
  const inner   = new THREE.MeshStandardMaterial({ color:0x12080400, metalness:0.0, roughness:0.3,
    side: THREE.BackSide });
  const esp     = new THREE.MeshStandardMaterial({ color:0x3D1808, metalness:0.05, roughness:0.35 });
  const accent  = new THREE.MeshStandardMaterial({ color:0xC8874E, metalness:0.45, roughness:0.25 });
  const crema   = new THREE.MeshStandardMaterial({ color:0xC8874E * 0.9, metalness:0.0, roughness:0.7,
    transparent:true, opacity:0.92 });

  // Copa exterior — perfil de taza espresso real (más ancha arriba)
  const cupGeo = new THREE.CylinderGeometry(0.72, 0.52, 1.05, 64);
  g.add(new THREE.Mesh(cupGeo, ceramic));

  // Interior (vacío visual)
  const innerGeo = new THREE.CylinderGeometry(0.64, 0.46, 0.98, 64);
  const innerMesh = new THREE.Mesh(innerGeo, new THREE.MeshStandardMaterial({
    color: 0x0A0502, metalness:0, roughness:0.5 }));
  innerMesh.position.y = 0.03;
  g.add(innerMesh);

  // Espresso (líquido oscuro)
  const espGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.04, 48);
  const espMesh = new THREE.Mesh(espGeo, esp);
  espMesh.position.y = 0.46;
  g.add(espMesh);

  // Crema (capa dorada arriba)
  const cremaGeo = new THREE.CylinderGeometry(0.61, 0.61, 0.025, 48);
  const cremaMesh = new THREE.Mesh(cremaGeo, new THREE.MeshStandardMaterial({
    color:0xC87830, metalness:0.1, roughness:0.6 }));
  cremaMesh.position.y = 0.49;
  g.add(cremaMesh);

  // Platillo
  const saucerTop = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.05, 0.1, 64), ceramic);
  saucerTop.position.y = -0.62;
  g.add(saucerTop);

  const saucerRim = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.06, 12, 64), ceramic);
  saucerRim.rotation.x = Math.PI / 2;
  saucerRim.position.y = -0.62;
  g.add(saucerRim);

  // Asa — curva Bezier
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0.72, 0.28, 0),
    new THREE.Vector3(1.38, 0.02, 0),
    new THREE.Vector3(0.72, -0.26, 0)
  );
  const handleGeo = new THREE.TubeGeometry(curve, 24, 0.075, 12, false);
  g.add(new THREE.Mesh(handleGeo, accent));

  // Monograma en el platillo (disco pequeño)
  const mono = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.015, 32), accent);
  mono.position.set(0, -0.56, 0);
  g.add(mono);

  g.position.y = 0.15;
  scene.add(g);
  return g;
}

// ─── LUCES ────────────────────────────────────────────────────────────────────
function setupLights(THREE, scene) {
  scene.add(new THREE.AmbientLight(0xfff0e0, 0.5));

  // Luz principal cálida
  const key = new THREE.PointLight(0xC8874E, 3.5, 18);
  key.position.set(4, 4, 4);
  key.castShadow = true;
  scene.add(key);

  // Luz de relleno teal (contraste fresco)
  const fill = new THREE.PointLight(0x2A9D8F, 1.8, 14);
  fill.position.set(-4, -1, 3);
  scene.add(fill);

  // Luz de contorno dorada
  const rim = new THREE.PointLight(0xE9C46A, 1.2, 12);
  rim.position.set(0, -3, -4);
  scene.add(rim);

  // Luz cenital suave
  const top = new THREE.DirectionalLight(0xfff8f0, 0.6);
  top.position.set(0, 8, 2);
  scene.add(top);

  return { key, fill, rim };
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

/**
 * @param {'shaker'|'bean'|'cup'} model  - Objeto a renderizar
 * @param {boolean} stickyMode           - true = modo Apple (sticky dentro de sección alta)
 * @param {number}  rotations            - Vueltas completas durante el scroll (default: 2)
 * @param {string}  height               - Altura del canvas (default: '100vh')
 */
export function ScrollObject3D({
  model      = 'shaker',
  stickyMode = false,
  rotations  = 2,
  height     = '100vh',
}) {
  const THREE = useThree();
  const canvasRef  = useRef(null);
  const sceneRef   = useRef(null);
  const rendRef    = useRef(null);
  const camRef     = useRef(null);
  const objRef     = useRef(null);
  const lightsRef  = useRef(null);
  const rafRef     = useRef(null);
  const mountRef   = useRef(null);

  // Scroll tracking
  const { scrollYProgress } = useScroll({
    target: stickyMode ? mountRef : undefined,
    offset: stickyMode ? ['start start', 'end end'] : ['start end', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });
  const rotY = useTransform(smoothProgress, [0, 1], [0, Math.PI * 2 * rotations]);

  // Init Three.js
  useEffect(() => {
    if (!THREE || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const W = canvas.parentElement.clientWidth;
    const H = canvas.parentElement.clientHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
    camera.position.set(0, 0.4, 5.5);
    camRef.current = camera;

    lightsRef.current = setupLights(THREE, scene);

    // Construye el modelo seleccionado
    const builders = { shaker: buildShaker, bean: buildCoffeeBean, cup: buildEspressoCup };
    const builder = builders[model] || buildShaker;
    objRef.current = builder(THREE, scene);

    // Partículas de ambiente (puntos de luz flotantes)
    const particleGeo = new THREE.BufferGeometry();
    const pCount = 80;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i*3]   = (Math.random() - 0.5) * 10;
      pPos[i*3+1] = (Math.random() - 0.5) * 10;
      pPos[i*3+2] = (Math.random() - 0.5) * 6 - 3;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const particleMat = new THREE.PointsMaterial({ color:0xC8874E, size:0.025, transparent:true, opacity:0.4 });
    scene.add(new THREE.Points(particleGeo, particleMat));

    // Render loop
    let frameTime = 0;
    function animate(t) {
      rafRef.current = requestAnimationFrame(animate);
      if (!objRef.current) return;

      // Float suave
      objRef.current.position.y = Math.sin(t * 0.001) * 0.12;

      // Luz key orbita lentamente
      if (lightsRef.current) {
        lightsRef.current.key.position.x = Math.cos(t * 0.0004) * 5;
        lightsRef.current.key.position.z = Math.sin(t * 0.0004) * 5;
      }

      renderer.render(scene, camera);
    }
    animate(0);

    // Resize handler
    const onResize = () => {
      if (!canvas.parentElement) return;
      const nW = canvas.parentElement.clientWidth;
      const nH = canvas.parentElement.clientHeight;
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
      renderer.setSize(nW, nH);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [THREE, model]);

  // Aplica la rotación del scroll al objeto
  useEffect(() => {
    return rotY.on('change', val => {
      if (objRef.current) objRef.current.rotation.y = val;
    });
  }, [rotY]);

  // ── MODO STICKY (efecto Apple) ─────────────────────────────────────────
  if (stickyMode) {
    return (
      <div ref={mountRef} style={{ position: 'relative' }}>
        <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
          <canvas
            ref={canvasRef}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          />
          {/* Overlay de texto que aparece/desaparece con el scroll */}
          <StickyTextOverlay scrollYProgress={smoothProgress} model={model} />
        </div>
      </div>
    );
  }

  // ── MODO SECCIÓN NORMAL ────────────────────────────────────────────────
  return (
    <div style={{ position: 'relative', height, overflow: 'hidden', borderRadius: 24 }}>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
      {/* Gradiente de integración con el fondo */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, width: '100%', height: '40%', pointerEvents: 'none',
        background: 'linear-gradient(to bottom, transparent, #1A1008)',
      }} />
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '30%', pointerEvents: 'none',
        background: 'linear-gradient(to top, transparent, #1A1008)',
      }} />
    </div>
  );
}

// ─── OVERLAY DE TEXTO PARA MODO STICKY ───────────────────────────────────────
function StickyTextOverlay({ scrollYProgress, model }) {
  const COPY = {
    shaker: [
      { range: [0, 0.25],  title: 'El arte del flair',      sub: 'Cada movimiento, calculado.' },
      { range: [0.25, 0.5], title: 'Precisión en cada giro', sub: 'La física al servicio del sabor.' },
      { range: [0.5, 0.75], title: 'Equilibrio perfecto',    sub: 'Temperatura. Dilución. Textura.' },
      { range: [0.75, 1],   title: 'Tu cóctel de autor',     sub: 'Disponible todas las noches.' },
    ],
    bean: [
      { range: [0, 0.33],  title: 'Origen de especialidad',  sub: 'Altura, suelo y microclima.' },
      { range: [0.33, 0.66], title: 'Tostado artesanal',     sub: 'Maillard reaction. Punto exacto.' },
      { range: [0.66, 1],  title: 'En tu taza, hoy',         sub: 'Frescura de 72 horas o menos.' },
    ],
    cup: [
      { range: [0, 0.4],   title: 'Extracción perfecta',     sub: '9 bares. 93°C. 28 segundos.' },
      { range: [0.4, 1],   title: 'La crema lo dice todo',   sub: 'Color avellana. Textura densa.' },
    ],
  };

  const steps = COPY[model] || COPY.shaker;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {steps.map((step, i) => {
        const opacity = useTransform(
          scrollYProgress,
          [step.range[0], step.range[0]+0.08, step.range[1]-0.08, step.range[1]],
          [0, 1, 1, 0]
        );
        return (
          <motion.div key={i} style={{ opacity, position: 'absolute', bottom: '12%', left: '8%' }}>
            <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:'0.2em',
              textTransform:'uppercase', color:'#C8874E', marginBottom:8 }}>
              {String(i+1).padStart(2,'0')} / {String(steps.length).padStart(2,'0')}
            </p>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(2rem,5vw,3.5rem)',
              fontWeight:400, color:'#F5F0E8', lineHeight:1.1, marginBottom:12 }}>
              {step.title}
            </h2>
            <p style={{ fontSize:16, fontWeight:300, color:'rgba(245,240,232,0.55)',
              fontFamily:"'DM Sans',sans-serif" }}>
              {step.sub}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}


// ─── VARIANTE LISTA PARA USO INMEDIATO EN welcome.jsx ────────────────────────
/**
 * CoffeeScrollSection — Drop-in replacement para usar en welcome.jsx
 *
 * Crea una sección de 250vh con la coctelera 3D sticky y textos de scroll.
 *
 * Colócalo entre la sección Hero y la Galería:
 *   <CoffeeScrollSection model="shaker" />
 */
export function CoffeeScrollSection({ model = 'shaker' }) {
  return (
    <section style={{ height: '250vh', position: 'relative' }}>
      <ScrollObject3D model={model} stickyMode rotations={1.5} />
    </section>
  );
}