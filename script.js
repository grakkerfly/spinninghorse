let scene, camera, renderer, horseModel;
let baseRotationSpeed = 0.05;
let currentRotationSpeed = baseRotationSpeed;
let targetRotationSpeed = baseRotationSpeed;
let isChaosMode = false;
let chaosLevel = 0;
let chaosSound;
let raycaster, mouse;
let cameraOriginalZ = 5;
let cameraTargetZ = 5;
let isCameraAnimating = false;
let glitchEffect = 0;

function init() {
    // Scene with chaotic background
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Add some random floating particles for chaos effect
    createChaoticParticles();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = cameraOriginalZ;

    // Renderer with special effects
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('container').appendChild(renderer.domElement);

    // Load chaos sound
    chaosSound = new Audio();
    chaosSound.loop = true;
    // You can add a sound file here: chaosSound.src = './chaos.mp3';

    // Raycaster for click detection
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Lights - chaotic lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xff00ff, 1);
    directionalLight1.position.set(10, 10, 5);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0x00ffff, 0.8);
    directionalLight2.position.set(-10, -5, 5);
    scene.add(directionalLight2);

    const pointLight = new THREE.PointLight(0xffff00, 2, 20);
    pointLight.position.set(0, 0, 10);
    scene.add(pointLight);

    // Load Horse model
    const loader = new THREE.GLTFLoader();
    loader.load('./3d/horse.glb', function(gltf) {
        horseModel = gltf.scene;
        scene.add(horseModel);
        
        // Scale for mobile/desktop
        const isMobile = window.innerWidth <= 768;
        const scale = isMobile ? 1.8 : 2.2;
        horseModel.scale.set(scale, scale, scale);
        horseModel.position.y = 0;
        
        console.log('Spinning Horse 3D loaded successfully!');
        
        // Start automatic rotation
        animateRotation();
    }, undefined, function(error) {
        console.error('Error loading horse model:', error);
        // Create a fallback cube if model fails to load
        createFallbackHorse();
    });

    // Mouse move - control rotation speed
    document.addEventListener('mousemove', (e) => {
        if (!horseModel) return;
        
        // Map mouse position to rotation speed (faster near edges)
        const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        
        // Calculate distance from center
        const distanceFromCenter = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
        
        // Increase speed based on distance from center and chaos level
        let speedMultiplier = 1 + distanceFromCenter * 3;
        if (isChaosMode) {
            speedMultiplier *= (2 + chaosLevel);
        }
        
        targetRotationSpeed = baseRotationSpeed * speedMultiplier;
        
        // Slight tilt based on mouse position
        horseModel.rotation.x = mouseY * 0.2;
        horseModel.rotation.z = -mouseX * 0.1;
    });

    // Click - toggle chaos mode
    document.addEventListener('click', (e) => {
        if (!horseModel) return;
        
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(horseModel, true);
        
        if (intersects.length > 0 || isChaosMode) {
            toggleChaosMode();
        }
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Smooth rotation speed transition
        if (horseModel) {
            currentRotationSpeed += (targetRotationSpeed - currentRotationSpeed) * 0.1;
            
            // Apply chaotic rotation
            if (isChaosMode) {
                // Extreme chaotic rotation with random variations
                horseModel.rotation.y += currentRotationSpeed * (1 + Math.sin(Date.now() * 0.01) * 0.5);
                horseModel.rotation.x += Math.sin(Date.now() * 0.005) * 0.1 * chaosLevel;
                horseModel.rotation.z += Math.cos(Date.now() * 0.003) * 0.08 * chaosLevel;
                
                // Random scale fluctuations
                const scaleFluctuation = 1 + Math.sin(Date.now() * 0.02) * 0.2 * chaosLevel;
                horseModel.scale.setScalar(scaleFluctuation * (window.innerWidth <= 768 ? 1.8 : 2.2));
                
                // Increase chaos level over time
                chaosLevel = Math.min(chaosLevel + 0.002, 3);
            } else {
                // Normal rotation
                horseModel.rotation.y += currentRotationSpeed;
                
                // Gradually decrease chaos level
                chaosLevel = Math.max(chaosLevel - 0.005, 0);
            }
        }

        // Camera animation for chaos mode
        if (isCameraAnimating) {
            camera.position.z += (cameraTargetZ - camera.position.z) * 0.1;
            if (Math.abs(cameraTargetZ - camera.position.z) < 0.05) {
                isCameraAnimating = false;
            }
        }

        // Apply glitch effect in chaos mode
        if (isChaosMode && Math.random() < chaosLevel * 0.3) {
            applyGlitchEffect();
        }

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function createChaoticParticles() {
    const particleCount = 500;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 100;
        positions[i + 1] = (Math.random() - 0.5) * 100;
        positions[i + 2] = (Math.random() - 0.5) * 100;
        
        colors[i] = Math.random();
        colors[i + 1] = Math.random();
        colors[i + 2] = Math.random();
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.6
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    // Animate particles
    function animateParticles() {
        const positions = particles.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += (Math.random() - 0.5) * 0.1;
            positions[i + 1] += (Math.random() - 0.5) * 0.1;
            positions[i + 2] += (Math.random() - 0.5) * 0.1;
        }
        particles.attributes.position.needsUpdate = true;
        requestAnimationFrame(animateParticles);
    }
    animateParticles();
}

function createFallbackHorse() {
    const group = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.BoxGeometry(2, 1.5, 3);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);
    
    // Head
    const headGeometry = new THREE.BoxGeometry(1, 1, 1.5);
    const headMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(1.5, 0.5, 0);
    group.add(head);
    
    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.5);
    const legMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    
    for (let i = 0; i < 4; i++) {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        const x = i < 2 ? -0.8 : 0.8;
        const z = i % 2 === 0 ? -1 : 1;
        leg.position.set(x, -1.2, z);
        group.add(leg);
    }
    
    // Tail
    const tailGeometry = new THREE.CylinderGeometry(0.1, 0.05, 1.5);
    const tailMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(-1, 0, 0);
    tail.rotation.z = Math.PI / 4;
    group.add(tail);
    
    horseModel = group;
    scene.add(horseModel);
    
    const isMobile = window.innerWidth <= 768;
    const scale = isMobile ? 1.8 : 2.2;
    horseModel.scale.set(scale, scale, scale);
    
    console.log('Fallback horse created!');
}

