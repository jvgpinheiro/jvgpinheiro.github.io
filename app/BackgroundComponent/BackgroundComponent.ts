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
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import IntroComponent from './IntroComponent';

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
    private readonly fnAnimate = () => this.animate();

    private readonly introComponent: IntroComponent;

    private isPaused: boolean = false;

    constructor(private readonly canvas: HTMLCanvasElement) {
        this.renderer = new WebGLRenderer({ canvas, antialias: true });
        this.pointLightHelper = new PointLightHelper(this.pointLight);
        this.orbitControls = new OrbitControls(this.camera, this.canvas);
        this.introComponent = new IntroComponent(this);
        this.init();
        this.animate();
    }

    private init(): void {
        this.initObjects();
        this.initScene();
        window.addEventListener('resize', () => this.resize());
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

    private initScene(): void {
        this.scene.add(this.donut);
        this.scene.add(this.pointLight, this.ambientLight);
        this.scene.add(this.pointLightHelper, this.gridHelper);
        this.allStars.forEach((star) => this.scene.add(star));
    }

    private animate(): void {
        requestAnimationFrame(this.fnAnimate);
        if (this.isPaused) {
            this.orbitControls.update();
            this.renderer.render(this.scene, this.camera);
            return;
        }
        this.animateDonut();
        this.orbitControls.update();
        this.renderer.render(this.scene, this.camera);
    }

    private animateDonut(): void {
        this.donut.rotation.x += 0.01;
        this.donut.rotation.y += 0.005;
        this.donut.rotation.z += 0.01;
        this.donut.material;
    }

    public pause(): void {
        this.isPaused = true;
    }

    public resume(): void {
        this.isPaused = false;
    }
}

export default BackgroundComponent;
