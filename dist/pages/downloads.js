"use strict";
class DownloadsPage {
    constructor() {
        this.documents = [];
        this.activeCategory = 'all';
        this.activeType = 'all';
        this.searchQuery = '';
        this.isLoading = false;
        this.initializeEventListeners();
        this.loadDocuments();
    }
    async loadDocuments() {
        this.isLoading = true;
        this.showLoadingState();
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            // In a real application, this would be an API call
            this.documents = [
                {
                    id: '1',
                    title: 'League Rules and Regulations 2025',
                    type: 'pdf',
                    category: 'rules',
                    size: '2.4 MB',
                    date: '2025-01-15',
                    tags: ['rules', 'regulations', '2025'],
                    downloadUrl: '/documents/league-rules-2025.pdf',
                    previewUrl: '/previews/league-rules-2025.pdf'
                },
                {
                    id: '2',
                    title: 'Player Registration Form',
                    type: 'docx',
                    category: 'forms',
                    size: '156 KB',
                    date: '2025-02-01',
                    tags: ['registration', 'forms', 'players'],
                    downloadUrl: '/documents/player-registration.docx',
                    previewUrl: '/previews/player-registration.pdf'
                },
                {
                    id: '3',
                    title: 'Season Schedule 2025',
                    type: 'xlsx',
                    category: 'schedules',
                    size: '345 KB',
                    date: '2025-01-20',
                    tags: ['schedule', '2025', 'games'],
                    downloadUrl: '/documents/season-schedule-2025.xlsx',
                    previewUrl: '/previews/season-schedule-2025.pdf'
                },
                {
                    id: '4',
                    title: 'Team Manager Guide',
                    type: 'pdf',
                    category: 'resources',
                    size: '1.8 MB',
                    date: '2025-01-10',
                    tags: ['guide', 'managers', 'teams'],
                    downloadUrl: '/documents/team-manager-guide.pdf',
                    previewUrl: '/previews/team-manager-guide.pdf'
                },
                {
                    id: '5',
                    title: 'Umpire Registration Form',
                    type: 'docx',
                    category: 'forms',
                    size: '142 KB',
                    date: '2025-02-05',
                    tags: ['registration', 'forms', 'umpires'],
                    downloadUrl: '/documents/umpire-registration.docx',
                    previewUrl: '/previews/umpire-registration.pdf'
                }
            ];
            this.renderDocuments();
        }
        catch (error) {
            console.error('Error loading documents:', error);
            this.showError('Failed to load documents. Please try again later.');
        }
        finally {
            this.isLoading = false;
        }
    }
    showLoadingState() {
        const grid = document.querySelector('.documents-grid');
        if (!grid)
            return;
        grid.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Loading documents...</p>
            </div>
        `;
    }
    showError(message) {
        const grid = document.querySelector('.documents-grid');
        if (!grid)
            return;
        grid.innerHTML = `
            <div class="error-state">
                <i class="far fa-exclamation-circle"></i>
                <h3>Oops! Something went wrong</h3>
                <p>${message}</p>
                <button class="btn-retry" onclick="location.reload()">Try Again</button>
            </div>
        `;
    }
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="far fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    async downloadDocument(url) {
        try {
            // In a real application, you might want to check if the file exists first
            const response = await fetch(url);
            if (!response.ok)
                throw new Error('File not found');
            window.location.href = url;
            this.showToast('Download started successfully');
        }
        catch (error) {
            console.error('Error downloading document:', error);
            this.showToast('Failed to download document. Please try again.', 'error');
        }
    }
    previewDocument(url) {
        try {
            window.open(url, '_blank');
        }
        catch (error) {
            console.error('Error previewing document:', error);
            this.showToast('Failed to preview document. Please try again.', 'error');
        }
    }
    setupEventListeners() {
        this.setupFilters();
        this.setupSearch();
        this.setupKeyboardNavigation();
    }
    setupKeyboardNavigation() {
        // Handle keyboard navigation for filter buttons
        const handleKeyPress = (e, buttons) => {
            const current = document.activeElement;
            const list = Array.from(buttons);
            const index = list.indexOf(current);
            let next;
            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    next = list[index + 1] || list[0];
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    next = list[index - 1] || list[list.length - 1];
                    break;
                case 'Home':
                    next = list[0];
                    break;
                case 'End':
                    next = list[list.length - 1];
                    break;
            }
            if (next && next instanceof HTMLElement) {
                next.focus();
                e.preventDefault();
            }
        };
        // Category filters keyboard navigation
        const categoryFilters = document.querySelector('.category-filter')?.parentElement;
        if (categoryFilters) {
            categoryFilters.addEventListener('keydown', (e) => {
                handleKeyPress(e, categoryFilters.querySelectorAll('.category-filter'));
            });
        }
        // Type filters keyboard navigation
        const typeFilters = document.querySelector('.type-filter')?.parentElement;
        if (typeFilters) {
            typeFilters.addEventListener('keydown', (e) => {
                handleKeyPress(e, typeFilters.querySelectorAll('.type-filter'));
            });
        }
        // Document cards keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const searchInput = document.querySelector('#document-search');
                if (searchInput === document.activeElement) {
                    searchInput.blur();
                }
            }
        });
    }
    setupFilters() {
        // Category filters
        document.querySelectorAll('.category-filter').forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target;
                this.activeCategory = target.dataset.category || 'all';
                this.updateActiveFilters();
                this.renderDocuments();
            });
        });
        // Type filters
        document.querySelectorAll('.type-filter').forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target;
                this.activeType = target.dataset.type || 'all';
                this.updateActiveFilters();
                this.renderDocuments();
            });
        });
    }
    setupSearch() {
        const searchInput = document.querySelector('#document-search');
        let debounceTimer;
        searchInput?.addEventListener('input', (e) => {
            const target = e.target;
            clearTimeout(debounceTimer);
            debounceTimer = window.setTimeout(() => {
                this.searchQuery = target.value.toLowerCase();
                this.renderDocuments();
            }, 300);
        });
    }
    updateActiveFilters() {
        // Update category filters
        document.querySelectorAll('.category-filter').forEach(button => {
            const category = button.getAttribute('data-category');
            const isActive = category === this.activeCategory;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', isActive.toString());
        });
        // Update type filters
        document.querySelectorAll('.type-filter').forEach(button => {
            const type = button.getAttribute('data-type');
            const isActive = type === this.activeType;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', isActive.toString());
        });
    }
    renderDocuments() {
        const grid = document.querySelector('.documents-grid');
        if (!grid)
            return;
        const filteredDocs = this.documents.filter(doc => {
            const matchesCategory = this.activeCategory === 'all' || doc.category === this.activeCategory;
            const matchesType = this.activeType === 'all' || doc.type === this.activeType;
            const matchesSearch = !this.searchQuery ||
                doc.title.toLowerCase().includes(this.searchQuery) ||
                doc.tags.some(tag => tag.toLowerCase().includes(this.searchQuery));
            return matchesCategory && matchesType && matchesSearch;
        });
        if (filteredDocs.length === 0) {
            grid.innerHTML = this.getEmptyStateHTML();
            return;
        }
        grid.innerHTML = filteredDocs.map(doc => this.getDocumentCardHTML(doc)).join('');
        this.setupDocumentActions();
    }
    getDocumentCardHTML(doc) {
        return `
            <div class="document-card" 
                data-id="${doc.id}"
                tabindex="0"
                role="article"
                aria-labelledby="doc-title-${doc.id}"
            >
                <div class="document-preview" aria-hidden="true">
                    <i class="far ${this.getFileIcon(doc.type)}"></i>
                </div>
                <div class="document-info">
                    <h3 class="document-title" id="doc-title-${doc.id}">${doc.title}</h3>
                    <div class="document-meta">
                        <div class="meta-item">
                            <i class="far fa-file" aria-hidden="true"></i>
                            <span>${doc.type.toUpperCase()}</span>
                        </div>
                        <div class="meta-item">
                            <i class="far fa-hard-drive" aria-hidden="true"></i>
                            <span>${doc.size}</span>
                        </div>
                        <div class="meta-item">
                            <i class="far fa-calendar" aria-hidden="true"></i>
                            <span>${this.formatDate(doc.date)}</span>
                        </div>
                    </div>
                    <div class="document-tags" role="list">
                        ${doc.tags.map(tag => `
                            <span class="tag" role="listitem">${tag}</span>
                        `).join('')}
                    </div>
                    <div class="document-actions">
                        <button class="btn-download" 
                            data-url="${doc.downloadUrl}"
                            aria-label="Download ${doc.title}"
                        >
                            <i class="far fa-download" aria-hidden="true"></i>
                            Download
                        </button>
                        <button class="btn-preview" 
                            data-url="${doc.previewUrl}"
                            aria-label="Preview ${doc.title}"
                        >
                            <i class="far fa-eye" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <i class="far fa-folder-open"></i>
                <h3>No documents found</h3>
                <p>Try adjusting your filters or search query</p>
            </div>
        `;
    }
    setupDocumentActions() {
        // Download buttons
        document.querySelectorAll('.btn-download').forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target;
                const url = target.dataset.url;
                if (url) {
                    this.downloadDocument(url);
                }
            });
        });
        // Preview buttons
        document.querySelectorAll('.btn-preview').forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target;
                const url = target.dataset.url;
                if (url) {
                    this.previewDocument(url);
                }
            });
        });
    }
    getFileIcon(type) {
        const icons = {
            pdf: 'fa-file-pdf',
            docx: 'fa-file-word',
            xlsx: 'fa-file-excel',
            pptx: 'fa-file-powerpoint',
            zip: 'fa-file-archive',
            txt: 'fa-file-alt'
        };
        return icons[type] || 'fa-file';
    }
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}
// Initialize the downloads page
document.addEventListener('DOMContentLoaded', () => {
    new DownloadsPage();
});
