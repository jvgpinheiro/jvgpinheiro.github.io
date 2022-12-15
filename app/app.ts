import './styles.scss';
import MainAppComponent from './MainAppComponent/MainAppComponent';
import { createApp } from 'vue';
import BackgroundComponent from './BackgroundComponent/BackgroundComponent';

const mainAppElement = document.querySelector('#app');
const backgroundElement = document.querySelector('#background');
if (!(mainAppElement && backgroundElement && backgroundElement instanceof HTMLCanvasElement)) {
    throw Error('Elements not found');
}
createApp(MainAppComponent).mount(mainAppElement);
(window as any).background = new BackgroundComponent(backgroundElement);
