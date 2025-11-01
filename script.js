// script.js
import DocumentService from './document-service.js';

class DocuMindApp {
    constructor() {
        this.documentService = new DocumentService();
        this.currentDocument = '';
        this.grammarTimeout = null;
        
        this.init();
    }

    async init() {
        console.log('🚀 Starting DocuMind App...');
        
        this.showLoadingState();
        
        try {
            await this.initializeServices();
            this.bindEvents();
            this.setupExamples();
            this.hideLoadingState();
            console.log('✅ DocuMind App initialized successfully');
        } catch (error) {
            console.error('❌ App initialization failed:', error);
            this.showCriticalError('Failed to initialize app. Check console for details.');
        }
    }

    async initializeServices() {
        console.log('🔄 Initializing AI services...');
        
        try {
            const services = await this.documentService.init();
            console.log('📊 Services status:', services);
            
            if (!services || services.includes(false)) {
                this.showWarning('Some AI features may not be available. Basic functions should work.');
            }
            
        } catch (error) {
            console.error('❌ Service initialization error:', error);
            throw error;
        }
    }

    showLoadingState() {
        const results = document.getElementById('results');
        results.innerHTML = `
            <div class="result-item">
                <div class="result-header">
                    <div class="result-type">🔄 Initializing DocuMind...</div>
                </div>
                <div class="result-content">
                    <p>Loading AI services. This may take a moment.</p>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 70%"></div>
                    </div>
                    <p><small>If this takes more than 30 seconds, check Chrome flags and console.</small></p>
                </div>
            </div>
        `;
    }

    hideLoadingState() {
        const results = document.getElementById('results');
        results.innerHTML = `
            <div class="welcome-message">
                <h3>Ready! 🎉</h3>
                <p>DocuMind is initialized. Try these features:</p>
                <ul>
                    <li>📄 <strong>Summarize</strong> long contracts or articles</li>
                    <li>🔍 <strong>Explain</strong> complex legal or technical terms</li>
                    <li>✏️ <strong>Improve</strong> your writing and fix grammar</li>
                    <li>🌐 <strong>Translate</strong> between multiple languages</li>
                    <li>❓ <strong>Ask questions</strong> about your document content</li>
                </ul>
                <p><em>Note: Some AI features require Chrome flags to be enabled.</em></p>
            </div>
        `;
    }

    showCriticalError(message) {
        const results = document.getElementById('results');
        results.innerHTML = `
            <div class="result-item">
                <div class="result-header">
                    <div class="result-type">❌ Initialization Failed</div>
                </div>
                <div class="result-content">
                    <p><strong>Error:</strong> ${message}</p>
                    <h4>Troubleshooting Steps:</h4>
                    <ol>
                        <li>Enable Chrome flags for AI APIs</li>
                        <li>Check Chrome version (137-148 required)</li>
                        <li>Ensure sufficient storage space</li>
                        <li>Check browser console for details</li>
                    </ol>
                </div>
            </div>
        `;
    }

