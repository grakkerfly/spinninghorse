let scene, camera, renderer, horseModel;
let flipSpeed = 0.05; // Velocidade base do flip
let isFlipping = true;
let currentRotation = { x: 0, y: 0, z: 0 };
let targetRotation = { x: 0, y: 0, z: 0 };
let rotationAxis = new THREE.Vector3(1, 1, 0).normalize(); // Eixo diagonal
let chaosIntensity = 0.3; // Quão caótico é o flip

function init() {
    // Scene com fundo caótico
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Adicionar efeitos visuais
    createVisualEffects();

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8;
    camera.position.y = 0.5; // Levemente acima para melhor visualização

    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('container').appendChild(renderer.domElement);

    // Luzes - iluminação dramática
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Luz direcional principal
    const directionalLight = new THREE.DirectionalLight(0xffaa00, 1.2);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = false;
    scene.add(directionalLight);

    // Luz lateral para contraste
    const sideLight = new THREE.DirectionalLight(0x00aaff, 0.8);
    sideLight.position.set(-5, 3, -5);
    scene.add(sideLight);

    // Luz de preenchimento
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(0, -5, 5);
    scene.add(fillLight);

    // Load Horse model
    const loader = new THREE.GLTFLoader();
    loader.load('./3d/horse.glb', function(gltf) {
        horseModel = gltf.scene;
        scene.add(horseModel);
        
        // Centralizar e ajustar escala
        const isMobile = window.innerWidth <= 768;
        const scale = isMobile ? 2.0 : 2.5;
        horseModel.scale.set(scale, scale, scale);
        
        // Posicionar no centro da tela
        horseModel.position.set(0, 0, 0);
        
        // Rotação inicial diagonal (45 graus em X e Y)
        horseModel.rotation.x = Math.PI / 6; // 30 graus
        horseModel.rotation.y = Math.PI / 4; // 45 graus
        
        console.log('Spinning Horse 3D carregado!');
        
        // Configurar eixos de rotação para o flip
        setupFlipAnimation();
        
    }, undefined, function(error) {
        console.error('Erro ao carregar o modelo:', error);
        createFallbackHorse();
    });

    // Remover todos os event listeners de mouse
    // Não vamos usar interação com mouse neste caso

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Aplicar rotação de flip contínua
        if (horseModel && isFlipping) {
            // Rotação principal - flip como um skate
            horseModel.rotation.x += flipSpeed * Math.sin(Date.now() * 0.001) * chaosIntensity;
            horseModel.rotation.y += flipSpeed * 1.5; // Rotação principal mais rápida no Y
            horseModel.rotation.z += flipSpeed * Math.cos(Date.now() * 0.001) * chaosIntensity * 0.5;
            
            // Adicionar pequenas variações caóticas
            const time = Date.now() * 0.002;
            horseModel.rotation.x += Math.sin(time * 1.7) * 0.01 * chaosIntensity;
            horseModel.rotation.z += Math.cos(time * 1.3) * 0.008 * chaosIntensity;
            
            // Oscilação na velocidade para simular impulso do flip
            const speedVariation = 1 + Math.sin(Date.now() * 0.0008) * 0.3;
            const currentFlipSpeed = flipSpeed * speedVariation;
            
            // Aplicar rotação adicional baseada no eixo diagonal
            horseModel.rotateOnAxis(rotationAxis, currentFlipSpeed * 1.2);
            
            // Pequena oscilação vertical (como se estivesse "pulando" durante o flip)
            const bounce = Math.sin(Date.now() * 0.003) * 0.05;
            horseModel.position.y = bounce;
            
            // Rotação caótica extra (aumenta o efeito "maluco")
            if (chaosIntensity > 0.1) {
                horseModel.rotation.x += (Math.random() - 0.5) * 0.02 * chaosIntensity;
                horseModel.rotation.z += (Math.random() - 0.5) * 0.015 * chaosIntensity;
            }
        }

        // Atualizar efeitos visuais
        updateVisualEffects();

        renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Recentralizar se necessário
        if (horseModel) {
            horseModel.position.set(0, 0, 0);
        }
    });
}

function setupFlipAnimation() {
    // Configurar parâmetros do flip
    flipSpeed = 0.08; // Velocidade base do flip
    chaosIntensity = 0.4; // Intensidade do caos
    
    // Definir eixo diagonal para rotação
    rotationAxis = new THREE.Vector3(1, 1, 0.3).normalize();
    
    // Iniciar animação
    isFlipping = true;
    
    console.log('Animação de flip configurada!');
}

