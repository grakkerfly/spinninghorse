let scene, camera, renderer, horseModel;
let flipSpeed = 0.12;
let flipDirection = 1;
let chaosLevel = 0.7;
let flipAngle = 0;

let randomOffsetX = 0;
let randomOffsetY = 0;
let randomOffsetZ = 0;
let randomJitter = 0;
let targetJitter = 0;
let sideSway = 0;
let swayTime = 0;
let tiltVariation = 0;
let lastRandomUpdate = 0;
const RANDOM_UPDATE_INTERVAL = 400; // REDUZIDO para atualizações mais frequentes

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e56be);
    
    createSpeedLines();

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 10);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('container').appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffaa66, 1.5);
    mainLight.position.set(5, 5, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x66aaff, 0.8);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.9);
    rimLight.position.set(-3, 0, -5);
    scene.add(rimLight);

    const loader = new THREE.GLTFLoader();
    loader.load('./3d/horse.glb', function(gltf) {
        horseModel = gltf.scene;
        scene.add(horseModel);
        
        const isMobile = window.innerWidth <= 768;
        const scale = isMobile ? 2.2 : 2.8;
        horseModel.scale.set(scale, scale, scale);
        horseModel.position.set(0, 0, 0);
        
        // ROTAÇÃO INICIAL - APENAS Y e Z
        horseModel.rotation.y = -Math.PI / 4;
        horseModel.rotation.z = Math.PI / 24;
        // NÃO SETAR rotation.x AQUI - será controlado pela animação
        
        startFlipAnimation();
        
    }, undefined, function(error) {
        console.error('Error loading model:', error);
        createDiagonalHorse();
    });

    function animate() {
        requestAnimationFrame(animate);

        if (horseModel) {
            const currentTime = Date.now();
            
            // Atualiza aleatoriedades mais frequentemente
            if (currentTime - lastRandomUpdate > RANDOM_UPDATE_INTERVAL) {
                updateRandomness();
                lastRandomUpdate = currentTime;
            }
            
            // Rotação principal do flip (horário) com variação maior
            flipAngle -= flipSpeed * (0.8 + Math.random() * 0.4); // MAIS Variação
            
            // Mantém rotação Y e Z base
            horseModel.rotation.z = Math.PI / 24 + flipAngle * 0.8;
            horseModel.rotation.y = -Math.PI / 4;
            // NÃO setar rotation.x aqui - será feito em applyControlledChaos
            
            // Aplica a esquizofrenia intensificada
            applyControlledChaos(currentTime);
            
            // Bounce base
            const bounce = Math.sin(flipAngle * 2) * 0.1;
            
            // Vibração MUITO mais intensa
            const microVibration = Math.sin(currentTime * 0.02) * 0.15 * chaosLevel + 
                                  Math.sin(currentTime * 0.035) * 0.08 * chaosLevel;
            
            // Movimento lateral frenético
            swayTime += 0.04; // MAIS rápido
            sideSway = Math.sin(swayTime * 1.2) * 0.2 * chaosLevel + 
                      Math.sin(swayTime * 0.5) * 0.1 * chaosLevel;
            
            // Posição final COM TODOS OS EFEITOS INTENSIFICADOS
            horseModel.position.y = bounce + randomOffsetY + microVibration;
            horseModel.position.x = randomOffsetX + sideSway;
            horseModel.position.z = randomOffsetZ;
        }

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
    flipSpeed = 0.07;
    flipDirection = 1;
    chaosLevel = 0.8; // AUMENTADO para efeitos mais intensos
    flipAngle = 0;
}

function createDiagonalHorse() {
    const group = new THREE.Group();
    
    const bodyGeometry = new THREE.BoxGeometry(3, 1.5, 5);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x8B4513,
        shininess: 50,
        specular: 0x222222
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.y = -Math.PI / 4;
    group.add(body);
    
    const headGeometry = new THREE.CylinderGeometry(0.7, 0.5, 2, 8);
    const headMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(2, 1, -1.5);
    head.rotation.z = Math.PI / 8;
    head.rotation.y = Math.PI / 6;
    group.add(head);
    
    const neckGeometry = new THREE.CylinderGeometry(0.6, 0.7, 1.5, 8);
    const neck = new THREE.Mesh(neckGeometry, headMaterial);
    neck.position.set(1, 0.8, -0.8);
    neck.rotation.z = -Math.PI / 12;
    neck.rotation.y = -Math.PI / 8;
    group.add(neck);
    
    const legGeometry = new THREE.CylinderGeometry(0.3, 0.25, 2.2, 8);
    const legMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    
    const legPositions = [
        { x: -1, y: -1.6, z: -2 },
        { x: -1, y: -1.6, z: 1.5 },
        { x: 1, y: -1.6, z: -1.5 },
        { x: 1, y: -1.6, z: 2 }
    ];
    
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(pos.x, pos.y, pos.z);
        group.add(leg);
    });
    
    const tailGeometry = new THREE.CylinderGeometry(0.12, 0.06, 2, 6);
    const tailMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(-1.8, 0.3, 1.5);
    tail.rotation.x = Math.PI / 4;
    tail.rotation.y = Math.PI / 3;
    group.add(tail);
    
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
    
    const isMobile = window.innerWidth <= 768;
    const scale = isMobile ? 2.0 : 2.6;
    horseModel.scale.set(scale, scale, scale);
    horseModel.position.set(0, 0, 0);
    
    // Apenas Y e Z
    horseModel.rotation.y = -Math.PI / 4;
    horseModel.rotation.z = Math.PI / 24;
    // NÃO setar rotation.x
    
    startFlipAnimation();
}

