// Luxus 3D Szene - Eine einzelne goldene Kugel mit sanfter Partikel-Atmosphäre
let scene, camera, renderer;
let goldSphere, particleSystem;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

window.addEventListener('load', init);

function init() {
    // Szene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.02);

    // Kamera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    // Renderer
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0a0a, 1);
    
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Goldene Kugel (Icosahedron für facettierten Luxus-Look)
    const geometry = new THREE.IcosahedronGeometry(4, 2);
    
    // Material: Gold, aber subtil und transparent
    const material = new THREE.MeshBasicMaterial({
        color: 0xc9a961,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    
    goldSphere = new THREE.Mesh(geometry, material);
    scene.add(goldSphere);

    // Äußere leuchtende Kugel (Glow-Effekt)
    const glowGeometry = new THREE.IcosahedronGeometry(4.2, 2);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xc9a961,
        transparent: true,
        opacity: 0.03,
        side: THREE.BackSide
    });
    const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
    goldSphere.add(glowSphere);

    // Partikel-Atmosphäre (sehr subtil, wenige Partikel)
    createAtmosphere();

    // Event Listeners
    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize);
    
    // Animation
    animate();
    
    // Counter Animation
    initCounters();
}

function createAtmosphere() {
    const particleCount = 200; // Weniger ist mehr (Luxus)
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        // Kugelförmige Verteilung um die Hauptkugel
        const radius = 10 + Math.random() * 20;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);

        // Gold/Weiß Mischung
        const color = new THREE.Color();
        if (Math.random() > 0.7) {
            color.setHex(0xc9a961); // Gold
        } else {
            color.setHex(0xffffff); // Weiß
        }
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
}

function onMouseMove(event) {
    // Sanfte Parallax-Bewegung
    mouseX = (event.clientX - window.innerWidth / 2) * 0.001;
    mouseY = (event.clientY - window.innerHeight / 2) * 0.001;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    // Sanfte Rotation der Kugel (langsam wie ein Luxus-Uhrwerk)
    goldSphere.rotation.y += 0.002;
    goldSphere.rotation.x = Math.sin(time * 0.5) * 0.1;

    // Partikel langsam rotieren
    if (particleSystem) {
        particleSystem.rotation.y = time * 0.05;
        
        // Partikel sanft pulsieren
        const positions = particleSystem.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const y = positions[i + 1];
            positions[i + 1] = y + Math.sin(time + positions[i] * 0.5) * 0.002;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    // Kamera folgt Maus sanft (Smooth Lerp)
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;
    
    camera.position.x = targetX * 5;
    camera.position.y = targetY * 5;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

// Counter Animation für Stats
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseFloat(entry.target.getAttribute('data-target'));
                const isFloat = target % 1 !== 0;
                animateCounter(entry.target, target, isFloat);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target, isFloat) {
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing-Funktion (Ease-Out-Quart)
        const ease = 1 - Math.pow(1 - progress, 4);
        
        const current = start + (target - start) * ease;
        
        if (isFloat) {
            element.textContent = current.toFixed(1);
        } else {
            element.textContent = Math.floor(current);
        }
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            if (isFloat) {
                element.textContent = target.toFixed(1);
            } else {
                element.textContent = target;
            }
        }
    }
    
    requestAnimationFrame(update);
}

// Smooth Scroll für Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Console
console.log('%c COGNIOPS ', 'background: #c9a961; color: #0a0a0a; font-size: 16px; padding: 10px; font-weight: 500;');
console.log('%c Autonomous Intelligence Systems ', 'color: #c9a961; font-size: 12px;');