function createFallbackHorse() {
    // Criar um cavalo básico com geometrias Three.js
    const group = new THREE.Group();
    
    // Corpo (principal)
    const bodyGeometry = new THREE.BoxGeometry(2.5, 1.2, 4);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x8B4513,
        shininess: 30
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);
    
    // Cabeça
    const headGeometry = new THREE.CylinderGeometry(0.6, 0.4, 1.8, 8);
    const headMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(1.8, 0.6, 0);
    head.rotation.z = -Math.PI / 8;
    group.add(head);
    
    // Pescoço
    const neckGeometry = new THREE.CylinderGeometry(0.5, 0.6, 1.2, 8);
    const neck = new THREE.Mesh(neckGeometry, headMaterial);
    neck.position.set(0.8, 0.8, 0);
    neck.rotation.z = Math.PI / 6;
    group.add(neck);
    
    // Pernas
    const legGeometry = new THREE.CylinderGeometry(0.25, 0.2, 2, 8);
    const legMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    
    const legPositions = [
        { x: -0.8, y: -1.5, z: -1.2 }, // Frente esquerda
        { x: -0.8, y: -1.5, z: 1.2 },  // Trás esquerda
        { x: 0.8, y: -1.5, z: -1.2 },  // Frente direita
        { x: 0.8, y: -1.5, z: 1.2 }    // Trás direita
    ];
    
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(pos.x, pos.y, pos.z);
        group.add(leg);
    });
    
    // Cauda
    const tailGeometry = new THREE.CylinderGeometry(0.1, 0.05, 1.8, 6);
    const tailMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(-1.5, 0.2, 0);
    tail.rotation.x = Math.PI / 3;
    tail.rotation.z = -Math.PI / 8;
    group.add(tail);
    
    // Crina
    const maneGeometry = new THREE.ConeGeometry(0.15, 0.8, 6);
    const maneMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    
    for (let i = 0; i < 5; i++) {
        const mane = new THREE.Mesh(maneGeometry, maneMaterial);
        mane.position.set(1.2, 1.2 + i * 0.15, 0);
        mane.rotation.x = Math.PI / 2;
        mane.rotation.z = Math.PI / 4;
        group.add(mane);
    }
    
    horseModel = group;
    scene.add(horseModel);
    
    // Centralizar e ajustar escala
    const isMobile = window.innerWidth <= 768;
    const scale = isMobile ? 1.8 : 2.2;
    horseModel.scale.set(scale, scale, scale);
    horseModel.position.set(0, 0, 0);
    
    // Rotação inicial diagonal
    horseModel.rotation.x = Math.PI / 6;
    horseModel.rotation.y = Math.PI / 4;
    
    console.log('Cavalo alternativo criado!');
    
    // Configurar animação
    setupFlipAnimation();
}

function createVisualEffects() {
    // Adicionar partículas para efeito de velocidade
    const particleCount = 200;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        // Partículas em um anel ao redor do centro
        const angle = Math.random() * Math.PI * 2;
        const radius = 6 + Math.random() * 8;
        const height = (Math.random() - 0.5) * 10;
        
        positions[i] = Math.cos(angle) * radius;
        positions[i + 1] = height;
        positions[i + 2] = Math.sin(angle) * radius;
        
        // Cores aleatórias brilhantes
        colors[i] = Math.random() * 0.5 + 0.5;     // R
        colors[i + 1] = Math.random() * 0.5 + 0.3; // G  
        colors[i + 2] = Math.random() * 0.5 + 0.1; // B
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.3,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    // Armazenar para animação
    scene.userData.particles = {
        system: particleSystem,
        geometry: particles,
        speed: 0.02
    };
}

function updateVisualEffects() {
    // Animar partículas
    if (scene.userData.particles) {
        const particles = scene.userData.particles;
        const positions = particles.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Mover partículas em espiral
            const angle = Math.atan2(positions[i + 2], positions[i]);
            const radius = Math.sqrt(positions[i] * positions[i] + positions[i + 2] * positions[i + 2]);
            
            const newAngle = angle + particles.speed;
            positions[i] = Math.cos(newAngle) * radius;
            positions[i + 2] = Math.sin(newAngle) * radius;
            
            // Movimento vertical suave
            positions[i + 1] += (Math.random() - 0.5) * 0.05;
        }
        
        particles.geometry.attributes.position.needsUpdate = true;
        
        // Rotação lenta do sistema de partículas
        particles.system.rotation.y += 0.001;
    }
}

init();

// Copy button functionality (mantido do código anterior)
function initCopyButton() {
    const copyBtn = document.getElementById('copyBtn');
    const contractText = document.getElementById('contractText');
    
    if (!copyBtn || !contractText) return;
    
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(contractText.textContent);
            copyBtn.textContent = 'COPIED!';
            copyBtn.classList.add('copied');
            
            setTimeout(() => {
                copyBtn.textContent = 'COPY';
                copyBtn.classList.remove('copied');
            }, 2000);
        } catch (err) {
            // Fallback para navegadores antigos
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

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCopyButton);
} else {
    initCopyButton();
}
