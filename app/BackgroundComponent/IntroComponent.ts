import { LinearFilter, Mesh, MeshPhongMaterial } from 'three';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import type BackgroundComponent from './BackgroundComponent';

class IntroComponent {
    private readonly fontLoader = new FontLoader();
    private readonly fontPath = 'assets/fonts/roboto_black_regular.json';
    private titleMesh: Mesh | undefined;
    private descriptionMesh: Mesh | undefined;

    constructor(private readonly background: BackgroundComponent) {
        this.loadFont()
            .then((font) => this.initText(font))
            .catch((error) => console.error(error));
    }

    private async loadFont(): Promise<Font> {
        return new Promise((resolve, reject) => {
            this.fontLoader.load(
                this.fontPath,
                (font) => resolve(font),
                () => {},
                (error) => reject(error),
            );
        });
    }

    private initText(font: Font): void {
        const materials = [new MeshPhongMaterial({ color: 0xffffff }), new MeshPhongMaterial({ color: 0xffffff })];
        materials.forEach((material) => {
            if (!material.map) {
                return;
            }
            material.map.minFilter = LinearFilter;
        });
        const titleTextGeometry = new TextGeometry('JOÃO PINHEIRO', { font, size: 12, height: 0 });
        const descriptionTextGeometry = new TextGeometry('SOFTWARE DEVELOPER', { font, size: 5, height: 0 });
        this.titleMesh = new Mesh(titleTextGeometry, materials);
        this.descriptionMesh = new Mesh(descriptionTextGeometry, materials);

        this.titleMesh.castShadow = true;
        this.titleMesh.position.set(-63, 30, 50);
        this.descriptionMesh.castShadow = true;
        this.descriptionMesh.position.set(-38, 20, 50);
        this.background.scene.add(this.titleMesh, this.descriptionMesh);
    }
}

export default IntroComponent;
