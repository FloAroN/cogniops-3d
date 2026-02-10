// 3D-Szene mit Three.js
let scene, camera, renderer, particles, geometry, material;
let mouseX = 0;
let mouseY = 0;

// Initialisierung wenn Seite geladen ist
window.addEventListener('load', init);

function init() {
    // Szene erstellen
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050508, 0.002);

    // Kamera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    // Renderer
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Canvas in Container einfügen
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Partikel-System erstellen
    createParticles();
    
    // Schwimmende geometrische Formen
    createFloatingShapes();

    // Event Listener
    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize);
    
    // Animation starten
    animate();

    // Statistik-Counter Animation
    initCounters();
    
    // 3D-Karten-Effekt
    initTiltEffect();
}

// Partikel-System (Neural Network Look)
function createParticles() {
    const particleCount = 1500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        // Zufällige Positionen im 3D-Raum
        positions[i * 3] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

        // Farben (Cyan und Magenta Mix)
        const color = new THREE.Color();
        if (Math.random() > 0.5) {
            color.setHex(0x00f3ff); // Cyan
        } else {
            color.setHex(0xff00ff); // Magenta
        }
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    material = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

// Schwimmende geometrische Formen
const shapes = [];
function createFloatingShapes() {
    // Geometrien erstellen
    const geometries = [
        new THREE.IcosahedronGeometry(5, 0),
        new THREE.OctahedronGeometry(4, 0),
        new THREE.TetrahedronGeometry(6, 0)
    ];
    
    const materials = [
        new THREE.MeshBasicMaterial({ 
            color: 0x00f3ff, 
            wireframe: true, 
            transparent: true, 
            opacity: 0.3 
        }),
        new THREE.MeshBasicMaterial({ 
            color: 0xff00ff, 
            wireframe: true, 
            transparent: true, 
            opacity: 0.3 
        }),
        new THREE.MeshBasicMaterial({ 
            color: 0x00ffff, 
            wireframe: true, 
            transparent: true, 
            opacity: 0.2 
        })
    ];

    for (let i = 0; i < 3; i++) {
        const mesh = new THREE.Mesh(geometries[i], materials[i]);
        
        // Zufällige Startposition
        mesh.position.x = (Math.random() - 0.5) * 100;
        mesh.position.y = (Math.random() - 0.5) * 100;
        mesh.position.z = (Math.random() - 0.5) * 50 - 20;
        
        // Eigene Geschwindigkeit
        mesh.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            },
            floatSpeed: Math.random() * 0.01 + 0.005,
            floatOffset: Math.random() * Math.PI * 2
        };
        
        scene.add(mesh);
        shapes.push(mesh);
    }
}

// Maus-Interaktion
function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Parallax-Effekt für Partikel
    if (particles) {
        particles.rotation.x += mouseY * 0.001;
        particles.rotation.y += mouseX * 0.001;
    }
}

// Fenstergröße anpassen
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    
    // Partikel rotation
    if (particles) {
        particles.rotation.y += 0.001;
        particles.rotation.x += 0.0005;
        
        // Partikel pulsieren
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(time + positions[i] * 0.05) * 0.02;
        }
        particles.geometry.attributes.position.needsUpdate = true;
    }
    
    // Schwimmende Formen animieren
    shapes.forEach((shape, index) => {
        // Rotation
        shape.rotation.x += shape.userData.rotationSpeed.x;
        shape.rotation.y += shape.userData.rotationSpeed.y;
        shape.rotation.z += shape.userData.rotationSpeed.z;
        
        // Auf und ab schweben
        shape.position.y += Math.sin(time * shape.userData.floatSpeed + shape.userData.floatOffset) * 0.02;
        
        // Langsame Kreisbewegung
        const radius = 20;
        shape.position.x += Math.cos(time * 0.1 + index) * 0.05;
        shape.position.z += Math.sin(time * 0.1 + index) * 0.05;
    });
    
    // Kamera folgt Maus leicht
    camera.position.x += (mouseX * 10 - camera.position.x) * 0.05;
    camera.position.y += (mouseY * 10 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    
    renderer.render(scene, camera);
}

// Counter Animation für Stats
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 30);
}

// 3D Tilt-Effekt für Karten
function initTiltEffect() {
    const cards = document.querySelectorAll('[data-tilt]');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

// Glitch-Effekt zufällig auslösen
setInterval(() => {
    const glitchElements = document.querySelectorAll('.glitch');
    const randomElement = glitchElements[Math.floor(Math.random() * glitchElements.length)];
    randomElement.style.animation = 'none';
    setTimeout(() => {
        randomElement.style.animation = '';
    }, 100);
}, 5000);

// Konsole Easter Egg
console.log('%c COGNIOPS NEURAL SYSTEM v2.0 ', 'background: #00f3ff; color: #000; font-size: 20px; font-weight: bold; padding: 10px;');
console.log('%c >> Direct neural interface established ', 'color: #00f3ff; font-size: 14px;');
console.log('%c >> Awaiting deployment commands... ', 'color: #ff00ff; font-size: 14px;');