/**
 * 小T 3D Interface - 贾维斯风格AI助手
 * Three.js WebGL渲染
 */

class XiaotInterface {
    constructor(options = {}) {
        // 默认配置
        this.config = {
            container: '#xiaot-container',
            theme: 'blue',
            avatar: 'robot',
            particles: true,
            autostart: true,
            width: window.innerWidth,
            height: window.innerHeight,
            ...options
        };

        // 主题颜色
        this.themes = {
            blue: { primary: 0x3b82f6, secondary: 0x1d4ed8, accent: 0x60a5fa, particle: 0x3b82f6, glow: 0x6366f1 },
            orange: { primary: 0xf97316, secondary: 0xea580c, accent: 0xfb923c, particle: 0xf97316, glow: 0xf59e0b },
            purple: { primary: 0x8b5cf6, secondary: 0x7c3aed, accent: 0xa78bfa, particle: 0x8b5cf6, glow: 0xa855f7 },
            cyan: { primary: 0x06b6d4, secondary: 0x0891b2, accent: 0x22d3ee, particle: 0x06b6d4, glow: 0x06b6d4 },
            dark: { primary: 0x6366f1, secondary: 0x4f46e5, accent: 0x818cf8, particle: 0x818cf8, glow: 0xa5b4fc }
        };

        // 状态
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.avatar = null;
        this.particles = null;
        this.waveMesh = null;
        this.currentAnimation = 'idle';
        this.currentEmotion = 'calm';
        this.isInitialized = false;
        this.clock = new THREE.Clock();

        // 动画参数
        this.animParams = {
            floatSpeed: 1.0,
            floatAmplitude: 0.1,
            eyeOpen: 1.0,
            mouthOpen: 0.0,
            glowIntensity: 0.5,
            particleSpeed: 1.0,
            waveAmplitude: 0.1
        };

        // 初始化
        if (this.config.autostart) {
            this.init();
        }
    }

    init() {
        if (this.isInitialized) return;

        const container = document.querySelector(this.config.container);
        if (!container) {
            console.error('❌ 小T: Container not found:', this.config.container);
            return;
        }

        const width = container.clientWidth || this.config.width;
        const height = container.clientHeight || this.config.height;

        // 创建场景
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x0a0a0f, 0.02);

