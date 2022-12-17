import { Box3, LinearFilter, Mesh, MeshPhongMaterial, Vector3 } from 'three';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import type BackgroundComponent from '../BackgroundComponent';
import i18nData from './i18nData.json';
import VisualTextData from 'app/i18nModule/VisualTextData';
import LanguageManager from 'app/i18nModule/LanguageManager';

class IntroComponent {
    private readonly fontLoader = new FontLoader();
    private readonly fontPath = 'assets/fonts/roboto_black_regular.json';
    private readonly textMaterials = [new MeshPhongMaterial({ color: 0xffffff }), new MeshPhongMaterial({ color: 0xffffff })];
    private font: Font | undefined;
    private titleMesh: Mesh | undefined;
    private descriptionMesh: Mesh | undefined;

    constructor(private readonly background: BackgroundComponent) {
        this.textMaterials.forEach((material) => {
            if (!material.map) {
                return;
            }
            material.map.minFilter = LinearFilter;
        });
        LanguageManager.eventController.addListener('languageUpdated', () => this.loadTexts());
        this.loadFont()
            .then(() => this.loadTexts())
            .catch((error) => console.error(error));
    }

    private async loadFont(): Promise<void> {
        return new Promise((resolve, reject) => {
            const onLoad = (font: Font) => {
                this.font = font;
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
        this.background.scene.add(this.titleMesh, this.descriptionMesh);
    }

    private loadTitleText(font: Font): Mesh {
        const titleText = new VisualTextData(i18nData, 'title');
        const titleTextGeometry = new TextGeometry(titleText.text, { font, size: 12, height: 0 });
        const mesh = new Mesh(titleTextGeometry, this.textMaterials);
        this.configureTitle(mesh);
        return mesh;
    }

    private loadDescriptionText(font: Font): Mesh {
        const descriptionText = new VisualTextData(i18nData, 'description');
        const descriptionTextGeometry = new TextGeometry(descriptionText.text, { font, size: 5, height: 0 });
        const mesh = new Mesh(descriptionTextGeometry, this.textMaterials);
        this.configureDescription(mesh);
        return mesh;
    }

    private configureTitle(mesh: Mesh): void {
        this.configureText(mesh);
        mesh.position.y = 30;
    }

    private configureDescription(mesh: Mesh): void {
        this.configureText(mesh);
        mesh.position.y = 18;
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
