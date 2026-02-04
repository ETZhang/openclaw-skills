# 微信小游戏开发 - 最佳实践与规范

*沉淀自 CC模板、官方文档和实战经验*

---

## 目录

1. [技术选型](#技术选型)
2. [项目架构](#项目架构)
3. [核心组件](#核心组件)
4. [游戏循环](#游戏循环)
5. [性能优化](#性能优化)
6. [变现策略](#变现策略)
7. [发布流程](#发布流程)
8. [质量检查清单](#质量检查清单)

---

## 技术选型

### 推荐技术栈

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| 游戏引擎 | **Cocos Creator 3.x** | 首选，支持H5导出 |
| 替代引擎 | Phaser 3 | 轻量级H5游戏 |
| 原生开发 | 原生Canvas API | 简单游戏 |
| 框架 | Vue 3 + uni-app | 小程序+游戏混合 |

### Cocos Creator 优势

- ✅ 国产引擎，中文文档完善
- ✅ 支持 TypeScript
- ✅ 可视化编辑器
- ✅ 完善的物理引擎
- ✅ 动画系统强大
- ✅ 组件化开发
- ✅ 性能优化工具

---

## 项目架构

### Cocos Creator 项目结构

```
assets/
├── scripts/
│   ├── core/              # 核心系统
│   │   ├── GameManager.ts # 游戏管理器
│   │   ├── UIManager.ts   # UI管理
│   │   ├── SoundManager.ts# 音频管理
│   │   └── DataManager.ts # 数据管理
│   ├── entities/          # 游戏实体
│   │   ├── Player.ts      # 玩家
│   │   ├── Enemy.ts       # 敌人
│   │   ├── Bullet.ts      # 子弹
│   │   └── Collectible.ts # 收集物
│   ├── scenes/            # 场景
│   │   ├── Boot.ts        # 启动场景
│   │   ├── Menu.ts        # 主菜单
│   │   ├── Game.ts        # 游戏主场景
│   │   └── Result.ts      # 结果场景
│   ├── ui/                # UI组件
│   │   ├── HUD.ts         # 抬头显示
│   │   ├── Dialog.ts      # 对话框
│   │   └── Menu.ts        # 菜单
│   └── utils/             # 工具类
│       ├── EventManager.ts
│       ├── MathUtils.ts
│       └── LocalStorage.ts
├── resources/             # 动态资源
├── prefabs/               # 预制体
├── audio/                 # 音频
├── textures/              # 纹理图集
└── tilemaps/              # 瓦片地图
```

### 场景设计模式

```typescript
// Boot场景 - 初始化
// 预加载场景 - 加载资源
// Menu场景 - 主菜单
// Game场景 - 核心玩法
// Pause场景 - 暂停
// Result场景 - 结果结算
```

---

## 核心组件

### 玩家组件

```typescript
// Player.ts
import { _decorator, Component, Vec3, input, Input, EventKeyboard, KeyCode, RigidBody2D, AnimationComponent } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    @property(RigidBody2D)
    rigidBody: RigidBody2D = null;
    
    @property(AnimationComponent)
    anim: AnimationComponent = null;

    private speed = 200;
    private jumpForce = 350;
    private isGrounded = false;

    onLoad() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onKeyDown(event: EventKeyboard) {
        switch(event.keyCode) {
            case KeyCode.KEY_A:
                this.moveLeft();
                break;
            case KeyCode.KEY_D:
                this.moveRight();
                break;
            case KeyCode.SPACE:
                this.jump();
                break;
        }
    }

    moveLeft() {
        this.rigidBody.linearVelocity = new Vec3(-this.speed, this.rigidBody.linearVelocity.y);
        this.anim.play('run_left');
    }

    moveRight() {
        this.rigidBody.linearVelocity = new Vec3(this.speed, this.rigidBody.linearVelocity.y);
        this.anim.play('run_right');
    }

    jump() {
        if (this.isGrounded) {
            this.rigidBody.applyLinearImpulseToCenter(
                new Vec3(0, this.jumpForce),
                true
            );
        }
    }

    onCollisionEnter(other: any) {
        if (other.tag === 1) { // 地面
            this.isGrounded = true;
        }
    }
}
```

### 游戏管理器

```typescript
// GameManager.ts
import { _decorator, Component, director, game, GameEvent } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    private static _instance: GameManager;
    public static get instance(): GameManager {
        return this._instance;
    }

    private score = 0;
    private lives = 3;
    private level = 1;

    onLoad() {
        if (GameManager._instance) {
            this.destroy();
            return;
        }
        GameManager._instance = this;
        game.addPersistRootNode(this);
    }

    public addScore(points: number) {
        this.score += points;
        director.emit(GameEvent.SCORE_CHANGED, this.score);
    }

    public loseLife() {
        this.lives--;
        director.emit(GameEvent.LIFE_CHANGED, this.lives);
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    public gameOver() {
        director.emit(GameEvent.GAME_OVER, this.score);
        director.loadScene('Result');
    }

    public restart() {
        this.score = 0;
        this.lives = 3;
        director.loadScene('Game');
    }
}
```

### 对象池管理

```typescript
// ObjectPool.ts
import { _decorator, Component, Node, Pool, IGenericPool } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ObjectPool')
export class ObjectPool<T extends Component> {
    private pool: Pool<Node> = null;
    private prefab: T = null;
    private parent: Node = null;

    constructor(prefab: T, size: number, parent: Node) {
        this.prefab = prefab;
        this.parent = parent;
        this.pool = new Pool(
            () => {
                const node = Node.instantiate(prefab.node);
                return node;
            },
            size,
            (node: Node) => {
                node.destroy();
            }
        );
    }

    public get(): T | null {
        const node = this.pool.get();
        if (!node) return null;
        
        node.parent = this.parent;
        return node.getComponent(T);
    }

    public release(node: Node) {
        node.parent = null;
        this.pool.release(node);
    }
}
```

---

## 游戏循环

### 场景生命周期

```typescript
// Game.ts
import { _decorator, Component, director, game, log } from 'cc';
const { ccclass } = _decorator;

@ccclass('Game')
export class Game extends Component {
    protected onLoad(): void {
        log('场景加载');
    }

    protected onEnable(): void {
        log('场景启用');
        director.on('game_pause', this.onPause, this);
        director.on('game_resume', this.onResume, this);
    }

    protected start(): void {
        log('游戏开始');
        this.initGame();
    }

    protected update(dt: number): void {
        // 每帧更新 (60fps)
    }

    protected lateUpdate(dt: number): void {
        // 晚于所有update
    }

    protected onDisable(): void {
        director.off('game_pause', this.onPause, this);
        director.off('game_resume', this.onResume, this);
    }

    protected onDestroy(): void {
        log('场景销毁');
    }

    private initGame() {
        // 初始化游戏数据
    }

    private onPause() {
        game.pause();
    }

    private onResume() {
        game.resume();
    }
}
```

---

## 性能优化

### 1. 资源管理

```typescript
// ResourceManager.ts
import { _decorator, Component, resources, assetManager, Asset, AssetManager, error } from 'cc';
const { ccclass } = _decorator;

@ccclass('ResourceManager')
export class ResourceManager {
    // 预加载资源
    preloadBundle(bundleName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            assetManager.loadBundle(bundleName, (err, bundle) => {
                if (err) {
                    error(err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    // 加载精灵图集
    loadAtlas(atlasPath: string): Promise<SpriteAtlas> {
        return new Promise((resolve, reject) => {
            resources.load(atlasPath, SpriteAtlas, (err, atlas) => {
                if (err) reject(err);
                else resolve(atlas);
            });
        });
    }

    // 释放资源
    release(asset: Asset) {
        assetManager.releaseAsset(asset);
    }
}
```

### 2. 渲染优化

```typescript
// 性能优化配置
const GameConfig = {
    // 渲染
    render: {
        resolution: 'adaptive',  // 自适应分辨率
        frameRate: 60,           // 目标帧率
        vSync: true,             // 垂直同步
        antiAliasing: false,     // 关闭抗锯齿提升性能
    },
    
    // 物理
    physics: {
        gravity: new Vec2(0, -980),
        debug: false,            // 生产环境关闭
        velocityIterations: 8,
        positionIterations: 3,
    },
    
    // 内存
    memory: {
        maxTextureSize: 2048,    // 最大纹理尺寸
        poolingSize: 50,         // 对象池大小
    }
};
```

### 3. 内存优化

```typescript
// 场景切换时清理
protected onDestroy() {
    // 取消所有事件监听
    director.offAll(this);
    
    // 清理定时器
    this.unscheduleAllCallbacks();
    
    // 释放不需要的资源
    this.releaseUnusedAssets();
    
    // 清空对象池
    this.clearObjectPools();
}

// 纹理图集打包
// 使用 TexturePacker 或 Cocos 自带图集工具
const atlasConfig = {
    maxWidth: 2048,
    maxHeight: 2048,
    padding: 2,
    trimMode: 'crop',
    format: 'webp',  // WebP 比 PNG 小 30%
};
```

---

## 变现策略

### 广告变现

```typescript
// AdManager.ts
export class AdManager {
    private bannerAd: any = null;
    private rewardedAd: any = null;
    private interstitialAd: any = null;

    // 初始化广告
    init() {
        this.createBannerAd();
        this.createRewardedAd();
        this.createInterstitialAd();
    }

    // 激励广告（推荐）
    showRewardedVideo(): Promise<boolean> {
        return new Promise((resolve) => {
            if (this.rewardedAd) {
                this.rewardedAd.show().then(() => {
                    // 播放完成
                    resolve(true);
                }).catch(() => {
                    // 播放失败
                    this.showFallbackReward();
                    resolve(false);
                });
            } else {
                this.showFallbackReward();
                resolve(false);
            }
        });
    }

    // Banner 广告
    showBanner() {
        if (this.bannerAd) {
            this.bannerAd.show();
        }
    }

    hideBanner() {
        if (this.bannerAd) {
            this.bannerAd.hide();
        }
    }

    // 插屏广告（关卡间）
    showInterstitial() {
        if (this.interstitialAd) {
            this.interstitialAd.show();
        }
    }

    private showFallbackReward() {
        // 无广告时的替代奖励
        GameManager.instance.addScore(50);
    }
}
```

### 变现配置

```json
{
  "monetization": {
    "ad_networks": {
      "primary": "优量汇",
      "secondary": "穿山甲",
      "backup": "Midas"
    },
    "ad_placements": {
      "banner": {
        "position": "bottom",
        "show_on": ["menu", "game"]
      },
      "rewarded_video": {
        "show_on": ["revive", "bonus", "hint"],
        "reward_amount": 50
      },
      "interstitial": {
        "show_on": ["level_complete", "game_over"],
        "frequency": "every_3"
      }
    },
    "ecpm_estimate": {
      "banner": 8,
      "interstitial": 25,
      "rewarded": 35
    }
  }
}
```

### 付费设计

```typescript
// IAP 配置
const IAPConfig = {
    items: [
        {
            id: "remove_ads",
            name: "去广告",
            price: 6,
            type: "non_consumable"
        },
        {
            id: "starter_pack",
            name: "新手礼包",
            price: 1,
            type: "consumable",
            rewards: {
                coins: 1000,
                items: ["weapon_01"]
            }
        },
        {
            id: "vip_monthly",
            name: "月卡VIP",
            price: 18,
            type: "subscription",
            daily_reward: 100
        }
    ]
};
```

---

## 发布流程

### 1. 构建配置

```json
{
  "build": {
    "platform": "wechatgame",
    "debug": false,
    "sourceMaps": false,
    "compressTexture": {
        "format": "webp",
        "quality": 80
    },
    "polyfill": {
        "promise": true,
        "asyncFunctions": true
    }
  }
}
```

### 2. 微信后台配置

1. **注册开发者账号**
   - 微信公众平台注册小程序账号
   - 完成主体认证

2. **填写基本信息**
   - 小程序名称、简介、图标
   - 分类选择（游戏类目）

3. **配置类目**
   - 填写《计算机软件著作权登记证书》
   - 或使用《游戏版号》（需要审批）

4. **添加成员**
   - 管理员、开发者的微信号

### 3. 提交流程

```
1. 在 Cocos Creator 中点击「构建」
2. 选择「微信小游戏」平台
3. 配置构建参数
4. 点击「构建」
5. 构建完成后用微信开发者工具打开
6. 在微信开发者工具中点击「上传」
7. 在微信后台提交审核
8. 审核通过后发布上线
```

### 4. 注意事项

- 包体大小限制：主包不超过 2MB，总包不超过 20MB
- 首次加载时间：不超过 5 秒
- 必须接入实名认证
- 未成年人保护限制
- 需配置隐私协议

---

## 质量检查清单

### 发布前检查

#### 代码质量
- [ ] 使用 TypeScript 严格模式
- [ ] 无 console.log/console.warn
- [ ] 异常捕获完善
- [ ] 内存无泄漏
- [ ] 注释完整

#### 性能
- [ ] 对象池已实现
- [ ] 纹理已打包图集
- [ ] 关闭物理调试
- [ ] 预加载已完成
- [ ] 帧率稳定在 60fps

#### 资源
- [ ] 纹理格式：webp/png
- [ ] 音频格式：mp3/ogg
- [ ] 包体大小 < 10MB
- [ ] 无重复资源

#### 功能
- [ ] 引导教程完整
- [ ] 支付流程已测试
- [ ] 分享功能正常
- [ ] 广告展示正常
- [ ] 适配全面屏

#### 合规
- [ ] 已接入实名认证
- [ ] 隐私协议已配置
- [ ] 未成年人保护已开启
- [ ] 版号/软著已准备

---

## 梗游戏开发模板

### 快速开发框架

```typescript
// MemeGameTemplate.ts
// 基于本规范的最佳实践模板

export abstract class MemeGameTemplate extends Component {
    // 模板方法模式
    protected onLoad() {
        this.initGame();
    }

    protected start() {
        this.showIntro();
    }

    // 抽象方法（子类实现）
    protected abstract initGame(): void;
    protected abstract showIntro(): void;
    protected abstract startGameplay(): void;
    protected abstract onGameOver(): void;

    // 模板方法
    public play() {
        this.startGameplay();
    }

    public restart() {
        GameManager.instance.restart();
    }
}
```

### 游戏类型模板

| 类型 | 复杂度 | 适合梗 | 开发时间 |
|------|--------|--------|---------|
| 消除类 | ⭐⭐ | 颜色梗、表情梗 | 1-2天 |
| 跑酷类 | ⭐⭐ | 动作梗、舞蹈梗 | 2-3天 |
| 答题类 | ⭐ | 知识梗、谐音梗 | 1天 |
| 合成类 | ⭐⭐⭐ | 进化梗、升级梗 | 3-5天 |
| 节奏类 | ⭐⭐ | 音乐梗、舞蹈梗 | 2-3天 |
| 画板类 | ⭐ | 表情梗、梗图梗 | 1-2天 |

---

## 参考资源

### 官方文档
- [Cocos Creator 官方文档](https://docs.cocos.com/creator/)
- [微信小游戏开发文档](https://developers.weixin.qq.com/minigame/dev/guide/)

### 工具推荐
- [TexturePacker](https://www.codeandweb.com/texturepacker) - 纹理打包
- [Tiled](https://github.com/bjorn/tiled) - 瓦片地图编辑器
- [Audacity](https://www.audacityteam.org/) - 音频编辑

---

*最后更新: 2026-02-02*
*版本: 1.0.0*
