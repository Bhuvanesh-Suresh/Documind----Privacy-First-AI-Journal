// writer-service.js
export default class WriterService {
    constructor() {
        this.writer = null;
        this.isAvailable = false;
    }

    async init() {
        if (!('Writer' in self)) {
            console.warn('Writer API not supported in this browser');
            return false;
        }
        
        try {
            const availability = await Writer.availability();
            console.log('Writer availability:', availability);
            
            if (availability === 'unavailable') {
                console.warn('Writer API not available');
                return false;
            }

            const options = {
                tone: 'neutral',
                format: 'plain-text',
                length: 'short',
                expectedInputLanguages: ['en'],
                outputLanguage: 'en'
            };

            if (availability === 'available') {
                this.writer = await Writer.create(options);
            } else {
                this.writer = await Writer.create({
                    ...options,
                    monitor(m) {
                        m.addEventListener("downloadprogress", e => {
                            const percent = (e.loaded * 100).toFixed(1);
                            console.log(`Writer model downloaded: ${percent}%`);
                        });
                    }
                });
            }
            
            this.isAvailable = true;
            console.log('Writer service initialized successfully');
            return true;
            
        } catch (error) {
            console.error('Error initializing Writer service:', error);
            return false;
        }
    }

    destroy() {
        if (this.writer) {
            this.writer.destroy();
            this.writer = null;
        }
    }
}