let scene, camera, renderer, horseModel;
let flipSpeed = 0.15; // Mais rápido para flip contínuo
let flipDirection = 1; // 1 para direita, -1 para esquerda
let chaosLevel = 0.8; // Aumentei o caos
let flipAngle = 0;

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Efeitos visuais
    createSpeedLines();

    // Camera - ajustada para ver melhor a diagonal
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 10);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('container').appendChild(renderer.domElement);

    // Luzes para destacar a diagonal
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Luz principal vindo da diagonal superior direita
    const mainLight = new THREE.DirectionalLight(0xffaa66, 1.5);
    mainLight.position.set(5, 5, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    // Luz de preenchimento da diagonal oposta
    const fillLight = new THREE.DirectionalLight(0x66aaff, 0.8);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

    // Luz de destaque
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.9);
    rimLight.position.set(-3, 0, -5);
    scene.add(rimLight);

    // Load Horse model
    const loader = new THREE.GLTFLoader();
    loader.load('./3d/horse.glb', function(gltf) {
        horseModel = gltf.scene;
        scene.add(horseModel);
        
        // Centralizar
        const isMobile = window.innerWidth <= 768;
        const scale = isMobile ? 2.2 : 2.8;
        horseModel.scale.set(scale, scale, scale);
        horseModel.position.set(0, 0, 0);
        
        // POSIÇÃO DIAGONAL: 45 graus no eixo Y
        // Para a cabeça ficar para ESQUERDA, precisamos rotacionar
        horseModel.rotation.y = -Math.PI / 4; // -45 graus (cabeça para esquerda)
        
        // Inclinar levemente para visualização diagonal
        horseModel.rotation.x = Math.PI / 12; // 15 graus para baixo
        horseModel.rotation.z = Math.PI / 24; // 7.5 graus para lado
        
        console.log('Cavalo carregado na diagonal!');
        
        // Iniciar animação de flip
        startFlipAnimation();
        
    }, undefined, function(error) {
        console.error('Erro ao carregar:', error);
        createDiagonalHorse();
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        if (horseModel) {
            // FLIP CONTÍNUO PARA DIREITA
            // Rotação principal em torno do eixo Z (para flip lateral)
            flipAngle += flipSpeed * flipDirection;
            
            // Reset do ângulo para evitar overflow
            if (flipAngle > Math.PI * 2) flipAngle -= Math.PI * 2;
            
            // Aplicar rotação de flip (principalmente no eixo X e Z para efeito diagonal)
            horseModel.rotation.x = Math.PI / 12 + Math.sin(flipAngle) * 0.5;
            horseModel.rotation.z = Math.PI / 24 + flipAngle * 0.8;
            
            // Manter a rotação diagonal base
            horseModel.rotation.y = -Math.PI / 4 + Math.sin(flipAngle * 0.3) * 0.2;
            
            // Efeito caótico: pequenas variações aleatórias
            if (chaosLevel > 0) {
                const time = Date.now() * 0.001;
                horseModel.rotation.x += Math.sin(time * 2.3) * 0.05 * chaosLevel;
                horseModel.rotation.y += Math.cos(time * 1.7) * 0.03 * chaosLevel;
                horseModel.rotation.z += Math.sin(time * 3.1) * 0.04 * chaosLevel;
            }
            
            // Movimento de "pulo" durante o flip
            const bounce = Math.sin(flipAngle * 2) * 0.1;
            horseModel.position.y = bounce;
            
            // Leve oscilação lateral
            const sway = Math.sin(flipAngle * 0.5) * 0.05;
            horseModel.position.x = sway;
        }

        // Atualizar efeitos de velocidade
        updateSpeedLines();

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function startFlipAnimation() {
    // Configurar flip rápido e contínuo
    flipSpeed = 0.18; // Mais rápido
    flipDirection = 1; // Para direita
    chaosLevel = 0.9; // Máximo caos
    flipAngle = 0;
    
    console.log('Flip contínuo iniciado!');
}

function createDiagonalHorse() {
    const group = new THREE.Group();
    
    // CORPO - orientado na diagonal
    const bodyGeometry = new THREE.BoxGeometry(3, 1.5, 5);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x8B4513,
        shininess: 50,
        specular: 0x222222
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    
    // Rotacionar o corpo para diagonal
    body.rotation.y = -Math.PI / 4;
    group.add(body);
    
    // CABEÇA - virada para ESQUERDA
    const headGeometry = new THREE.CylinderGeometry(0.7, 0.5, 2, 8);
    const headMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    
    // Posicionar cabeça na diagonal (frente-esquerda)
    head.position.set(2, 1, -1.5);
    head.rotation.z = Math.PI / 8;
    head.rotation.y = Math.PI / 6;
    group.add(head);
    
    // PESCOÇO
    const neckGeometry = new THREE.CylinderGeometry(0.6, 0.7, 1.5, 8);
    const neck = new THREE.Mesh(neckGeometry, headMaterial);
    neck.position.set(1, 0.8, -0.8);
    neck.rotation.z = -Math.PI / 12;
    neck.rotation.y = -Math.PI / 8;
    group.add(neck);
    
    // PERNAS - posicionadas na diagonal
    const legGeometry = new THREE.CylinderGeometry(0.3, 0.25, 2.2, 8);
    const legMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    
    // Posições das pernas considerando diagonal
    const legPositions = [
        { x: -1, y: -1.6, z: -2 },   // Frente esquerda
        { x: -1, y: -1.6, z: 1.5 },   // Trás esquerda  
        { x: 1, y: -1.6, z: -1.5 },   // Frente direita
        { x: 1, y: -1.6, z: 2 }       // Trás direita
    ];
    
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(pos.x, pos.y, pos.z);
        group.add(leg);
    });
    
    // CAUDA - na diagonal traseira
    const tailGeometry = new THREE.CylinderGeometry(0.12, 0.06, 2, 6);
    const tailMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(-1.8, 0.3, 1.5);
    tail.rotation.x = Math.PI / 4;
    tail.rotation.y = Math.PI / 3;
    group.add(tail);
    
    // CRINA - no pescoço
    for (let i = 0; i < 6; i++) {
        const maneGeometry = new THREE.ConeGeometry(0.18, 0.9, 5);
        const maneMaterial = new THREE.MeshPhongMaterial({ color: 0x111111 });
        const mane = new THREE.Mesh(maneGeometry, maneMaterial);
        mane.position.set(1.5, 1.5 + i * 0.18, -1.2);
        mane.rotation.x = Math.PI / 2;
        mane.rotation.z = Math.PI / 3;
        group.add(mane);
    }
    
    horseModel = group;
    scene.add(horseModel);
    
    // Escala e posição
    const isMobile = window.innerWidth <= 768;
    const scale = isMobile ? 2.0 : 2.6;
    horseModel.scale.set(scale, scale, scale);
    horseModel.position.set(0, 0, 0);
    
    // ROTAÇÃO INICIAL DIAGONAL
    // Cabeça para esquerda: rotação Y negativa
    horseModel.rotation.y = -Math.PI / 4; // -45 graus
    
    // Inclinar para visualização 3D
    horseModel.rotation.x = Math.PI / 12; // 15 graus
    horseModel.rotation.z = Math.PI / 24; // 7.5 graus
    
    console.log('Cavalo diagonal criado!');
    
    startFlipAnimation();
}