    showWarning(message) {
        const warningDiv = document.createElement('div');
        warningDiv.style.cssText = `
            background: #fff3cd;
            color: #856404;
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
            border-left: 4px solid #ffc107;
        `;
        warningDiv.textContent = message;
        
        const main = document.querySelector('main');
        main.insertBefore(warningDiv, main.firstChild);
        
        setTimeout(() => {
            if (warningDiv.parentNode) {
                warningDiv.parentNode.removeChild(warningDiv);
            }
        }, 8000);
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        const main = document.querySelector('main');
        main.insertBefore(errorDiv, main.firstChild);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            background: #d1fae5;
            color: #065f46;
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
            border-left: 4px solid #10b981;
        `;
        successDiv.textContent = message;
        
        const main = document.querySelector('main');
        main.insertBefore(successDiv, main.firstChild);
        
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }

    bindEvents() {
        // Document input tracking
        document.getElementById('documentInput').addEventListener('input', (e) => this.handleDocumentInput(e));
        
        // Clear button
        document.getElementById('clearText').addEventListener('click', () => this.clearDocument());
        
        // Main action buttons
        document.getElementById('summarizeBtn').addEventListener('click', () => this.summarizeDocument());
        document.getElementById('explainBtn').addEventListener('click', () => this.explainDocument());
        document.getElementById('improveBtn').addEventListener('click', () => this.improveWriting());
        document.getElementById('translateBtn').addEventListener('click', () => this.showTranslateOptions());
        document.getElementById('askBtn').addEventListener('click', () => this.showQuestionInput());
        document.getElementById('checkGrammarBtn').addEventListener('click', () => this.checkGrammar());
        
        // Question section buttons
        document.getElementById('submitQuestion').addEventListener('click', () => this.askQuestion());
        document.getElementById('cancelQuestion').addEventListener('click', () => this.hideQuestionInput());
        
        // Translate section buttons
        document.getElementById('confirmTranslate').addEventListener('click', () => this.translateDocument());
        document.getElementById('cancelTranslate').addEventListener('click', () => this.hideTranslateOptions());
        
        // Character count
        document.getElementById('documentInput').addEventListener('input', (e) => this.updateCharCount(e));
        
        // File upload events
        document.getElementById('browseBtn').addEventListener('click', () => this.triggerFileInput());
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileSelect(e));
        document.getElementById('removeFile').addEventListener('click', () => this.removeFile());
        
        // Drag and drop events
        this.setupDragAndDrop();
        
        console.log('All events bound successfully');
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.processFile(files[0]);
            }
        });
        
        uploadArea.addEventListener('click', () => this.triggerFileInput());
    }

    triggerFileInput() {
        document.getElementById('fileInput').click();
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    async processFile(file) {
        // Check file type and size
        if (!this.isValidFile(file)) {
            this.showError('Please select a valid file (PDF, TXT, DOC, DOCX, PPT, PPTX) under 10MB.');
            return;
        }

        this.showFileInfo(file.name);

        try {
            this.showResult('📁 Processing File...', `Reading "${file.name}"...`);
            
            const text = await this.extractTextFromFile(file);
            document.getElementById('documentInput').value = text;
            this.currentDocument = text;
            this.updateCharCount();
            this.showSuccess(`"${file.name}" loaded successfully!`);
        } catch (error) {
            console.error('Error processing file:', error);
            this.showError('Failed to read file. Please try a different file or paste text directly.');
        }
    }

    isValidFile(file) {
        const validTypes = [
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];
        
        const maxSize = 10 * 1024 * 1024; // 10MB for PDFs
        
        // Check file extension as fallback
        const validExtensions = ['.pdf', '.txt', '.doc', '.docx', '.ppt', '.pptx'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        const isTypeValid = validTypes.includes(file.type) || validExtensions.includes(fileExtension);
        const isSizeValid = file.size <= maxSize;
        
        return isTypeValid && isSizeValid;
    }

    async extractTextFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    
                    if (file.type === 'text/plain') {
                        resolve(content);
                    } else if (file.type === 'application/pdf') {
                        this.extractTextFromPDF(content).then(resolve).catch(reject);
                    } else {
                        // For other file types
                        resolve(this.getFileInfoMessage(file));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            
            if (file.type === 'text/plain') {
                reader.readAsText(file);
            } else {
                reader.readAsArrayBuffer(file);
            }
        });
    }

    async extractTextFromPDF(arrayBuffer) {
        try {
            // Initialize PDF.js
            if (typeof pdfjsLib === 'undefined') {
                throw new Error('PDF.js library not loaded');
            }

            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
            
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            
            let fullText = '';
            const pageLimit = Math.min(pdf.numPages, 10); // Limit to 10 pages for performance
            
            console.log(`Processing PDF with ${pdf.numPages} pages...`);
            
            for (let pageNum = 1; pageNum <= pageLimit; pageNum++) {
                try {
                    const page = await pdf.getPage(pageNum);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    
                    if (pageText.trim()) {
                        fullText += `Page ${pageNum}:\n${pageText}\n\n`;
                    }
                    
                    // Show progress for large PDFs
                    if (pageNum % 3 === 0) {
                        this.showResult('📄 Processing PDF...', `Extracting text from page ${pageNum} of ${pageLimit}...`);
                    }
                } catch (pageError) {
                    console.warn(`Error processing page ${pageNum}:`, pageError);
                    fullText += `[Error extracting text from page ${pageNum}]\n\n`;
                }
            }
            
            if (pdf.numPages > pageLimit) {
                fullText += `\n[Note: Document truncated - ${pdf.numPages - pageLimit} additional pages not processed for performance.]\n`;
            }
            
            if (!fullText.trim()) {
                throw new Error('No text content could be extracted from this PDF.');
            }
            
            return fullText;
            
        } catch (error) {
            console.error('PDF extraction failed:', error);
            return this.getPDFFallbackMessage(error.message);
        }
    }

    getFileInfoMessage(file) {
        return `[File: ${file.name}]

This file format (${file.type}) requires specialized processing. 

For best results with DocuMind:
• Convert to PDF or TXT format
• Copy and paste the text content directly
• Use plain text files when possible

File Details:
• Name: ${file.name}
• Type: ${file.type}
• Size: ${(file.size / 1024).toFixed(2)} KB

You can still use the sample documents above to test DocuMind's features!`;
    }

