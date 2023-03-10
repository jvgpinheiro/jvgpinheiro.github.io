import { Box3, LinearFilter, Mesh, MeshPhongMaterial, MeshStandardMaterial, PlaneGeometry, TextureLoader, Vector3 } from 'three';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import type BackgroundComponent from '../BackgroundComponent';
import i18nData from './i18nData.json';
import VisualTextData from 'app/i18nModule/VisualTextData';
import LanguageManager from 'app/i18nModule/LanguageManager';
import { calcAverage } from 'app/Utils/NumberUtils';
import EventController from 'app/EventsModule/EventController';

type Events = {
    loaded: {};
};

const textureLoader = new TextureLoader();

class IntroComponent {
    private readonly fontLoader = new FontLoader();
    private readonly fontPath = 'assets/fonts/roboto_black_regular.json';
    private readonly textMaterials = [new MeshPhongMaterial({ color: 0xffffff }), new MeshPhongMaterial({ color: 0xffffff })];
    // private readonly planeMesh: Mesh;
    private font: Font | undefined;
    private titleMesh: Mesh | undefined;
    private descriptionMesh: Mesh | undefined;
    private textsCenterPosition: Vector3 | undefined;

    public readonly eventsController = new EventController<Events>();

    constructor(private readonly background: BackgroundComponent) {
        this.textMaterials.forEach((material) => {
            if (!material.map) {
                return;
            }
            material.map.minFilter = LinearFilter;
        });
        LanguageManager.eventController.addListener('languageUpdated', () => this.loadTexts());
        this.loadPlane();
        this.loadFont()
            .then(() => this.loadTexts())
            .catch((error) => console.error(error));
    }

    private loadPlane(): Mesh {
        const planeTexture = textureLoader.load('assets/textures/plane_texture.jpg');
        const height = textureLoader.load('assets/textures/height.png');
        const planeGeometry = new PlaneGeometry(2000, 2000, 256, 256);
        const planeMaterial = new MeshStandardMaterial({
            color: 'grey',
            map: planeTexture,
            displacementMap: height,
            displacementScale: 350,
        });
        const planeMesh = new Mesh(planeGeometry, planeMaterial);
        planeMesh.rotation.x = -Math.PI / 2;
        planeMesh.rotation.z = Math.PI;
        planeMesh.position.y = -100;
        this.background.scene.add(planeMesh);
        return planeMesh;
    }

    private async loadFont(): Promise<void> {
        return new Promise((resolve, reject) => {
            const onLoad = (font: Font) => {
                this.font = font;
                this.eventsController.emit('loaded', {});
                resolve();
            };
            this.fontLoader.load(
                this.fontPath,
                (font) => onLoad(font),
                () => {},
                (error) => reject(error),
            );
        });
    }

    private loadTexts(): void {
        if (!this.font) {
            return;
        }
        this.titleMesh && this.background.scene.remove(this.titleMesh);
        this.descriptionMesh && this.background.scene.remove(this.descriptionMesh);
        this.titleMesh = this.loadTitleText(this.font);
        this.descriptionMesh = this.loadDescriptionText(this.font);
        this.textsCenterPosition = this.getTextsCenterPosition();
        this.background.scene.add(this.titleMesh, this.descriptionMesh);
    }

    private loadTitleText(font: Font): Mesh {
        const titleText = new VisualTextData(i18nData, 'title');
        const titleTextGeometry = new TextGeometry(titleText.text, { font, size: 18, height: 4 });
        const mesh = new Mesh(titleTextGeometry, this.textMaterials);
        this.configureTitle(mesh);
        return mesh;
    }

    private loadDescriptionText(font: Font): Mesh {
        const descriptionText = new VisualTextData(i18nData, 'description');
        const descriptionTextGeometry = new TextGeometry(descriptionText.text, { font, size: 10, height: 4 });
        const mesh = new Mesh(descriptionTextGeometry, this.textMaterials);
        this.configureDescription(mesh);
        return mesh;
    }

    private getTextsCenterPosition(): Vector3 | undefined {
        if (!(this.titleMesh && this.descriptionMesh)) {
            return;
        }
        const titleCenter = this.getMeshCenterPosition(this.titleMesh);
        const descriptionCenter = this.getMeshCenterPosition(this.descriptionMesh);
        return new Vector3(
            calcAverage(titleCenter.x, descriptionCenter.x),
            calcAverage(titleCenter.y, descriptionCenter.y),
            calcAverage(titleCenter.z, descriptionCenter.z),
        );
    }

    public pointCameraToTexts(): void {
        if (!this.textsCenterPosition) {
            return;
        }
        this.background.camera.lookAt(this.textsCenterPosition);
    }

    private getMeshCenterPosition(mesh: Mesh): Vector3 {
        const titlePosition = mesh.position;
        const titleDimensions = new Vector3(0, 0, 0);
        const titleBox = new Box3().setFromObject(mesh);
        titleBox.getSize(titleDimensions);
        return new Vector3(
            calcAverage(titlePosition.x, titlePosition.x + titleDimensions.x),
            calcAverage(titlePosition.y, titlePosition.y + titleDimensions.y),
            calcAverage(titlePosition.z, titlePosition.z + titleDimensions.z),
        );
    }

    private configureTitle(mesh: Mesh): void {
        this.configureText(mesh);
        mesh.position.y = 100;
    }

    private configureDescription(mesh: Mesh): void {
        this.configureText(mesh);
        mesh.position.y = 80;
    }

    private configureText(mesh: Mesh): void {
        const vector = new Vector3();
        const box = new Box3().setFromObject(mesh);
        const size = box.getSize(vector);
        mesh.position.set(-size.x / 2, 0, 50);
        mesh.castShadow = true;
    }
}

export default IntroComponent;
