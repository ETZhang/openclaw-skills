/**
 * 小T 3D Interface v4 - Jarvis Style
 * Based on Iron Man Jarvis Particle System
 */

class XiaotInterface {
    constructor(options = {}) {
        this.config = {
            container: '#xiaot-container',
            theme: 'jarvis',
            avatar: 'core',
            particles: true,
            autostart: true,
            width: window.innerWidth,
            height: window.innerHeight,
            ...options
        };

        // Jarvis配色
        this.themes = {
            jarvis: { 
                primary: 0x00FFFF,    // 青色
                secondary: 0x0099FF,
                accent: 0x00FFFF,
                glow: 0x00FFFF,
                ring: 0x00CCFF,
                particle: 0x00FFFF
            },
            hal: { 
                primary: 0xFF0000,
                secondary: 0xCC0000,
                accent: 0xFF3333,
                glow: 0xFF0000,
                ring: 0xFF0000,
                particle: 0xFF3333
            },
            gold: { 
                primary: 0xFFAA00,
                secondary: 0xFF8800,
                accent: 0xFFDD44,
                glow: 0xFFAA00,
                ring: 0xFFCC00,
                particle: 0xFFDD44
            }
        };

        // 粒子系统参数
        this.particleCount = 800;
        this.baseRadius = 2.0;
        this.targetRadius = 2.0;
        this.rotationSpeed = 0.001;
        this.originalPositions = null;
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particleSystem = null;
        this.core = null;
        this.rings = [];
        this.currentAnimation = 'idle';
        this.currentEmotion = 'calm';
        this.isInitialized = false;
        this.clock = new THREE.Clock();
        
        // 状态颜色
        this.colors = {
            idle: new THREE.Color(this.getThemeColor('primary')),
            speaking: new THREE.Color(this.getThemeColor('primary')),
            thinking: new THREE.Color(0x9C27B0),  // 紫色
            listening: new THREE.Color(0xFF9800)  // 橙色
        };
        this.currentColor = this.colors.idle.clone();

        if (this.config.autostart) {
            this.init();
        }
    }

    init() {
        if (this.isInitialized) return;

        const container = document.querySelector(this.config.container);
        if (!container) {
            console.error('❌ Container not found');
            return;
        }

        const width = container.clientWidth || this.config.width;
        const height = container.clientHeight || this.config.height;

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.015);

