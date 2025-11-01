// summarizer-service.js - FIXED VERSION
export default class SummarizerService {
    constructor() {
        this.summarizer = null;
        this.isAvailable = false;
    }

    async init() {
        if (!('Summarizer' in self)) {
            console.warn('Summarizer API not supported in this browser');
            return false;
        }
        
        try {
            const availability = await Summarizer.availability();
            console.log('Summarizer availability:', availability);
            
            if (availability === 'unavailable') {
                console.warn('Summarizer API not available');
                return false;
            }

            const options = {
                type: 'key-points',
                format: 'plain-text',
                length: 'short',
                expectedInputLanguages: ['en'],
                outputLanguage: 'en'  // FIXED: Added output language
            };

            if (availability === 'available') {
                this.summarizer = await Summarizer.create(options);
            } else {
                this.summarizer = await Summarizer.create({
                    ...options,
                    monitor(m) {
                        m.addEventListener("downloadprogress", e => {
                            const percent = (e.loaded * 100).toFixed(1);
                            console.log(`Summarizer model downloaded: ${percent}%`);
                        });
                    }
                });
            }
            
            this.isAvailable = true;
            console.log('Summarizer service initialized successfully');
            return true;
            
        } catch (error) {
            console.error('Error initializing Summarizer service:', error);
            return false;
        }
    }

    async generateInsights(text) {
        if (!this.summarizer || !this.isAvailable || !text.trim()) {
            return "Summarization unavailable. Please try again later.";
        }
        
        try {
            const summary = await this.summarizer.summarize(text, {
                context: 'This is a document that needs summarization. Provide key points and main ideas.',
                type: 'key-points',
                length: 'short'
            });
            return summary;
        } catch (error) {
            console.error('Error generating insights:', error);
            return "Unable to summarize this document at the moment.";
        }
    }

    destroy() {
        if (this.summarizer) {
            this.summarizer.destroy();
            this.summarizer = null;
        }
    }
}