    getPDFFallbackMessage(error) {
        return `[PDF Processing Notice]

We encountered an issue while processing this PDF: ${error}

To use this PDF with DocuMind:

Option 1 - Copy Text Manually:
• Open the PDF in your PDF viewer
• Select all text (Ctrl+A / Cmd+A)
• Copy (Ctrl+C / Cmd+C)
• Paste into the text area above

Option 2 - Convert to Text:
• Use online converters like SmallPDF or ILovePDF
• Save as .txt file
• Upload the converted file

Option 3 - Try Sample Documents:
• Use the sample documents below to test DocuMind's features

The AI features work best with clean text content.`;
    }

    showFileInfo(fileName) {
        document.getElementById('fileName').textContent = fileName;
        document.getElementById('fileInfo').style.display = 'flex';
    }

    removeFile() {
        document.getElementById('fileInput').value = '';
        document.getElementById('fileInfo').style.display = 'none';
        document.getElementById('documentInput').value = '';
        this.currentDocument = '';
        this.updateCharCount();
        this.showSuccess('File removed.');
    }

    setupExamples() {
        const exampleButtons = document.querySelectorAll('[data-example]');
        exampleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const exampleType = e.target.getAttribute('data-example');
                this.loadExample(exampleType);
            });
        });
    }

    loadExample(exampleType) {
        const examples = {
            legal: `LEASE AGREEMENT

This Residential Lease Agreement ("Agreement") is made and entered into on this 15th day of October, 2025, between John Smith ("Landlord") and Jane Doe ("Tenant").

1. PREMISES: Landlord rents to Tenant and Tenant rents from Landlord the premises located at 123 Main Street, Apartment 4B, Cityville, State 12345.

2. TERM: The initial term of this Lease shall be for a period of twelve (12) months, commencing on November 1, 2025, and ending on October 31, 2026.

3. RENT: Tenant shall pay Landlord rent in the amount of $1,500 per month, due on the first day of each month.

4. SECURITY DEPOSIT: Upon execution of this Agreement, Tenant shall deposit with Landlord the sum of $1,500 as a security deposit.

5. MAINTENANCE AND REPAIRS: Tenant will keep the premises in clean, sanitary, and good condition. Tenant shall be responsible for any damage caused by their negligence.

6. DEFAULT: If Tenant fails to pay rent when due, Landlord may terminate this Agreement after providing 3 days written notice.`,

            technical: `API DOCUMENTATION: User Authentication Endpoint

Endpoint: POST /api/v1/auth/login
Description: Authenticates a user and returns an access token.

Request Headers:
- Content-Type: application/json

Request Body:
{
  "username": "string (required)",
  "password": "string (required)",
  "remember_me": "boolean (optional)"
}

Response (Success - 200 OK):
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": 12345,
      "username": "johndoe",
      "email": "john@example.com"
    }
  }
}

Response (Error - 401 Unauthorized):
{
  "status": "error",
  "message": "Invalid credentials",
  "code": "AUTH_001"
}

Security Notes:
- Rate limiting: 5 attempts per minute per IP
- Tokens expire after 1 hour
- Use HTTPS only in production`,

            article: `BREAKING: Major Breakthrough in Renewable Energy Storage

Scientists at the National Energy Research Institute have announced a groundbreaking development in battery technology that could revolutionize renewable energy storage. The new solid-state battery design promises to store three times more energy than current lithium-ion batteries while charging in just 15 minutes.

Dr. Maria Rodriguez, lead researcher on the project, stated: "This technology addresses the fundamental limitation of renewable energy - intermittent supply. With our new storage solution, solar and wind power can provide reliable 24/7 energy regardless of weather conditions."

The breakthrough involves a novel graphene-composite material that allows for faster ion transfer while maintaining structural stability. Early tests show the batteries can withstand over 10,000 charge cycles with minimal degradation.

Industry analysts predict this could accelerate the transition away from fossil fuels by 5-10 years. Several major automotive and energy companies have already expressed interest in licensing the technology.

The research team expects commercial prototypes to be available within 18-24 months, with mass production potentially starting by 2027.`,

            email: `Subject: Project Phoenix Update and Q4 Planning Meeting

Dear Team,

I hope this message finds you well. I'm writing to provide an update on Project Phoenix and to schedule our Q4 planning session.

Key Accomplishments This Month:
- Successfully deployed the new user authentication system
- Completed performance optimization, reducing load times by 40%
- Onboarded 3 new development team members

Upcoming Priorities:
1. Implement the new payment processing module (Due: Nov 15)
2. Conduct comprehensive security audit (Due: Nov 30)
3. Begin development of mobile application (Starting Dec 1)

I've scheduled a Q4 planning meeting for this Friday, October 25th at 2:00 PM in Conference Room B. Please come prepared to discuss:
- Resource allocation for Q4 projects
- Timeline adjustments based on current progress
- Risk assessment and mitigation strategies

Please RSVP by tomorrow and let me know if you have any specific topics to add to the agenda.

Best regards,

Sarah Johnson
Project Manager
Innovation Technologies Inc.`
        };

        if (examples[exampleType]) {
            document.getElementById('documentInput').value = examples[exampleType];
            this.currentDocument = examples[exampleType];
            this.updateCharCount();
            this.showSuccess(`Loaded ${exampleType} example!`);
        }
    }

    handleDocumentInput(event) {
        this.currentDocument = event.target.value;
        
        // Clear previous grammar timeout
        clearTimeout(this.grammarTimeout);
    }

    updateCharCount() {
        const text = document.getElementById('documentInput').value;
        const charCount = text.length;
        document.getElementById('charCount').textContent = `${charCount} characters`;
    }

    clearDocument() {
        document.getElementById('documentInput').value = '';
        this.currentDocument = '';
        this.updateCharCount();
        document.getElementById('results').innerHTML = `
            <div class="welcome-message">
                <h3>Document Cleared!</h3>
                <p>Paste a new document to get started, or try one of the examples above.</p>
            </div>
        `;
    }

    validateDocument() {
        if (!this.currentDocument.trim()) {
            this.showError('Please paste or type a document first!');
            return false;
        }
        
        if (this.currentDocument.length < 10) {
            this.showError('Document is too short. Please provide more content.');
            return false;
        }
        
        return true;
    }

    async summarizeDocument() {
        if (!this.validateDocument()) return;

        const button = document.getElementById('summarizeBtn');
        const originalText = button.textContent;
        
        button.textContent = 'Summarizing...';
        button.disabled = true;

        try {
            this.showResult('📄 Summarizing Document...', 'Processing your document, please wait...');
            
            const summary = await this.documentService.summarize(this.currentDocument);
            
            this.showResult('📄 Document Summary', summary);
            this.showSuccess('Document summarized successfully!');
            
        } catch (error) {
            console.error('Error summarizing document:', error);
            this.showError('Failed to summarize document. Please try again.');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }

    async explainDocument() {
        if (!this.validateDocument()) return;

        const button = document.getElementById('explainBtn');
        const originalText = button.textContent;
        
        button.textContent = 'Explaining...';
        button.disabled = true;

        try {
            this.showResult('🔍 Analyzing Document...', 'Breaking down the document for better understanding...');
            
            const explanation = await this.documentService.explain(this.currentDocument);
            
            this.showResult('🔍 Document Explanation', explanation);
            this.showSuccess('Document explained successfully!');
            
        } catch (error) {
            console.error('Error explaining document:', error);
            this.showError('Failed to explain document. Please try again.');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }

    async improveWriting() {
        if (!this.validateDocument()) return;

        const button = document.getElementById('improveBtn');
        const originalText = button.textContent;
        
        button.textContent = 'Improving...';
        button.disabled = true;

        try {
            this.showResult('✏️ Improving Writing...', 'Enhancing clarity and professionalism...');
            
            const improved = await this.documentService.improveWriting(this.currentDocument);
            
            this.showResult('✏️ Improved Version', improved);
            this.showSuccess('Writing improved successfully!');
            
        } catch (error) {
            console.error('Error improving writing:', error);
            this.showError('Failed to improve writing. Please try again.');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }

    async checkGrammar() {
        if (!this.validateDocument()) return;

        const button = document.getElementById('checkGrammarBtn');
        const originalText = button.textContent;
        
        button.textContent = 'Checking...';
        button.disabled = true;

        try {
            this.showResult('✓ Checking Grammar...', 'Scanning for grammar and spelling issues...');
            
            const result = await this.documentService.checkGrammar(this.currentDocument);
            
            if (result.corrections.length === 0) {
                this.showResult('✓ Grammar Check', 'No grammar issues found! Your document looks great.');
            } else {
                const correctionsHtml = result.corrections.map(correction => 
                    `<div class="grammar-correction">
                        <strong>Suggestion:</strong> <span class="correction-suggestion">${correction.suggestion}</span>
                        ${correction.context ? `<br><em>Context:</em> "${correction.context}"` : ''}
                    </div>`
                ).join('');
                
                this.showResult('✓ Grammar Check', 
                    `Found ${result.corrections.length} potential issue(s):${correctionsHtml}`
                );
            }
            
            this.showSuccess('Grammar check completed!');
            
        } catch (error) {
            console.error('Error checking grammar:', error);
            this.showError('Failed to check grammar. Please try again.');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }

    showTranslateOptions() {
        if (!this.validateDocument()) return;
        
        document.getElementById('translateSection').style.display = 'flex';
        document.getElementById('questionSection').style.display = 'none';
    }

    hideTranslateOptions() {
        document.getElementById('translateSection').style.display = 'none';
    }

    async translateDocument() {
        const targetLang = document.getElementById('targetLanguage').value;
        const langNames = { es: 'Spanish', fr: 'French', de: 'German', ja: 'Japanese', zh: 'Chinese' };
        
        const button = document.getElementById('confirmTranslate');
        const originalText = button.textContent;
        
        button.textContent = 'Translating...';
        button.disabled = true;

        try {
            this.showResult('🌐 Translating...', `Translating to ${langNames[targetLang]}...`);
            
            const translation = await this.documentService.translate(this.currentDocument, targetLang);
            
            this.showResult(`🌐 Translation (${langNames[targetLang]})`, translation);
            this.showSuccess(`Translated to ${langNames[targetLang]} successfully!`);
            
        } catch (error) {
            console.error('Error translating document:', error);
            this.showError('Failed to translate document. Please try again.');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
            this.hideTranslateOptions();
        }
    }

    showQuestionInput() {
        if (!this.validateDocument()) return;
        
        document.getElementById('questionSection').style.display = 'flex';
        document.getElementById('translateSection').style.display = 'none';
        document.getElementById('questionInput').focus();
    }

    hideQuestionInput() {
        document.getElementById('questionSection').style.display = 'none';
        document.getElementById('questionInput').value = '';
    }

    async askQuestion() {
        const question = document.getElementById('questionInput').value.trim();
        
        if (!question) {
            this.showError('Please enter a question!');
            return;
        }

        const button = document.getElementById('submitQuestion');
        const originalText = button.textContent;
        
        button.textContent = 'Thinking...';
        button.disabled = true;

        try {
            this.showResult('❓ Processing Question...', `Finding answer to: "${question}"`);
            
            const answer = await this.documentService.askQuestion(this.currentDocument, question);
            
            this.showResult(`❓ Q: ${question}`, answer);
            this.showSuccess('Question answered successfully!');
            
        } catch (error) {
            console.error('Error answering question:', error);
            this.showError('Failed to answer question. Please try again.');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
            this.hideQuestionInput();
        }
    }

    showResult(title, content) {
        const results = document.getElementById('results');
        results.innerHTML = `
            <div class="result-item">
                <div class="result-header">
                    <div class="result-type">${title}</div>
                </div>
                <div class="result-content">${content}</div>
            </div>
        `;
    }

    destroy() {
        this.documentService.destroy();
    }
}

// Initialize the app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new DocuMindApp();
    window.app = app;
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (app) {
        app.destroy();
    }
});