function createSpeedLines() {
    const linesCount = 60;
    const lineGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(linesCount * 6);
    const colors = new Float32Array(linesCount * 6);
    
    for (let i = 0; i < linesCount; i++) {
        const angle = (i / linesCount) * Math.PI * 2;
        const radius = 8 + Math.random() * 6;
        const height = (Math.random() - 0.5) * 8;
        
        const startIndex = i * 6;
        positions[startIndex] = Math.cos(angle) * (radius * 0.3);
        positions[startIndex + 1] = height * 0.3;
        positions[startIndex + 2] = Math.sin(angle) * (radius * 0.3);
        
        positions[startIndex + 3] = Math.cos(angle) * radius;
        positions[startIndex + 4] = height;
        positions[startIndex + 5] = Math.sin(angle) * radius;
        
        const colorIntensity = 0.3 + Math.random() * 0.7;
        for (let j = 0; j < 2; j++) {
            const colorIndex = startIndex + j * 3;
            colors[colorIndex] = 0.8 * colorIntensity;
            colors[colorIndex + 1] = 0.4 * colorIntensity;
            colors[colorIndex + 2] = 0.1 * colorIntensity;
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
            const dx = positions[i] * 1.01 - positions[i];
            const dy = positions[i + 1] * 1.01 - positions[i + 1];
            const dz = positions[i + 2] * 1.01 - positions[i + 2];
            
            positions[i] += dx;
            positions[i + 1] += dy;
            positions[i + 2] += dz;
            positions[i + 3] += dx * 1.1;
            positions[i + 4] += dy * 1.1;
            positions[i + 5] += dz * 1.1;
            
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
        lines.mesh.rotation.z -= lines.speed * 0.5;
    }
}

function updateRandomness() {
    // Aleatoriedade MUITO aumentada
    randomOffsetX = (Math.random() - 0.5) * 0.3 * chaosLevel; // DOBROU
    randomOffsetY = (Math.random() - 0.5) * 0.2 * chaosLevel; // DOBROU
    randomOffsetZ = (Math.random() - 0.5) * 0.15 * chaosLevel; // QUASE DOBROU
    
    targetJitter = (Math.random() - 0.5) * 0.8 * chaosLevel; // DOBROU
    
    tiltVariation = (Math.random() - 0.5) * 0.15 * chaosLevel; // TRIPLICOU
}

function applyControlledChaos(currentTime) {
    const time = currentTime * 0.001;
    
    randomJitter += (targetJitter - randomJitter) * 0.1; // Mais rápido
    
    // INCLINAÇÃO DO TRONCO MUITO INTENSIFICADA (eixo X - cima/baixo)
    horseModel.rotation.x = Math.PI / 12 + // POSIÇÃO BASE
                          Math.sin(time * 2.3) * 0.25 * chaosLevel + // AUMENTADO 2.5x
                          Math.sin(time * 1.7) * 0.15 * chaosLevel + // AUMENTADO 3x
                          Math.sin(time * 3.8) * 0.08 * chaosLevel + // NOVA frequência
                          tiltVariation * 4; // QUADRUPLICADO
    
    // Rotação Z também com mais caos
    horseModel.rotation.z += Math.sin(time * 1.5) * 0.03 * chaosLevel + // TRIPLICADO
                           Math.sin(time * 2.1) * 0.02 * chaosLevel + // MAIS que DOBROU
                           Math.sin(time * 4.3) * 0.01 * chaosLevel + // NOVA frequência
                           randomJitter * 0.5; // AUMENTADO
    
    // Pequeno ajuste em Y para mais loucura
    horseModel.rotation.y += Math.sin(time * 0.9) * 0.01 * chaosLevel; // DOBROU
    
    // Inclinação da cabeça INTENSIFICADA
    const headTilt = Math.sin(time * 3.2) * 0.08 * chaosLevel + // DOBROU
                    Math.sin(time * 5.1) * 0.04 * chaosLevel; // NOVA frequência
    horseModel.rotation.x += headTilt;
    horseModel.rotation.z += headTilt * 0.7;
    
    // Vibração EXTRA no modelo inteiro
    const bodyVibration = Math.sin(time * 12.5) * 0.04 * chaosLevel +
                         Math.sin(time * 7.8) * 0.02 * chaosLevel;
    horseModel.rotation.x += bodyVibration;
    horseModel.rotation.y += bodyVibration * 0.3;
    horseModel.rotation.z += bodyVibration * 0.4;
}

function initCopyButton() {
    const copyBtn = document.getElementById('copyBtn');
    const contractText = document.getElementById('contractText');
    
    if (!copyBtn || !contractText) return;
    
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(contractText.textContent);
            copyBtn.textContent = 'COPIED!';
            copyBtn.classList.add('copied');
            
            chaosLevel = 1.5; // MAIS caos ao copiar
            setTimeout(() => {
                chaosLevel = 1.1; // Mantém mais alto
            }, 800); // Tempo maior
            
            setTimeout(() => {
                copyBtn.textContent = 'COPY';
                copyBtn.classList.remove('copied');
            }, 2000);
        } catch (err) {
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

init();