function createSpeedLines() {
    // Linhas de velocidade para efeito visual
    const linesCount = 60;
    const lineGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(linesCount * 6); // 2 pontos por linha
    const colors = new Float32Array(linesCount * 6);
    
    for (let i = 0; i < linesCount; i++) {
        const angle = (i / linesCount) * Math.PI * 2;
        const radius = 8 + Math.random() * 6;
        const height = (Math.random() - 0.5) * 8;
        
        // Ponto inicial (mais perto do centro)
        const startIndex = i * 6;
        positions[startIndex] = Math.cos(angle) * (radius * 0.3);
        positions[startIndex + 1] = height * 0.3;
        positions[startIndex + 2] = Math.sin(angle) * (radius * 0.3);
        
        // Ponto final (mais longe)
        positions[startIndex + 3] = Math.cos(angle) * radius;
        positions[startIndex + 4] = height;
        positions[startIndex + 5] = Math.sin(angle) * radius;
        
        // Cores (gradiente do centro para fora)
        const colorIntensity = 0.3 + Math.random() * 0.7;
        for (let j = 0; j < 2; j++) {
            const colorIndex = startIndex + j * 3;
            colors[colorIndex] = 0.8 * colorIntensity;     // R
            colors[colorIndex + 1] = 0.4 * colorIntensity; // G
            colors[colorIndex + 2] = 0.1 * colorIntensity; // B
        }
    }
    
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    const speedLines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(speedLines);
    
    scene.userData.speedLines = {
        mesh: speedLines,
        geometry: lineGeometry,
        speed: 0.05
    };
}

function updateSpeedLines() {
    if (scene.userData.speedLines) {
        const lines = scene.userData.speedLines;
        const positions = lines.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 6) {
            // Mover pontos para fora (efeito de explosão)
            const dx = positions[i] * 1.01 - positions[i];
            const dy = positions[i + 1] * 1.01 - positions[i + 1];
            const dz = positions[i + 2] * 1.01 - positions[i + 2];
            
            positions[i] += dx;
            positions[i + 1] += dy;
            positions[i + 2] += dz;
            positions[i + 3] += dx * 1.1;
            positions[i + 4] += dy * 1.1;
            positions[i + 5] += dz * 1.1;
            
            // Reset quando ficar muito longe
            const dist = Math.sqrt(
                positions[i] * positions[i] + 
                positions[i + 1] * positions[i + 1] + 
                positions[i + 2] * positions[i + 2]
            );
            
            if (dist > 20) {
                const angle = Math.random() * Math.PI * 2;
                const radius = 2 + Math.random() * 3;
                const height = (Math.random() - 0.5) * 4;
                
                positions[i] = Math.cos(angle) * radius;
                positions[i + 1] = height;
                positions[i + 2] = Math.sin(angle) * radius;
                
                positions[i + 3] = Math.cos(angle) * (radius * 1.5);
                positions[i + 4] = height * 1.2;
                positions[i + 5] = Math.sin(angle) * (radius * 1.5);
            }
        }
        
        lines.geometry.attributes.position.needsUpdate = true;
        
        // Rotação das linhas com o flip
        lines.mesh.rotation.y += lines.speed * flipDirection;
    }
}

init();

// Copy button (mantido)
function initCopyButton() {
    const copyBtn = document.getElementById('copyBtn');
    const contractText = document.getElementById('contractText');
    
    if (!copyBtn || !contractText) return;
    
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(contractText.textContent);
            copyBtn.textContent = 'COPIED!';
            copyBtn.classList.add('copied');
            
            // Efeito visual ao copiar
            chaosLevel = 1.2;
            setTimeout(() => {
                chaosLevel = 0.9;
            }, 500);
            
            setTimeout(() => {
                copyBtn.textContent = 'COPY';
                copyBtn.classList.remove('copied');
            }, 2000);
        } catch (err) {
            // Fallback
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCopyButton);
} else {
    initCopyButton();
}
