// proofreader-service.js - FIXED VERSION
export default class ProofreaderService {
    constructor() {
        this.proofreader = null;
        this.isAvailable = false;
        this.initializationAttempted = false;
    }

    async init() {
        if (this.initializationAttempted) {
            return this.isAvailable;
        }
        
        this.initializationAttempted = true;

        if (!('Proofreader' in self)) {
            console.warn('Proofreader API not supported in this browser');
            return false;
        }
        
        try {
            const available = await Proofreader.availability();
            console.log('Proofreader availability:', available);
            
            if (available === 'unavailable') {
                console.warn('Proofreader API not available');
                return false;
            }

            // If downloadable, we'll initialize on first use with user gesture
            if (available === 'available') {
                this.proofreader = await Proofreader.create({
                    expectedInputLanguages: ['en']
                });
                this.isAvailable = true;
                console.log('Proofreader service initialized successfully');
                return true;
            } else {
                // downloadable state - we'll initialize when user clicks something
                console.log('Proofreader needs user gesture to download');
                this.isAvailable = false; // Will become true after first user gesture
                return false;
            }
            
        } catch (error) {
            console.error('Error initializing Proofreader service:', error);
            return false;
        }
    }

    async checkGrammar(text) {
        if (!this.proofreader && !this.isAvailable) {
            // Try to initialize now with user gesture
            try {
                this.proofreader = await Proofreader.create({
                    expectedInputLanguages: ['en']
                });
                this.isAvailable = true;
                console.log('Proofreader initialized with user gesture!');
            } catch (error) {
                console.error('Proofreader initialization failed:', error);
                return [];
            }
        }

        if (!this.proofreader || !this.isAvailable || !text.trim()) {
            return [];
        }
        
        try {
            const result = await this.proofreader.proofread(text);
            return result.corrections || [];
        } catch (error) {
            console.error('Proofreader error:', error);
            return [];
        }
    }

    destroy() {
        if (this.proofreader) {
            this.proofreader.destroy();
            this.proofreader = null;
        }
    }
}