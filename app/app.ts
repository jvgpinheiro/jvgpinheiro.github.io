import './styles.scss';
import MainAppComponent from './MainAppComponent/MainAppComponent';
import { createApp } from 'vue';
import BackgroundComponent from './BackgroundComponent/BackgroundComponent';
import Stats from 'stats.js';

const mainAppElement = document.querySelector('#app');
const backgroundElement = document.querySelector('#background');
if (!(mainAppElement && backgroundElement && backgroundElement instanceof HTMLCanvasElement)) {
    throw Error('Elements not found');
}
createApp(MainAppComponent).mount(mainAppElement);
(window as any).background = new BackgroundComponent(backgroundElement);

var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

function animate() {
    stats.begin();

    // monitored code goes here

    stats.end();

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
