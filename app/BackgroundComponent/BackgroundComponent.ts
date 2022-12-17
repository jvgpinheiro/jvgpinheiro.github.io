import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    TorusGeometry,
    Mesh,
    PointLight,
    MeshStandardMaterial,
    AmbientLight,
    PointLightHelper,
    GridHelper,
    SphereGeometry,
    MathUtils,
    Vector2,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import IntroComponent from './IntroComponent/IntroComponent';

function makeTorus(): Mesh {
    const geometry = new TorusGeometry(10, 4, 100, 100);
    const material = new MeshStandardMaterial({ color: 0xff5345 });
    return new Mesh(geometry, material);
}

function makeStar(): Mesh {
    const randomRadius = 0.5 + MathUtils.randFloatSpread(0.5);
    const geometry = new SphereGeometry(randomRadius, 25, 25);
    const material = new MeshStandardMaterial({ color: 0xffffff });
    return new Mesh(geometry, material);
}

class BackgroundComponent {
    public readonly scene = new Scene();
    public readonly camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    public readonly renderer: WebGLRenderer;
    private readonly donut = makeTorus();
    private readonly allStars: Set<Mesh> = new Set();
    private readonly pointLight = new PointLight(0xffffff);
    private readonly ambientLight = new AmbientLight(0xffffff);
    private readonly pointLightHelper: PointLightHelper;
    private readonly gridHelper = new GridHelper(200, 50);
    private readonly orbitControls: OrbitControls;
    private readonly bloomComposer: EffectComposer;
    private readonly fnAnimate = () => this.animate();

    public readonly BASE_LAYER = 0;
    public readonly BLOOM_LAYER = 1;

    // private readonly introComponent: IntroComponent;

    private isPaused: boolean = false;

    constructor(private readonly canvas: HTMLCanvasElement) {
        this.renderer = new WebGLRenderer({ canvas, antialias: true });
        this.pointLightHelper = new PointLightHelper(this.pointLight);
        this.orbitControls = new OrbitControls(this.camera, this.canvas);
        // this.introComponent = new IntroComponent(this);
        new IntroComponent(this);
        this.bloomComposer = new EffectComposer(this.renderer);
        this.init();
        this.animate();
    }

    private init(): void {
        this.initPostProcessing();
        this.initObjects();
        this.initLayers();
        this.initScene();
        window.addEventListener('resize', () => this.resize());
    }

    private initPostProcessing(): void {
        const renderPass = new RenderPass(this.scene, this.camera);
        const bloomPass = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 1.5, 0, 0.3);
        bloomPass.renderToScreen = true;
        this.renderer.toneMappingExposure = Math.pow(0.9, 4.0);

        this.bloomComposer.addPass(renderPass);
        this.bloomComposer.addPass(bloomPass);
    }

    private initObjects(): void {
        this.camera.position.set(0, 30, 150);
        this.camera.setFocalLength(10);
        this.resize();
        this.pointLight.position.set(5, 5, 5);
        this.initStarObjects();
    }

    private resize(): void {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.renderer.setSize(width, height, false);
            this.bloomComposer.setSize(width, height);
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }
    }

    private initStarObjects(): void {
        for (let i = 0; i < 500; i++) {
            const x = MathUtils.randFloatSpread(1000);
            const y = MathUtils.randFloatSpread(300) + 100;
            const z = MathUtils.randFloatSpread(300) - 200;
            const star = makeStar();
            star.position.set(x, y, z);
            this.allStars.add(star);
        }
    }

    private initLayers(): void {
        this.donut.layers.set(this.BASE_LAYER);
        this.allStars.forEach((star) => star.layers.set(this.BLOOM_LAYER));
        this.pointLight.layers.enableAll();
        this.ambientLight.layers.enableAll();
        this.camera.layers.enable(this.BLOOM_LAYER);
    }

    private initScene(): void {
        this.pointLight.layers.enable(1);
        this.ambientLight.layers.enable(1);
        this.scene.add(this.donut);
        this.scene.add(this.pointLight, this.ambientLight);
        this.scene.add(this.pointLightHelper, this.gridHelper);
        this.allStars.forEach((star) => {
            this.scene.add(star);
        });
    }

    private animate(): void {
        requestAnimationFrame(this.fnAnimate);
        this.renderer.autoClear = false;
        if (this.isPaused) {
            this.orbitControls.update();
            this.renderer.render(this.scene, this.camera);
            return;
        }
        this.animateStars();
        this.animateDonut();

        this.renderer.clear();
        this.camera.layers.set(this.BLOOM_LAYER);
        this.bloomComposer.render();

        this.renderer.clearDepth();
        this.camera.layers.set(this.BASE_LAYER);
        this.renderer.render(this.scene, this.camera);
        this.orbitControls.update();
    }

    private animateDonut(): void {
        this.donut.rotation.x += 0.01;
        this.donut.rotation.y += 0.005;
        this.donut.rotation.z += 0.01;
    }

    private animateStars(): void {
        this.allStars.forEach((star) => {
            const step = 0.03;
            star.position.x += MathUtils.randFloatSpread(step);
            star.position.y += MathUtils.randFloatSpread(step);
            star.position.z += MathUtils.randFloatSpread(step);
        });
    }

    public pause(): void {
        this.isPaused = true;
    }

    public resume(): void {
        this.isPaused = false;
    }
}

export default BackgroundComponent;