function toggleChaosMode() {
    if (isChaosMode) {
        // Exit chaos mode
        isChaosMode = false;
        targetRotationSpeed = baseRotationSpeed;
        cameraTargetZ = cameraOriginalZ;
        isCameraAnimating = true;
        if (chaosSound) {
            chaosSound.pause();
            chaosSound.currentTime = 0;
        }
        document.body.style.cursor = "url('horse.png') 16 16, pointer";
    } else {
        // Enter chaos mode
        isChaosMode = true;
        targetRotationSpeed = baseRotationSpeed * 5;
        cameraTargetZ = cameraOriginalZ - 2;
        isCameraAnimating = true;
        chaosLevel = 1;
        if (chaosSound) {
            chaosSound.play();
        }
        document.body.style.cursor = "url('horse.png') 16 16, grab";
        
        // Visual feedback
        document.body.style.animation = "none";
        setTimeout(() => {
            document.body.style.animation = "gradientBG 5s ease infinite";
        }, 10);
    }
}

function applyGlitchEffect() {
    const container = document.getElementById('container');
    container.style.transform = `translate(${(Math.random() - 0.5) * 10}px, ${(Math.random() - 0.5) * 10}px)`;
    container.style.filter = `hue-rotate(${Math.random() * 360}deg)`;
    
    setTimeout(() => {
        container.style.transform = 'translate(0, 0)';
        container.style.filter = 'none';
    }, 50);
}

function animateRotation() {
    // This function ensures continuous rotation
    if (horseModel && !isChaosMode) {
        horseModel.rotation.y += currentRotationSpeed;
    }
    requestAnimationFrame(animateRotation);
}

init();

// Copy button functionality
function initCopyButton() {
    const copyBtn = document.getElementById('copyBtn');
    const contractText = document.getElementById('contractText');
    
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(contractText.textContent);
            copyBtn.textContent = 'COPIED!';
            copyBtn.classList.add('copied');
            
            // Add chaotic effect on copy
            if (horseModel && !isChaosMode) {
                const originalSpeed = targetRotationSpeed;
                targetRotationSpeed = baseRotationSpeed * 3;
                setTimeout(() => {
                    targetRotationSpeed = originalSpeed;
                }, 500);
            }
            
            setTimeout(() => {
                copyBtn.textContent = 'COPY';
                copyBtn.classList.remove('copied');
            }, 2000);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = contractText.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            copyBtn.textContent = 'COPIED!';
            copyBtn.classList.add('copied');
            
            setTimeout(() => {
                copyBtn.textContent = 'COPY';
                copyBtn.classList.remove('copied');
            }, 2000);
        }
    });
}

initCopyButton();