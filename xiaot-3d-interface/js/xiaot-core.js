/**
 * 小T 核心版 - 极简设计 + 情绪颜色
 * 只保留：球体 + 多面体 + 粒子
 * 核心颜色随情绪变化
 */

class XiaotInterface {
    constructor(options = {}) {
        this.config = {
            container: '#container',
            theme: 'xiaot',  // 默认主题
            particles: true,
            autostart: true,
            ...options
        };

        this.themes = {
            xiaot: { primary: 0x00FFFF, accent: 0x00FFFF, particle: 0x00FFFF },  // 小T主题 - 青色
            cyan: { primary: 0x00FFFF, accent: 0x00FFFF, particle: 0x00FFFF },
            purple: { primary: 0x6B5BFF, accent: 0x8888FF, particle: 0x8888FF },
            orange: { primary: 0xFF6B00, accent: 0xFFAA00, particle: 0xFFAA00 }
        };

        // 情绪颜色系统
        this.emotions = {
            calm: { color: 0x00FFFF, name: '青色' },      // 平静 - 青色
            happy: { color: 0xFFDD00, name: '黄色' },     // 开心 - 黄色
            excited: { color: 0xFF6B00, name: '橙色' },   // 兴奋 - 橙色
            sad: { color: 0x6B5BFF, name: '紫色' },       // 悲伤 - 紫色
            serious: { color: 0xFF3333, name: '红色' },   // 严肃 - 红色
            thinking: { color: 0x00FF88, name: '绿色' },  // 思考 - 绿色
            listening: { color: 0xFF69B4, name: '粉色' }  // 聆听 - 粉色
        };

        this.currentEmotion = 'calm';
        this.currentTheme = 'jarvis';

        this.particleCount = 800;
        this.baseRadius = 2.5;
        this.originalPositions = null;
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particleSystem = null;
        this.core = null;
        this.wireframe = null;
        this.isInitialized = false;
        this.clock = new THREE.Clock();

        if (this.config.autostart) {
            this.init();
        }
    }

    init() {
        if (this.isInitialized) return;

        const container = document.querySelector(this.config.container);
        if (!container) return;

        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || window.innerHeight;

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.02);