        // 创建相机
        this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        this.camera.position.z = 5;

        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x0a0a0f, 1);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        container.appendChild(this.renderer.domElement);

        // 添加光源
        this.addLights();

        // 创建头像
        this.createAvatar();

        // 创建粒子系统
        if (this.config.particles) {
            this.createParticles();
        }

        // 创建语音波形
        this.createWaveform();

        // 创建光晕效果
        this.createGlow();

        // 创建系统状态显示
        this.createStatusDisplay();

        // 添加环境装饰
        this.addDecorations();

        // 开始动画循环
        this.animate();

        // 处理窗口大小变化
        window.addEventListener('resize', () => this.onResize());

        this.isInitialized = true;
        console.log('✅ 小T 3D Interface initialized');
    }

    addLights() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);

        // 主光源
        const mainLight = new THREE.DirectionalLight(0xffffff, 1);
        mainLight.position.set(5, 5, 5);
        this.scene.add(mainLight);

        // 背光
        const backLight = new THREE.PointLight(this.getThemeColor('accent'), 0.5);
        backLight.position.set(-5, 0, -5);
        this.scene.add(backLight);

        // 底部光
        const bottomLight = new THREE.PointLight(this.getThemeColor('primary'), 0.3);
        bottomLight.position.set(0, -5, 0);
        this.scene.add(bottomLight);
    }

    getThemeColor(type) {
        return this.themes[this.config.theme]?.[type] || this.themes.blue[type];
    }

    createAvatar() {
        // 头像组
        this.avatar = new THREE.Group();

        // 身体
        const bodyGeometry = new THREE.CapsuleGeometry(0.5, 1, 8, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: this.getThemeColor('primary'),
            metalness: 0.3,
            roughness: 0.7,
            emissive: this.getThemeColor('primary'),
            emissiveIntensity: 0.1
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0;
        this.avatar.add(body);
        this.avatar.body = body;

        // 头部
        const headGeometry = new THREE.SphereGeometry(0.6, 32, 32);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: this.getThemeColor('secondary'),
            metalness: 0.4,
            roughness: 0.6,
            emissive: this.getThemeColor('secondary'),
            emissiveIntensity: 0.15
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.2;
        this.avatar.add(head);
        this.avatar.head = head;

        // 眼睛组（用于动画）
        this.avatar.eyes = new THREE.Group();
        this.avatar.eyes.position.y = 1.25;
        this.avatar.add(this.avatar.eyes);

        // 左眼
        const leftEyeGeometry = new THREE.SphereGeometry(0.12, 16, 16);
        const leftEyeMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 0.8,
            metalness: 0.1,
            roughness: 0.2
        });
        const leftEye = new THREE.Mesh(leftEyeGeometry, leftEyeMaterial);
        leftEye.position.set(-0.2, 0, 0.5);
        this.avatar.eyes.add(leftEye);
        this.avatar.leftEye = leftEye;

        // 右眼
        const rightEye = new THREE.Mesh(leftEyeGeometry, leftEyeMaterial);
        rightEye.position.set(0.2, 0, 0.5);
        this.avatar.eyes.add(rightEye);
        this.avatar.rightEye = rightEye;

        // 眼睛发光环
        const eyeRingGeometry = new THREE.TorusGeometry(0.15, 0.02, 8, 16);
        const eyeRingMaterial = new THREE.MeshStandardMaterial({
            color: this.getThemeColor('accent'),
            emissive: this.getThemeColor('accent'),
            emissiveIntensity: 1,
            metalness: 0.8,
            roughness: 0.2
        });
        const leftEyeRing = new THREE.Mesh(eyeRingGeometry, eyeRingMaterial);
        leftEyeRing.position.copy(leftEye.position);
        leftEyeRing.lookAt(this.camera.position);
        this.avatar.eyes.add(leftEyeRing);
        this.avatar.leftEyeRing = leftEyeRing;

        const rightEyeRing = new THREE.Mesh(eyeRingGeometry, eyeRingMaterial.clone());
        rightEyeRing.position.copy(rightEye.position);
        rightEyeRing.lookAt(this.camera.position);
        this.avatar.eyes.add(rightEyeRing);
        this.avatar.rightEyeRing = rightEyeRing;

        // 嘴巴
        const mouthGeometry = new THREE.TorusGeometry(0.1, 0.03, 8, 16, Math.PI);
        const mouthMaterial = new THREE.MeshStandardMaterial({
            color: this.getThemeColor('accent'),
            emissive: this.getThemeColor('accent'),
            emissiveIntensity: 0.5,
            metalness: 0.5,
            roughness: 0.3
        });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, 1.0, 0.55);
        mouth.rotation.x = Math.PI;
        this.avatar.add(mouth);
        this.avatar.mouth = mouth;

        // 天线
        const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
        const antennaMaterial = new THREE.MeshStandardMaterial({
            color: this.getThemeColor('primary'),
            metalness: 0.6,
            roughness: 0.4,
            emissive: this.getThemeColor('primary'),
            emissiveIntensity: 0.3
        });
        const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
        antenna.position.y = 1.8;
        this.avatar.add(antenna);
        this.avatar.antenna = antenna;

        // 天线顶部发光球
        const antennaTopGeometry = new THREE.SphereGeometry(0.06, 16, 16);
        const antennaTopMaterial = new THREE.MeshStandardMaterial({
            color: this.getThemeColor('accent'),
            emissive: this.getThemeColor('accent'),
            emissiveIntensity: 1,
            metalness: 0.1,
            roughness: 0.2
        });
        const antennaTop = new THREE.Mesh(antennaTopGeometry, antennaTopMaterial);
        antennaTop.position.y = 1.95;
        this.avatar.add(antennaTop);
        this.avatar.antennaTop = antennaTop;

        // 耳朵/翅膀
        const wingGeometry = new THREE.ConeGeometry(0.2, 0.6, 4);
        const wingMaterial = new THREE.MeshStandardMaterial({
            color: this.getThemeColor('primary'),
            metalness: 0.5,
            roughness: 0.5,
            transparent: true,
            opacity: 0.8,
            emissive: this.getThemeColor('primary'),
            emissiveIntensity: 0.2
        });

        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.set(-0.7, 1.2, 0);
        leftWing.rotation.z = Math.PI / 6;
        leftWing.rotation.y = Math.PI / 12;
        this.avatar.add(leftWing);
        this.avatar.leftWing = leftWing;

        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        rightWing.position.set(0.7, 1.2, 0);
        rightWing.rotation.z = -Math.PI / 6;
        rightWing.rotation.y = -Math.PI / 12;
        this.avatar.add(rightWing);
        this.avatar.rightWing = rightWing;

        // 底座光环
        const ringGeometry = new THREE.TorusGeometry(1.2, 0.02, 16, 64);
        const ringMaterial = new THREE.MeshStandardMaterial({
            color: this.getThemeColor('primary'),
            emissive: this.getThemeColor('primary'),
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.6,
            metalness: 0.8,
            roughness: 0.2
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -0.8;
        this.avatar.add(ring);
        this.avatar.ring = ring;

        // 浮动底座
        const baseGeometry = new THREE.CylinderGeometry(1.5, 1.8, 0.1, 32);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            metalness: 0.8,
            roughness: 0.3,
            transparent: true,
            opacity: 0.9
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = -1.0;
        this.avatar.add(base);
        this.avatar.base = base;

        this.scene.add(this.avatar);
    }

    createParticles() {
        const particleCount = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        const color = new THREE.Color(this.getThemeColor('particle'));

        for (let i = 0; i < particleCount; i++) {
            // 圆形分布
            const radius = 2 + Math.random() * 5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
            positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

            // 颜色变化
            colors[i * 3] = color.r + (Math.random() - 0.5) * 0.2;
            colors[i * 3 + 1] = color.g + (Math.random() - 0.5) * 0.2;
            colors[i * 3 + 2] = color.b + (Math.random() - 0.5) * 0.2;

            sizes[i] = Math.random() * 3;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    createWaveform() {
        const barCount = 32;
        const barGeometry = new THREE.BoxGeometry(0.08, 0.02, 0.08);
        const barMaterial = new THREE.MeshStandardMaterial({
            color: this.getThemeColor('accent'),
            emissive: this.getThemeColor('accent'),
            emissiveIntensity: 0.5,
            metalness: 0.5,
            roughness: 0.5,
            transparent: true,
            opacity: 0.8
        });

        this.waveBars = [];

        for (let i = 0; i < barCount; i++) {
            const bar = new THREE.Mesh(barGeometry, barMaterial.clone());
            bar.position.x = (i - barCount / 2) * 0.15;
            bar.position.y = -0.6;
            bar.position.z = -0.5;
            bar.scale.y = 1;
            this.waveBars.push(bar);
            this.scene.add(bar);
        }

        this.waveEnabled = false;
    }

    createGlow() {
        // 头像光晕
        const glowGeometry = new THREE.SphereGeometry(1.2, 32, 32);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                glowColor: { value: new THREE.Color(this.getThemeColor('glow')) },
                intensity: { value: 0.5 }
            },
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                uniform float intensity;
                varying vec3 vNormal;
                void main() {
                    float glow = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    gl_FragColor = vec4(glowColor, glow * intensity);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            depthWrite: false
        });

        this.avatarGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.avatarGlow.position.copy(this.avatar.position);
        this.scene.add(this.avatarGlow);
    }

    createStatusDisplay() {
        // 创建Canvas纹理用于状态显示
        const statusCanvas = document.createElement('canvas');
        statusCanvas.width = 256;
        statusCanvas.height = 64;
        this.statusContext = statusCanvas.getContext('2d');
        this.statusTexture = new THREE.CanvasTexture(statusCanvas);

        const statusMaterial = new THREE.SpriteMaterial({
            map: this.statusTexture,
            transparent: true,
            opacity: 0.9
        });

        const statusSprite = new THREE.Sprite(statusMaterial);
        statusSprite.position.set(0, -2, 1);
        statusSprite.scale.set(3, 0.75, 1);
        this.scene.add(statusSprite);
        this.statusSprite = statusSprite;

        this.updateStatusDisplay({
            cpu: 0,
            memory: 0,
            tasks: 0
        });
    }

    updateStatusDisplay(status) {
        const ctx = this.statusContext;
        ctx.clearRect(0, 0, 256, 64);

        // 背景
        ctx.fillStyle = 'rgba(26, 26, 36, 0.8)';
        ctx.roundRect(0, 0, 256, 64, 10);
        ctx.fill();

        // 边框
        ctx.strokeStyle = '#' + this.getThemeColor('primary').toString(16).padStart(6, '0');
        ctx.lineWidth = 2;
        ctx.stroke();

        // 文本
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillText(`CPU: ${status.cpu || 0}%`, 15, 24);
        ctx.fillText(`MEM: ${status.memory || 0}%`, 90, 24);
        ctx.fillText(`TASKS: ${status.tasks || 0}`, 165, 24);

        this.statusTexture.needsUpdate = true;
    }

    addDecorations() {
        // 网格地面
        const gridHelper = new THREE.GridHelper(10, 20, 0x2a2a3a, 0x1a1a2e);
        gridHelper.position.y = -1.5;
        this.scene.add(gridHelper);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = this.clock.getElapsedTime();
        const delta = this.clock.getDelta();

        if (!this.avatar) return;

        // 浮动动画
        const floatOffset = Math.sin(time * this.animParams.floatSpeed) * this.animParams.floatAmplitude;
        this.avatar.position.y = floatOffset;

        // 旋转动画
        this.avatar.rotation.y = Math.sin(time * 0.3) * 0.1;

        // 粒子动画
        if (this.particles) {
            const positions = this.particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += 0.01 * this.animParams.particleSpeed;
                if (positions[i + 1] > 4) positions[i + 1] = -4;
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
            this.particles.rotation.y = time * 0.05;
        }

        // 语音波形动画
        if (this.waveEnabled && this.waveBars) {
            for (let i = 0; i < this.waveBars.length; i++) {
                const scale = 1 + Math.sin(time * 10 + i * 0.3) * this.animParams.waveAmplitude * 10;
                this.waveBars[i].scale.y = Math.max(0.5, scale);
                this.waveBars[i].material.emissiveIntensity = 0.3 + scale * 0.2;
            }
        } else if (this.waveBars) {
            for (const bar of this.waveBars) {
                bar.scale.y = THREE.MathUtils.lerp(bar.scale.y, 1, 0.1);
                bar.material.emissiveIntensity = THREE.MathUtils.lerp(bar.material.emissiveIntensity, 0.3, 0.1);
            }
        }

        // 眼睛动画
        const eyeOpen = this.animParams.eyeOpen;
        this.avatar.leftEye.scale.setScalar(eyeOpen);
        this.avatar.rightEye.scale.setScalar(eyeOpen);

        // 嘴巴动画
        const mouthOpen = this.animParams.mouthOpen;
        this.avatar.mouth.scale.setScalar(1 + mouthOpen * 0.5);
        this.avatar.mouth.material.emissiveIntensity = 0.5 + mouthOpen * 0.5;

        // 天线脉冲
        if (this.avatar.antennaTop) {
            const pulse = 0.8 + Math.sin(time * 3) * 0.2;
            this.avatar.antennaTop.material.emissiveIntensity = pulse;
        }

        // 光晕动画
        if (this.avatarGlow) {
            const glowPulse = 0.4 + Math.sin(time * 2) * 0.1;
            this.avatarGlow.material.uniforms.intensity.value = glowPulse * this.animParams.glowIntensity;
        }

        // 情绪影响
        this.applyEmotionEffects(time);

        // 动画状态影响
        this.applyAnimationEffects(time);

        this.renderer.render(this.scene, this.camera);
    }

    applyEmotionEffects(time) {
        switch (this.currentEmotion) {
            case 'happy':
                this.avatar.rotation.z = Math.sin(time * 2) * 0.05;
                this.animParams.glowIntensity = 0.6;
                break;
            case 'serious':
                this.avatar.rotation.z = 0;
                this.animParams.glowIntensity = 0.3;
                break;
            case 'excited':
                this.avatar.rotation.z = Math.sin(time * 5) * 0.1;
                this.animParams.particleSpeed = 2;
                break;
            case 'calm':
                this.avatar.rotation.z = Math.sin(time * 0.5) * 0.02;
                this.animParams.particleSpeed = 0.5;
                break;
            case 'sad':
                this.avatar.rotation.z = 0.05;
                this.animParams.glowIntensity = 0.2;
                break;
            case 'surprised':
                this.avatar.scale.setScalar(1.1 + Math.sin(time * 10) * 0.05);
                break;
            default:
                this.avatar.scale.setScalar(1);
        }
    }

    applyAnimationEffects(time) {
        switch (this.currentAnimation) {
            case 'speaking':
                this.animParams.mouthOpen = 0.5 + Math.sin(time * 15) * 0.5;
                this.animParams.eyeOpen = 1;
                break;
            case 'thinking':
                this.avatar.rotation.y = Math.sin(time * 2) * 0.3;
                this.animParams.glowIntensity = 0.8;
                break;
            case 'listening':
                this.animParams.eyeOpen = 1.2;
                this.animParams.mouthOpen = 0;
                break;
            case 'excited':
                this.animParams.floatAmplitude = 0.2;
                this.animParams.floatSpeed = 2;
                break;
            case 'sleeping':
                this.animParams.eyeOpen = 0;
                this.animParams.floatAmplitude = 0.02;
                break;
            default: // idle
                this.animParams.mouthOpen = THREE.MathUtils.lerp(this.animParams.mouthOpen, 0.1, 0.1);
                this.animParams.eyeOpen = THREE.MathUtils.lerp(this.animParams.eyeOpen, 1, 0.1);
                this.animParams.floatAmplitude = 0.1;
                this.animParams.floatSpeed = 1;
        }
    }

    // ========== Public API ==========

    /**
     * 设置动画状态
     * @param {string} animation - 'idle', 'speaking', 'thinking', 'listening', 'excited', 'sleeping'
     */
    setAnimation(animation) {
        this.currentAnimation = animation;
        console.log(`🎬 小T: Animation -> ${animation}`);
    }

    /**
     * 设置情绪
     * @param {string} emotion - 'happy', 'serious', 'excited', 'calm', 'sad', 'surprised'
     */
    setEmotion(emotion) {
        this.currentEmotion = emotion;
        console.log(`😄 小T: Emotion -> ${emotion}`);
    }

    /**
     * 启用/禁用语音波形
     * @param {boolean} enabled
     */
    setWaveEnabled(enabled) {
        this.waveEnabled = enabled;
    }

    /**
     * 启用/禁用粒子效果
     * @param {boolean} enabled
     */
    setParticlesEnabled(enabled) {
        if (this.particles) {
            this.particles.visible = enabled;
        }
    }

    /**
     * 更新系统状态显示
     * @param {Object} status - { cpu, memory, tasks }
     */
    updateStatus(status) {
        if (this.statusSprite) {
            this.updateStatusDisplay(status);
        }
    }

    /**
     * 设置主题颜色
     * @param {string} theme - 'blue', 'orange', 'purple', 'cyan', 'dark'
     */
    setTheme(theme) {
        if (this.themes[theme]) {
            this.config.theme = theme;
            console.log(`🎨 小T: Theme -> ${theme}`);
            // 重新加载页面以应用主题
            this.dispose();
            this.init();
        }
    }

    /**
     * 全屏切换
     */
    toggleFullscreen() {
        const container = document.querySelector(this.config.container);
        if (!document.fullscreenElement) {
            container.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    }

    /**
     * 调整大小
     */
    onResize() {
        const container = document.querySelector(this.config.container);
        if (!container || !this.camera || !this.renderer) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    /**
     * 清理资源
     */
    dispose() {
        // 停止动画
        // 移除事件监听
        window.removeEventListener('resize', this.onResize);

        // 清理Three.js资源
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.domElement.remove();
        }

        // 清理场景
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
        console.log('🔄 小T 3D Interface disposed');
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = XiaotInterface;
}