        this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        this.camera.position.z = 8;

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 1);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.5;
        container.appendChild(this.renderer.domElement);

        this.addLights();
        this.createCore();
        this.createRings();
        this.createParticles();
        this.createStatusDisplay();
        this.addGrid();

        window.addEventListener('resize', () => this.onResize());

        this.animate();
        this.isInitialized = true;
        console.log('✅ 小T Jarvis Style initialized!');
    }

    addLights() {
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.6);
        mainLight.position.set(5, 5, 5);
        this.scene.add(mainLight);

        const fillLight = new THREE.PointLight(this.getThemeColor('accent'), 0.4);
        fillLight.position.set(-5, 0, 5);
        this.scene.add(fillLight);

        const coreLight = new THREE.PointLight(this.getThemeColor('primary'), 1, 10);
        coreLight.position.set(0, 0, 0);
        this.scene.add(coreLight);
        this.coreLight = coreLight;
    }

    getThemeColor(type) {
        return this.themes[this.config.theme]?.[type] || this.themes.jarvis[type];
    }

    createCore() {
        // 核心球体
        const coreGeo = new THREE.SphereGeometry(1.0, 64, 64);
        const coreMat = new THREE.MeshStandardMaterial({
            color: this.getThemeColor('primary'),
            metalness: 0.9,
            roughness: 0.1,
            emissive: this.getThemeColor('primary'),
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.95
        });
        this.core = new THREE.Mesh(coreGeo, coreMat);
        this.scene.add(this.core);

        // 内部发光
        const innerGlowGeo = new THREE.SphereGeometry(0.95, 32, 32);
        const innerGlowMat = new THREE.MeshBasicMaterial({
            color: this.getThemeColor('accent'),
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const innerGlow = new THREE.Mesh(innerGlowGeo, innerGlowMat);
        this.scene.add(innerGlow);

        // 网格线
        const wireframeGeo = new THREE.IcosahedronGeometry(1.05, 2);
        const wireframeMat = new THREE.MeshBasicMaterial({
            color: this.getThemeColor('accent'),
            wireframe: true,
            transparent: true,
            opacity: 0.4
        });
        const wireframe = new THREE.Mesh(wireframeGeo, wireframeMat);
        this.scene.add(wireframe);
        this.wireframe = wireframe;

        // 顶部锥体
        const topGeo = new THREE.ConeGeometry(0.12, 0.4, 16);
        const topMat = new THREE.MeshStandardMaterial({
            color: this.getThemeColor('accent'),
            metalness: 0.8,
            roughness: 0.2,
            emissive: this.getThemeColor('accent'),
            emissiveIntensity: 1
        });
        const topCone = new THREE.Mesh(topGeo, topMat);
        topCone.position.y = 1.15;
        this.scene.add(topCone);

        // 底部光环
        const baseRingGeo = new THREE.TorusGeometry(1.5, 0.02, 16, 64);
        const baseRingMat = new THREE.MeshStandardMaterial({
            color: this.getThemeColor('ring'),
            emissive: this.getThemeColor('ring'),
            emissiveIntensity: 0.5,
            metalness: 0.9,
            roughness: 0.1
        });
        const baseRing = new THREE.Mesh(baseRingGeo, baseRingMat);
        baseRing.rotation.x = Math.PI / 2;
        baseRing.position.y = -1.3;
        this.scene.add(baseRing);
    }

    createRings() {
        const theme = this.getThemeColor('ring');
        const accent = this.getThemeColor('accent');
        
        // 多层同心圆环
        const ringConfigs = [
            { radius: 2.5, thickness: 0.015, speed: 0.4, tilt: 0 },
            { radius: 3.0, thickness: 0.012, speed: -0.3, tilt: 0.4 },
            { radius: 3.5, thickness: 0.01, speed: 0.5, tilt: -0.6 },
            { radius: 4.0, thickness: 0.015, speed: -0.4, tilt: 0.8 },
        ];

        ringConfigs.forEach((config, index) => {
            const ringGeo = new THREE.TorusGeometry(config.radius, config.thickness, 16, 128);
            const ringMat = new THREE.MeshStandardMaterial({
                color: theme,
                emissive: theme,
                emissiveIntensity: 0.4 + index * 0.1,
                metalness: 0.9,
                roughness: 0.1,
                transparent: true,
                opacity: 0.5 - index * 0.08
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2 + config.tilt;
            ring.position.z = Math.sin(config.tilt) * config.radius * 0.2;
            
            this.scene.add(ring);
            this.rings.push({
                mesh: ring,
                speed: config.speed,
                baseTilt: config.tilt
            });
        });
    }

    createParticles() {
        // Jarvis风格粒子 - 球面分布
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const sizes = [];
        const randoms = [];

        for (let i = 0; i < this.particleCount; i++) {
            // 球面分布 ( Jarvis 风格)
            const phi = Math.acos(2 * Math.random() - 1);
            const theta = Math.random() * Math.PI * 2;

            const x = this.baseRadius * Math.sin(phi) * Math.cos(theta);
            const y = this.baseRadius * Math.sin(phi) * Math.sin(theta);
            const z = this.baseRadius * Math.cos(phi);

            positions.push(x, y, z);

            // 颜色渐变
            const color = new THREE.Color();
            color.setHSL(0.5 + Math.random() * 0.1, 1, 0.5 + Math.random() * 0.5);
            colors.push(color.r, color.g, color.b);

            // 大小
            sizes.push(0.04 + Math.random() * 0.05);

            // 随机值用于动画
            randoms.push(Math.random(), Math.random(), Math.random());
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        geometry.setAttribute('random', new THREE.Float32BufferAttribute(randoms, 3));

        // 粒子材质
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

        // 保存原始位置
        this.originalPositions = new Float32Array(positions);
    }

    createStatusDisplay() {
        const statusCanvas = document.createElement('canvas');
        statusCanvas.width = 512;
        statusCanvas.height = 128;
        this.statusContext = statusCanvas.getContext('2d');
        this.statusTexture = new THREE.CanvasTexture(statusCanvas);

        const statusMaterial = new THREE.SpriteMaterial({
            map: this.statusTexture,
            transparent: true,
            opacity: 0.9
        });

        const statusSprite = new THREE.Sprite(statusMaterial);
        statusSprite.position.set(0, -3.5, 3);
        statusSprite.scale.set(6, 1.5, 1);
        this.scene.add(statusSprite);
        this.statusSprite = statusSprite;

        this.updateStatusDisplay({ cpu: 0, memory: 0, tasks: 0 });
    }

    updateStatusDisplay(status) {
        const ctx = this.statusContext;
        ctx.clearRect(0, 0, 512, 128);

        const themeColor = '#' + this.getThemeColor('primary').toString(16).padStart(6, '0');

        ctx.fillStyle = 'rgba(10, 10, 15, 0.9)';
        ctx.roundRect(0, 0, 512, 128, 20);
        ctx.fill();

        ctx.strokeStyle = themeColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Inter, sans-serif';
        ctx.fillText(`CPU ${status.cpu || 0}%`, 50, 55);
        ctx.fillText(`MEM ${status.memory || 0}%`, 200, 55);
        ctx.fillText(`TASKS ${status.tasks || 0}`, 350, 55);

        ctx.fillStyle = themeColor;
        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.fillText('🤖 小T', 50, 105);

        this.statusTexture.needsUpdate = true;
    }

    addGrid() {
        const gridHelper = new THREE.GridHelper(20, 40, 0x111111, 0x050505);
        gridHelper.position.y = -4;
        this.scene.add(gridHelper);
    }

    setState(state) {
        // 状态转换
        switch (state) {
            case 'idle':
                this.targetRadius = 2.0;
                this.rotationSpeed = 0.001;
                this.transitionColor(this.colors.idle);
                break;
            case 'speaking':
                this.targetRadius = 2.5;
                this.rotationSpeed = 0.002;
                this.transitionColor(this.colors.speaking);
                break;
            case 'thinking':
                this.targetRadius = 1.8;
                this.rotationSpeed = 0.005;
                this.transitionColor(this.colors.thinking);
                break;
            case 'listening':
                this.targetRadius = 2.2;
                this.rotationSpeed = 0.0015;
                this.transitionColor(this.colors.listening);
                break;
        }
    }

    transitionColor(targetColor) {
        const duration = 1500;
        const startColor = this.currentColor.clone();
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const t = Math.min(elapsed / duration, 1);
            const easeT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

            this.currentColor.lerpColors(startColor, targetColor, easeT);

            // 更新粒子颜色
            const colors = this.particleSystem.geometry.attributes.color.array;
            for (let i = 0; i < this.particleCount; i++) {
                const i3 = i * 3;
                colors[i3] = this.currentColor.r * (0.8 + Math.random() * 0.4);
                colors[i3 + 1] = this.currentColor.g * (0.8 + Math.random() * 0.4);
                colors[i3 + 2] = this.currentColor.b * (0.8 + Math.random() * 0.4);
            }
            this.particleSystem.geometry.attributes.color.needsUpdate = true;

            if (t < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        if (!this.particleSystem) return;

        // 更新粒子位置
        this.updateParticles(delta, time);

        // 核心脉冲
        const pulse = 0.98 + Math.sin(time * 2) * 0.02;
        this.core.scale.setScalar(pulse);
        this.core.material.emissiveIntensity = 0.6 + Math.sin(time * 3) * 0.2;

        // 网格旋转
        if (this.wireframe) {
            this.wireframe.rotation.x += delta * 0.2;
            this.wireframe.rotation.y += delta * 0.15;
        }

        // 圆环旋转
        this.rings.forEach((ringData) => {
            ringData.mesh.rotation.z += ringData.speed * 0.01;
        });

        // 中心光
        if (this.coreLight) {
            this.coreLight.intensity = 0.8 + Math.sin(time * 3) * 0.2;
        }

        this.renderer.render(this.scene, this.camera);
    }

    updateParticles(delta, time) {
        const positions = this.particleSystem.geometry.attributes.position.array;
        const randoms = this.particleSystem.geometry.attributes.random.array;

        // 平滑半径过渡
        const currentRadius = this.targetRadius;
        const radiusDiff = currentRadius - this.baseRadius;
        const expansion = 1 + radiusDiff * 0.15;

        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            const originalI3 = i * 3;

            const ox = this.originalPositions[originalI3];
            const oy = this.originalPositions[originalI3 + 1];
            const oz = this.originalPositions[originalI3 + 2];

            // 噪声动画 (Jarvis风格)
            const noiseX = Math.sin(time * 0.5 + randoms[i3] * 10) * 0.03;
            const noiseY = Math.cos(time * 0.3 + randoms[i3 + 1] * 10) * 0.03;
            const noiseZ = Math.sin(time * 0.4 + randoms[i3 + 2] * 10) * 0.03;

            positions[i3] = ox * expansion + noiseX;
            positions[i3 + 1] = oy * expansion + noiseY;
            positions[i3 + 2] = oz * expansion + noiseZ;
        }

        this.particleSystem.geometry.attributes.position.needsUpdate = true;

        // 整体旋转
        this.particleSystem.rotation.y += this.rotationSpeed;
    }

    // ========== Public API ==========

    setAnimation(animation) {
        this.currentAnimation = animation;
        this.setState(animation);
        console.log(`🎬 Animation: ${animation}`);
    }

    setEmotion(emotion) {
        this.currentEmotion = emotion;
        console.log(`😄 Emotion: ${emotion}`);
    }

    setWaveEnabled(enabled) {
        this.rotationSpeed = enabled ? 0.003 : 0.001;
    }

    setParticlesEnabled(enabled) {
        if (this.particleSystem) {
            this.particleSystem.visible = enabled;
        }
    }

    updateStatus(status) {
        if (this.statusSprite) {
            this.updateStatusDisplay(status);
        }
    }

    setTheme(theme) {
        if (this.themes[theme]) {
            this.config.theme = theme;
            console.log(`🎨 Theme: ${theme}`);
            this.dispose();
            this.init();
        }
    }

    cycleColor() {
        const colors = [
            new THREE.Color(0x00FFFF), // 青色
            new THREE.Color(0xFF00FF), // 紫色
            new THREE.Color(0xFFFF00), // 黄色
            new THREE.Color(0x00FF00), // 绿色
            new THREE.Color(0xFF0000), // 红色
        ];
        
        const currentIndex = colors.findIndex(c =>
            c.r === this.currentColor.r &&
            c.g === this.currentColor.g &&
            c.b === this.currentColor.b
        );
        
        const nextColor = colors[(currentIndex + 1) % colors.length];
        this.transitionColor(nextColor);
    }

    onResize() {
        const container = document.querySelector(this.config.container);
        if (!container || !this.camera || !this.renderer) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    dispose() {
        window.removeEventListener('resize', this.onResize);

        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.domElement.remove();
        }

        if (this.scene) {
            this.scene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(m => m.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }

        this.isInitialized = false;
        console.log('🔄 小T disposed');
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = XiaotInterface;
}
