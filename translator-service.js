// translator-service.js
export default class TranslatorService {
    constructor() {
        this.translator = null;
        this.isAvailable = false;
    }

    async init() {
        if (!('Translator' in self)) {
            console.warn('Translator API not supported in this browser');
            return false;
        }

        try {
            // We'll check availability when user selects a language
            this.isAvailable = true;
            console.log('Translator service initialized successfully');
            return true;

        } catch (error) {
            console.error('Error initializing Translator service:', error);
            return false;
        }
    }

    async checkLanguageSupport(sourceLang, targetLang) {
        try {
            const capabilities = await Translator.availability({
                sourceLanguage: sourceLang,
                targetLanguage: targetLang
            });
            return capabilities === 'available';
        } catch (error) {
            console.error('Error checking language support:', error);
            return false;
        }
    }

    async translateText(text, targetLang) {
        if (!this.isAvailable) {
            return "Translation service unavailable.";
        }

        try {
            // Assume English source for simplicity
            const sourceLang = 'en';
            
            const supported = await this.checkLanguageSupport(sourceLang, targetLang);
            if (!supported) {
                return `Translation from English to ${targetLang} is not supported.`;
            }

            this.translator = await Translator.create({
                sourceLanguage: sourceLang,
                targetLanguage: targetLang
            });

            const result = await this.translator.translate(text);
            return result;

        } catch (error) {
            console.error('Translation error:', error);
            return "Translation failed. Please try a different language or shorter text.";
        }
    }

    destroy() {
        if (this.translator) {
            this.translator.destroy();
            this.translator = null;
        }
    }
}