        this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        this.camera.position.z = 8;

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 1);
        container.appendChild(this.renderer.domElement);

        // 灯光
        const light = new THREE.DirectionalLight(0xffffff, 0.5);
        light.position.set(5, 5, 5);
        this.scene.add(light);
        this.scene.add(new THREE.AmbientLight(0x404040, 0.3));

        // 创建核心
        this.createCore();
        this.createParticles();

        this.animate();
        window.addEventListener('resize', () => this.onResize());

        this.isInitialized = true;
        console.log('✅ 小T Core initialized!');
    }

    createCore() {
        const emotionColor = this.emotions[this.currentEmotion].color;

        // 核心球体
        const coreGeo = new THREE.SphereGeometry(1.0, 64, 64);
        const coreMat = new THREE.MeshStandardMaterial({
            color: emotionColor,
            metalness: 0.9,
            roughness: 0.1,
            emissive: emotionColor,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.95
        });
        this.core = new THREE.Mesh(coreGeo, coreMat);
        this.scene.add(this.core);

        // 多面体网格
        const wireGeo = new THREE.IcosahedronGeometry(1.1, 1);
        const wireMat = new THREE.MeshBasicMaterial({
            color: emotionColor,
            wireframe: true,
            transparent: true,
            opacity: 0.5
        });
        this.wireframe = new THREE.Mesh(wireGeo, wireMat);
        this.scene.add(this.wireframe);

        // 内部发光
        const glowGeo = new THREE.SphereGeometry(0.95, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
            color: emotionColor,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        this.scene.add(glow);
    }

    createParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const sizes = [];
        const randoms = [];

        // 使用当前情绪颜色
        const emotionColor = new THREE.Color(this.emotions[this.currentEmotion].color);

        for (let i = 0; i < this.particleCount; i++) {
            const phi = Math.acos(2 * Math.random() - 1);
            const theta = Math.random() * Math.PI * 2;

            const x = this.baseRadius * Math.sin(phi) * Math.cos(theta);
            const y = this.baseRadius * Math.sin(phi) * Math.sin(theta);
            const z = this.baseRadius * Math.cos(phi);

            positions.push(x, y, z);

            // 颜色基于情绪色
            const color = new THREE.Color();
            color.setHSL(emotionColor.getHSL({}).h + (Math.random() - 0.5) * 0.1, 1, 0.5 + Math.random() * 0.4);
            colors.push(color.r, color.g, color.b);

            sizes.push(0.04 + Math.random() * 0.05);
            randoms.push(Math.random(), Math.random(), Math.random());
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        geometry.setAttribute('random', new THREE.Float32BufferAttribute(randoms, 3));

        const material = new THREE.PointsMaterial({
            size: 0.06,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            depthWrite: false
        });

        this.particleSystem = new THREE.Points(geometry, material);
        this.scene.add(this.particleSystem);
        this.originalPositions = new Float32Array(positions);
    }

    setEmotion(emotion) {
        if (!this.emotions[emotion]) return;
        
        this.currentEmotion = emotion;
        const emotionColor = this.emotions[emotion].color;
        const color = new THREE.Color(emotionColor);

        // 更新核心颜色
        if (this.core) {
            this.core.material.color = color;
            this.core.material.emissive = color;
        }

        // 更新网格颜色
        if (this.wireframe) {
            this.wireframe.material.color = color;
        }

        // 更新粒子颜色
        if (this.particleSystem) {
            const colors = this.particleSystem.geometry.attributes.color.array;
            for (let i = 0; i < this.particleCount; i++) {
                const baseHue = color.getHSL({}).h;
                const newColor = new THREE.Color();
                newColor.setHSL(baseHue + (Math.random() - 0.5) * 0.15, 1, 0.5 + Math.random() * 0.4);
                colors[i * 3] = newColor.r;
                colors[i * 3 + 1] = newColor.g;
                colors[i * 3 + 2] = newColor.b;
            }
            this.particleSystem.geometry.attributes.color.needsUpdate = true;
        }

        console.log(`😊 情绪: ${this.emotions[emotion].name} (${emotion})`);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = this.clock.getElapsedTime();
        const delta = this.clock.getDelta();

        if (!this.particleSystem) return;

        // 粒子动画
        const positions = this.particleSystem.geometry.attributes.position.array;
        const randoms = this.particleSystem.geometry.attributes.random.array;

        // 根据情绪调整动画参数
        let floatSpeed = 0.5;
        let rotationSpeed = 0.001;
        let pulseSpeed = 2;
        
        switch (this.currentEmotion) {
            case 'excited':
                floatSpeed = 1.5;
                rotationSpeed = 0.003;
                pulseSpeed = 4;
                break;
            case 'sad':
                floatSpeed = 0.3;
                rotationSpeed = 0.0005;
                pulseSpeed = 1;
                break;
            case 'thinking':
                floatSpeed = 0.8;
                rotationSpeed = 0.002;
                pulseSpeed = 2.5;
                break;
            case 'happy':
                floatSpeed = 1.0;
                rotationSpeed = 0.0015;
                pulseSpeed = 3;
                break;
            default: // calm, listening
                floatSpeed = 0.5;
                rotationSpeed = 0.001;
                pulseSpeed = 2;
        }

        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            const originalI3 = i * 3;

            const ox = this.originalPositions[originalI3];
            const oy = this.originalPositions[originalI3 + 1];
            const oz = this.originalPositions[originalI3 + 2];

            const noiseX = Math.sin(time * floatSpeed + randoms[i3] * 10) * 0.03;
            const noiseY = Math.cos(time * floatSpeed * 0.8 + randoms[i3 + 1] * 10) * 0.03;
            const noiseZ = Math.sin(time * floatSpeed * 0.6 + randoms[i3 + 2] * 10) * 0.03;

            positions[i3] = ox + noiseX;
            positions[i3 + 1] = oy + noiseY;
            positions[i3 + 2] = oz + noiseZ;
        }

        this.particleSystem.geometry.attributes.position.needsUpdate = true;

        // 旋转
        this.particleSystem.rotation.y += rotationSpeed;
        this.wireframe.rotation.x += delta * 0.1 * floatSpeed;
        this.wireframe.rotation.y += delta * 0.08 * floatSpeed;

        // 核心呼吸
        const breath = 0.98 + Math.sin(time * pulseSpeed) * 0.025;
        this.core.scale.setScalar(breath);
        this.core.material.emissiveIntensity = 0.6 + Math.sin(time * pulseSpeed * 1.5) * 0.25;

        this.renderer.render(this.scene, this.camera);
    }

    // 音频律动
    reactToAudio(normalizedVolume, bass, mid, treble) {
        if (!this.particleSystem || !this.core) return;

        const positions = this.particleSystem.geometry.attributes.position.array;
        const randoms = this.particleSystem.geometry.attributes.random.array;

        const bassNorm = bass / 255;
        const midNorm = mid / 255;
        const trebleNorm = treble / 255;

        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            const originalI3 = i * 3;
            const randomFactor = randoms[i * 3];

            const ox = this.originalPositions[originalI3];
            const oy = this.originalPositions[originalI3 + 1];
            const oz = this.originalPositions[originalI3 + 2];

            let exp = 1;
            if (randomFactor < 0.33) exp = 1 + bassNorm * 0.25;
            else if (randomFactor < 0.66) exp = 1 + midNorm * 0.15;
            else exp = 1 + trebleNorm * 0.1;

            // 添加基础动画 + 音频响应
            const time = this.clock.getElapsedTime();
            let floatSpeed = 0.5;
            if (this.currentEmotion === 'excited') floatSpeed = 1.5;
            
            const noiseX = Math.sin(time * floatSpeed + randoms[i3] * 10) * 0.03;
            const noiseY = Math.cos(time * floatSpeed * 0.8 + randoms[i3 + 1] * 10) * 0.03;
            const noiseZ = Math.sin(time * floatSpeed * 0.6 + randoms[i3 + 2] * 10) * 0.03;

            positions[i3] = ox * (1 + bassNorm * 0.2) + noiseX;
            positions[i3 + 1] = oy * (1 + midNorm * 0.15) + noiseY;
            positions[i3 + 2] = oz * (1 + trebleNorm * 0.1) + noiseZ;
        }

        this.particleSystem.geometry.attributes.position.needsUpdate = true;

        // 核心脉冲
        const pulse = 0.98 + normalizedVolume * 0.18;
        this.core.scale.setScalar(pulse);
        this.core.material.emissiveIntensity = 0.6 + normalizedVolume * 0.6;

        // 旋转加速
        this.particleSystem.rotation.y += 0.002 + normalizedVolume * 0.008;
    }

    // API
    setTheme(theme) {
        if (this.themes[theme]) {
            this.currentTheme = theme;
            console.log(`🎨 Theme: ${theme}`);
        }
    }

    setParticlesEnabled(enabled) {
        if (this.particleSystem) {
            this.particleSystem.visible = enabled;
        }
    }

    onResize() {
        const container = document.querySelector(this.config.container);
        if (!container) return;
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.domElement.remove();
        }
        this.isInitialized = false;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = XiaotInterface;
}
