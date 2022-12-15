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

function makeTorus(): Mesh {
    const geometry = new TorusGeometry(10, 4, 100, 100);
    const material = new MeshStandardMaterial({ color: 0xff5345 });
    return new Mesh(geometry, material);
}

function makeStar(): Mesh {
    const geometry = new SphereGeometry(0.25, 25, 25);
    const material = new MeshStandardMaterial({ color: 0xffffff });
    return new Mesh(geometry, material);
}

class BackgroundComponent {
    private readonly scene = new Scene();
    private readonly camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    private readonly renderer: WebGLRenderer;
    private readonly donut = makeTorus();
    private readonly star = makeStar();
    private readonly pointLight = new PointLight(0xffffff);
    private readonly ambientLight = new AmbientLight(0xffffff);
    private readonly pointLightHelper: PointLightHelper;
    private readonly gridHelper = new GridHelper(200, 50);
    private readonly orbitControls: OrbitControls;

    private isPaused: boolean = false;

    constructor(private readonly canvas: HTMLCanvasElement) {
        this.renderer = new WebGLRenderer({ canvas });
        this.pointLightHelper = new PointLightHelper(this.pointLight);
        this.orbitControls = new OrbitControls(this.camera, this.canvas);
        this.init();
        this.animate();
    }

    private init(): void {
        this.initObjects();
        this.initScene();
    }

    private initObjects(): void {
        this.camera.position.setZ(30);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.pointLight.position.set(5, 5, 5);
        this.initStarObjects();
    }

    private initStarObjects(): void {
        for (let i = 0; i < 300; i++) {
            const [x, y, z] = [0, 0, 0].map(() => MathUtils.randFloatSpread(200));
            const newStar = this.star.clone();
            newStar.position.set(x, y, z);
            this.scene.add(newStar);
        }
    }

    private initScene(): void {
        this.scene.add(this.donut);
        this.scene.add(this.pointLight, this.ambientLight);
        this.scene.add(this.pointLightHelper, this.gridHelper);
    }

    private animate(): void {
        requestAnimationFrame(this.animate.bind(this));
        if (this.isPaused) {
            return;
        }
        this.animateRotations();
        this.orbitControls.update();
        this.renderer.render(this.scene, this.camera);
    }

    private animateRotations(): void {
        this.donut.rotation.x += 0.01;
        this.donut.rotation.y += 0.005;
        this.donut.rotation.z += 0.01;
    }

    public pause(): void {
        this.isPaused = true;
    }

    public resume(): void {
        this.isPaused = false;
    }
}

export default BackgroundComponent;
