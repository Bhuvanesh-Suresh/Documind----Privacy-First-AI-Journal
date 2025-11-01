// prompt-service.js - FIXED VERSION
export default class PromptService {
    constructor() {
        this.session = null;
        this.isAvailable = false;
        this.initializationAttempted = false;
    }

    async init() {
        if (this.initializationAttempted) {
            return this.isAvailable;
        }
        
        this.initializationAttempted = true;

        if (!('LanguageModel' in self)) {
            console.warn('Prompt API not supported in this browser');
            return false;
        }

        try {
            const availability = await LanguageModel.availability();
            console.log('Prompt API availability:', availability);

            if (availability === 'unavailable') {
                console.warn('Prompt API not available');
                return false;
            }

            if (availability === 'available') {
                // Create session with document analysis context
                this.session = await LanguageModel.create({
                    initialPrompts: [
                        { 
                            role: 'system', 
                            content: 'You are DocuMind, a helpful document analysis assistant. You specialize in summarizing, explaining, and answering questions about documents. Always provide clear, concise, and accurate responses. Focus on being helpful for understanding legal, technical, business, and general documents.' 
                        }
                    ],
                    expectedInputs: [{ type: "text", languages: ["en"] }],
                    expectedOutputs: [{ type: "text", languages: ["en"] }]
                });

                this.isAvailable = true;
                console.log('Prompt service initialized successfully');
                return true;
            } else {
                // downloadable state - initialize on first use
                console.log('Prompt API needs user gesture to download');
                this.isAvailable = false; // Will become true after first user gesture
                return false;
            }

        } catch (error) {
            console.error('Error initializing Prompt service:', error);
            return false;
        }
    }

    async ensureInitialized() {
        if (!this.session && !this.isAvailable) {
            try {
                this.session = await LanguageModel.create({
                    initialPrompts: [
                        { 
                            role: 'system', 
                            content: 'You are DocuMind, a helpful document analysis assistant.' 
                        }
                    ],
                    expectedInputs: [{ type: "text", languages: ["en"] }],
                    expectedOutputs: [{ type: "text", languages: ["en"] }]
                });
                this.isAvailable = true;
                console.log('Prompt service initialized with user gesture!');
                return true;
            } catch (error) {
                console.error('Prompt service initialization failed:', error);
                return false;
            }
        }
        return this.isAvailable;
    }

    async askQuestion(documentText, question) {
        if (!await this.ensureInitialized()) {
            return "Question feature is downloading AI models. Please try again in a moment.";
        }

        try {
            const prompt = `
            DOCUMENT:
            ${documentText}

            QUESTION: ${question}

            Please answer the question based on the document above. Be precise and helpful.
            `;

            const result = await this.session.prompt(prompt);
            return result;

        } catch (error) {
            console.error('Error asking question:', error);
            return "I couldn't process your question. Please try again.";
        }
    }

    async explainDocument(documentText) {
        if (!await this.ensureInitialized()) {
            return "Explanation feature is downloading AI models. Please try again in a moment.";
        }

        try {
            const prompt = `
            Explain this document in simple terms. Identify:
            1. Main purpose or topic
            2. Key points or requirements
            3. Any important warnings or considerations
            4. Who this document is for

            DOCUMENT:
            ${documentText}
            `;

            const result = await this.session.prompt(prompt);
            return result;

        } catch (error) {
            console.error('Error explaining document:', error);
            return "I couldn't explain this document. Please try the summarize feature.";
        }
    }

    async improveWriting(text) {
        if (!await this.ensureInitialized()) {
            return "Writing improvement is downloading AI models. Please try again in a moment.";
        }

        try {
            const prompt = `
            Improve this text for clarity, professionalism, and impact. Keep the original meaning but make it more effective:

            ORIGINAL TEXT:
            ${text}

            Provide the improved version only.
            `;

            const result = await this.session.prompt(prompt);
            return result;

        } catch (error) {
            console.error('Error improving writing:', error);
            return text;
        }
    }

    destroy() {
        if (this.session) {
            this.session.destroy();
            this.session = null;
        }
    }
}