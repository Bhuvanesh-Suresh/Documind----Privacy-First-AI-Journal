// document-service.js
import SummarizerService from './summarizer-service.js';
import ProofreaderService from './proofreader-service.js';
import WriterService from './writer-service.js';
import PromptService from './prompt-service.js';
import TranslatorService from './translator-service.js';

export default class DocumentService {
    constructor() {
        this.summarizerService = new SummarizerService();
        this.proofreaderService = new ProofreaderService();
        this.writerService = new WriterService();
        this.promptService = new PromptService();
        this.translatorService = new TranslatorService();
        
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        const services = await Promise.all([
            this.summarizerService.init(),
            this.proofreaderService.init(),
            this.writerService.init(),
            this.promptService.init(),
            this.translatorService.init()
        ]);

        console.log('All services initialized:', {
            summarizer: services[0],
            proofreader: services[1],
            writer: services[2],
            prompt: services[3],
            translator: services[4]
        });

        this.initialized = true;
        return services;
    }

    async summarize(documentText) {
        if (!this.initialized) await this.init();
        return await this.summarizerService.generateInsights(documentText);
    }

    async explain(documentText) {
        if (!this.initialized) await this.init();
        return await this.promptService.explainDocument(documentText);
    }

    async improveWriting(documentText) {
        if (!this.initialized) await this.init();
        return await this.promptService.improveWriting(documentText);
    }

    async checkGrammar(documentText) {
        if (!this.initialized) await this.init();
        const corrections = await this.proofreaderService.checkGrammar(documentText);
        return { corrections, hasErrors: corrections.length > 0 };
    }

    async translate(documentText, targetLang) {
        if (!this.initialized) await this.init();
        return await this.translatorService.translateText(documentText, targetLang);
    }

    async askQuestion(documentText, question) {
        if (!this.initialized) await this.init();
        return await this.promptService.askQuestion(documentText, question);
    }

    destroy() {
        this.summarizerService.destroy();
        this.proofreaderService.destroy();
        this.writerService.destroy();
        this.promptService.destroy();
        this.translatorService.destroy();
    }
}