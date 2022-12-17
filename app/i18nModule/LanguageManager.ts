import EventController from 'app/EventsModule/EventController';

export type Language = 'pt-br' | 'en-us';

type Events = {
    languageUpdated: { language: Language };
};

class LanguageManager {
    private currentLanguage: Language = 'en-us';
    public eventController: EventController<Events> = new EventController();

    constructor() {
        (window as any).LanguageManager = this;
    }

    public get selectedLanguage(): Language {
        return this.currentLanguage;
    }

    public updateLanguage(language: Language): void {
        if (language === this.currentLanguage) {
            return;
        }
        this.currentLanguage = language;
        this.eventController.emit('languageUpdated', { language });
    }
}

export default new LanguageManager();
