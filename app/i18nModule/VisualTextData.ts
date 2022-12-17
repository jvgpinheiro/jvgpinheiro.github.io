import LanguageManager, { Language } from './LanguageManager';

type LockedLanguagesData<T extends { 'en-us': any }> = T['en-us'] extends infer O ? (T[keyof T] extends O ? T : never) : never;
type i18nData = { [K in Language]: { [key: string]: i18nData | string } };
type LockedI18nData = LockedLanguagesData<i18nData>;
type NestedKeys<T extends i18nData> = {
    [K in keyof T['en-us'] & (string | number)]: T['en-us'][K] extends i18nData ? `${K}.${NestedKeys<T['en-us'][K]>}` : `${K}`;
}[keyof T['en-us'] & (string | number)];

export interface VisualTextDataInterface {
    text: string;
    readonly language: Language;
    onLanguageChange: (language: Language) => void;
}

class VisualTextData<T extends LockedI18nData> implements VisualTextDataInterface {
    public text: string;
    private selectedLanguage: Language;

    constructor(private readonly i18nData: T, private readonly textPath: NestedKeys<T>) {
        this.selectedLanguage = LanguageManager.selectedLanguage;
        this.text = this.readValue();
        LanguageManager.eventController.addListener('languageUpdated', ({ language }) => this.onLanguageChange(language));
    }

    private readValue(): string {
        const textPathSplitted = this.textPath.split('.');
        let result: any = this.i18nData[this.language];
        textPathSplitted.forEach((key) => {
            result = result[key];
        });
        return result;
    }

    public get language(): Language {
        return this.selectedLanguage;
    }

    public onLanguageChange(language: Language): void {
        this.selectedLanguage = language;
    }
}

new VisualTextData({ 'en-us': { a: '' }, 'pt-br': { a: '' } }, 'a');

export default VisualTextData;
