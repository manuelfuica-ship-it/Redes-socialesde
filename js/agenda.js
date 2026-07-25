// Agenda App - Contact Manager
class AgendaApp {
    constructor() {
        this.contacts = [];
        this.currentEditId = null;
        this.duplicates = [];
        this.init();
    }

    init() {
        this.loadContacts();
        this.setupEventListeners();
        this.renderContacts();
    }

    // Storage
    loadContacts() {
        const stored = localStorage.getItem('agenda_contacts');
        this.contacts = stored ? JSON.parse(stored) : [];
    }

    saveContacts() {
        localStorage.setItem('agenda_contacts', JSON.stringify(this.contacts));
    }

    // UI Event Listeners
    setupEventListeners() {
        // Tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Buttons
        document.getElementById('addContactBtn').addEventListener('click', () => this.openContactModal());
        document.getElementById('scanDuplicatesBtn').addEventListener('click', () => this.scanDuplicates());
        document.getElementById('importBtn').addEventListener('click', () => this.importContacts());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportCSV());
        document.getElementById('exportJsonBtn').addEventListener('click', () => this.exportJSON());
        document.getElementById('backupBtn').addEventListener('click', () => this.createBackup());
        document.getElementById('deleteAllBtn').addEventListener('click', () => this.deleteAll());
        document.getElementById('menuBtn').addEventListener('click', () => this.toggleMenu());

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterContacts(e.target.value);
        });

        // Contact Form
        document.getElementById('contactForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveContact();
        });

        // Modal Controls
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('active');
            });
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            document.getElementById('contactModal').classList.remove('active');
        });

        document.getElementById('mergeCancelBtn').addEventListener('click', () => {
            document.getElementById('mergeModal').classList.remove('active');
        });

        document.getElementById('mergeMergeBtn').addEventListener('click', () => {
            this.performMerge();
        });
    }

    // Tab Management
    switchTab(tabName) {
        // Update tabs
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    // Contact Management
    openContactModal(id = null) {
        this.currentEditId = id;
        const modal = document.getElementById('contactModal');
        const form = document.getElementById('contactForm');

        if (id) {
            const contact = this.contacts.find(c => c.id === id);
            document.getElementById('modalTitle').textContent = 'Editar Contacto';
            document.getElementById('name').value = contact.name;
            document.getElementById('phone').value = contact.phone || '';
            document.getElementById('email').value = contact.email || '';
            document.getElementById('notes').value = contact.notes || '';
        } else {
            document.getElementById('modalTitle').textContent = 'Nuevo Contacto';
            form.reset();
        }

        modal.classList.add('active');
    }

    saveContact() {
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const notes = document.getElementById('notes').value.trim();

        if (!name) {
            this.showToast('El nombre es requerido', 'error');
            return;
        }

        if (this.currentEditId) {
            const contact = this.contacts.find(c => c.id === this.currentEditId);
            contact.name = name;
            contact.phone = phone;
            contact.email = email;
            contact.notes = notes;
            this.showToast('Contacto actualizado', 'success');
        } else {
            this.contacts.push({
                id: Date.now(),
                name,
                phone,
                email,
                notes,
                createdAt: new Date().toISOString()
            });
            this.showToast('Contacto agregado', 'success');
        }

        this.saveContacts();
        this.renderContacts();
        document.getElementById('contactModal').classList.remove('active');
    }

    deleteContact(id) {
        if (!confirm('¿Está seguro de que desea eliminar este contacto?')) return;

        this.contacts = this.contacts.filter(c => c.id !== id);
        this.saveContacts();
        this.renderContacts();
        this.showToast('Contacto eliminado', 'success');
    }

    // Render
    renderContacts(contactsToRender = null) {
        const container = document.getElementById('contactsList');
        const list = contactsToRender || this.contacts;

        if (list.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>📭 No hay contactos</p>
                    <small>Crea uno para comenzar</small>
                </div>
            `;
            return;
        }

        // Sort by name
        const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name));

        container.innerHTML = sorted.map(contact => `
            <div class="contact-card">
                <div class="contact-info">
                    <div class="contact-name">${this.escapeHtml(contact.name)}</div>
                    <div class="contact-details">
                        ${contact.phone ? `<span>📱 ${this.escapeHtml(contact.phone)}</span>` : ''}
                        ${contact.email ? `<span>✉️ ${this.escapeHtml(contact.email)}</span>` : ''}
                    </div>
                </div>
                <div class="contact-actions">
                    <button class="contact-btn" data-id="${contact.id}" data-action="edit" title="Editar">✏️</button>
                    <button class="contact-btn" data-id="${contact.id}" data-action="delete" title="Eliminar">🗑️</button>
                </div>
            </div>
        `).join('');

        // Event listeners for contact actions
        container.querySelectorAll('.contact-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                const action = btn.dataset.action;
                if (action === 'edit') this.openContactModal(id);
                if (action === 'delete') this.deleteContact(id);
            });
        });
    }

    filterContacts(query) {
        if (!query) {
            this.renderContacts();
            return;
        }

        const filtered = this.contacts.filter(c => {
            const q = query.toLowerCase();
            return c.name.toLowerCase().includes(q) ||
                   c.phone?.toLowerCase().includes(q) ||
                   c.email?.toLowerCase().includes(q);
        });

        this.renderContacts(filtered);
    }

    // Duplicate Detection
    scanDuplicates() {
        this.duplicates = [];
        const checked = new Set();

        for (let i = 0; i < this.contacts.length; i++) {
            for (let j = i + 1; j < this.contacts.length; j++) {
                const id1 = this.contacts[i].id;
                const id2 = this.contacts[j].id;
                const key = `${id1}-${id2}`;

                if (checked.has(key)) continue;
                checked.add(key);

                const similarity = this.calculateSimilarity(this.contacts[i], this.contacts[j]);
                if (similarity >= 0.6) {
                    this.duplicates.push({
                        similarity,
                        contact1: this.contacts[i],
                        contact2: this.contacts[j]
                    });
                }
            }
        }

        this.duplicates.sort((a, b) => b.similarity - a.similarity);
        this.renderDuplicates();

        if (this.duplicates.length === 0) {
            this.showToast('✅ Sin duplicados detectados', 'success');
        } else {
            this.showToast(`🔍 ${this.duplicates.length} grupo(s) de duplicados encontrados`, 'warning');
        }
    }

    calculateSimilarity(c1, c2) {
        let score = 0;
        const weights = {
            name: 0.5,
            phone: 0.3,
            email: 0.2
        };

        // Name similarity (Levenshtein-based)
        if (c1.name && c2.name) {
            const similarity = this.stringSimilarity(c1.name, c2.name);
            score += similarity * weights.name;
        }

        // Phone exact match
        if (c1.phone && c2.phone && c1.phone === c2.phone) {
            score += weights.phone;
        } else if (c1.phone && c2.phone) {
            const clean1 = c1.phone.replace(/\D/g, '');
            const clean2 = c2.phone.replace(/\D/g, '');
            if (clean1 === clean2 && clean1.length >= 5) {
                score += weights.phone;
            }
        }

        // Email exact match
        if (c1.email && c2.email && c1.email.toLowerCase() === c2.email.toLowerCase()) {
            score += weights.email;
        }

        return Math.min(score, 1);
    }

    stringSimilarity(str1, str2) {
        const s1 = str1.toLowerCase().trim();
        const s2 = str2.toLowerCase().trim();

        if (s1 === s2) return 1;
        if (!s1 || !s2) return 0;

        const longer = s1.length > s2.length ? s1 : s2;
        const shorter = s1.length > s2.length ? s2 : s1;

        if (longer.includes(shorter)) return 0.9;

        const distance = this.levenshtein(longer, shorter);
        return 1 - (distance / longer.length);
    }

    levenshtein(s1, s2) {
        const costs = [];
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i === 0) costs[j] = j;
                else if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
            if (i > 0) costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    }

    renderDuplicates() {
        const container = document.getElementById('duplicatesList');

        if (this.duplicates.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>✅ Sin duplicados detectados</p>
                    <small>Ejecuta un escaneo para verificar</small>
                </div>
            `;
            return;
        }

        container.innerHTML = this.duplicates.map((dup, idx) => `
            <div class="duplicate-group">
                <div class="duplicate-group-title">Grupo ${idx + 1} (Similitud: ${(dup.similarity * 100).toFixed(0)}%)</div>
                <div class="duplicate-items">
                    <div class="duplicate-item">
                        <div class="duplicate-item-name">${this.escapeHtml(dup.contact1.name)}</div>
                        <div class="duplicate-item-meta">
                            ${dup.contact1.phone ? '📱 ' + this.escapeHtml(dup.contact1.phone) + ' ' : ''}
                            ${dup.contact1.email ? '✉️ ' + this.escapeHtml(dup.contact1.email) : ''}
                        </div>
                    </div>
                    <div class="duplicate-item">
                        <div class="duplicate-item-name">${this.escapeHtml(dup.contact2.name)}</div>
                        <div class="duplicate-item-meta">
                            ${dup.contact2.phone ? '📱 ' + this.escapeHtml(dup.contact2.phone) + ' ' : ''}
                            ${dup.contact2.email ? '✉️ ' + this.escapeHtml(dup.contact2.email) : ''}
                        </div>
                    </div>
                </div>
                <div class="duplicate-actions">
                    <button class="btn btn-primary" data-idx="${idx}" style="flex: 1;">
                        Fusionar
                    </button>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.dataset.idx);
                this.openMergeModal(idx);
            });
        });
    }

    openMergeModal(idx) {
        const dup = this.duplicates[idx];
        this.currentMergeIdx = idx;

        const content = document.getElementById('mergeContent');
        content.innerHTML = `
            <div class="merge-option selected" data-choice="1">
                <div class="merge-option-title">Opción 1 (Recomendado)</div>
                <div class="merge-option-details">
                    <strong>${this.escapeHtml(dup.contact1.name)}</strong><br>
                    ${dup.contact1.phone || dup.contact2.phone ? '📱 ' + (dup.contact1.phone || dup.contact2.phone) : ''}<br>
                    ${dup.contact1.email || dup.contact2.email ? '✉️ ' + (dup.contact1.email || dup.contact2.email) : ''}
                </div>
            </div>
            <div class="merge-option" data-choice="2">
                <div class="merge-option-title">Opción 2</div>
                <div class="merge-option-details">
                    <strong>${this.escapeHtml(dup.contact2.name)}</strong><br>
                    ${dup.contact2.phone || dup.contact1.phone ? '📱 ' + (dup.contact2.phone || dup.contact1.phone) : ''}<br>
                    ${dup.contact2.email || dup.contact1.email ? '✉️ ' + (dup.contact2.email || dup.contact1.email) : ''}
                </div>
            </div>
        `;

        document.querySelectorAll('.merge-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.merge-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
            });
        });

        document.getElementById('mergeModal').classList.add('active');
    }

    performMerge() {
        const dup = this.duplicates[this.currentMergeIdx];
        const choice = document.querySelector('.merge-option.selected').dataset.choice;
        const keepContact = choice === '1' ? dup.contact1 : dup.contact2;
        const removeContact = choice === '1' ? dup.contact2 : dup.contact1;

        // Merge data
        if (!keepContact.phone && removeContact.phone) keepContact.phone = removeContact.phone;
        if (!keepContact.email && removeContact.email) keepContact.email = removeContact.email;
        if (!keepContact.notes && removeContact.notes) keepContact.notes = removeContact.notes;

        // Remove duplicate
        this.contacts = this.contacts.filter(c => c.id !== removeContact.id);
        this.saveContacts();
        this.renderContacts();
        document.getElementById('mergeModal').classList.remove('active');
        this.showToast('Contactos fusionados', 'success');
        this.scanDuplicates();
    }

    // Import/Export
    importContacts() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.json,.vcf';
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    if (file.name.endsWith('.json')) {
                        const data = JSON.parse(event.target.result);
                        this.contacts.push(...data);
                    } else if (file.name.endsWith('.csv')) {
                        this.importCSV(event.target.result);
                    } else if (file.name.endsWith('.vcf')) {
                        this.importVCF(event.target.result);
                    }
                    this.saveContacts();
                    this.renderContacts();
                    this.showToast(`✅ Importados ${this.contacts.length} contactos`, 'success');
                } catch (error) {
                    this.showToast('Error al importar: ' + error.message, 'error');
                }
            };
            reader.readAsText(file);
        });
        input.click();
    }

    importCSV(csv) {
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            const values = lines[i].split(',').map(v => v.trim());
            const obj = {};
            headers.forEach((h, idx) => {
                obj[h] = values[idx] || '';
            });

            if (obj.name || obj.nombre) {
                this.contacts.push({
                    id: Date.now() + i,
                    name: obj.name || obj.nombre,
                    phone: obj.phone || obj.telefono || '',
                    email: obj.email || obj.correo || '',
                    notes: obj.notes || obj.notas || '',
                    createdAt: new Date().toISOString()
                });
            }
        }
    }

    importVCF(vcf) {
        const contacts = vcf.split('BEGIN:VCARD');
        contacts.forEach((card, idx) => {
            if (idx === 0 || !card.includes('FN:')) return;

            const fnMatch = card.match(/FN:(.+)/);
            const telMatch = card.match(/TEL[^:]*:(.+)/);
            const emailMatch = card.match(/EMAIL[^:]*:(.+)/);

            if (fnMatch) {
                this.contacts.push({
                    id: Date.now() + idx,
                    name: fnMatch[1].trim(),
                    phone: telMatch ? telMatch[1].trim() : '',
                    email: emailMatch ? emailMatch[1].trim() : '',
                    notes: '',
                    createdAt: new Date().toISOString()
                });
            }
        });
    }

    exportCSV() {
        const headers = ['Nombre', 'Teléfono', 'Email', 'Notas'];
        const rows = this.contacts.map(c => [
            this.escapeCSV(c.name),
            this.escapeCSV(c.phone || ''),
            this.escapeCSV(c.email || ''),
            this.escapeCSV(c.notes || '')
        ]);

        const csv = [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');

        this.downloadFile(csv, 'agenda.csv', 'text/csv');
        this.showToast('📥 Exportado como CSV', 'success');
    }

    exportJSON() {
        const json = JSON.stringify(this.contacts, null, 2);
        this.downloadFile(json, 'agenda.json', 'application/json');
        this.showToast('📥 Exportado como JSON', 'success');
    }

    createBackup() {
        const backup = {
            version: '1.0.0',
            date: new Date().toISOString(),
            contacts: this.contacts
        };
        const json = JSON.stringify(backup, null, 2);
        this.downloadFile(json, `agenda-backup-${new Date().getTime()}.json`, 'application/json');
        this.showToast('🔄 Respaldo creado', 'success');
    }

    downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    escapeCSV(str) {
        if (!str) return '';
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    }

    deleteAll() {
        if (!confirm('⚠️ ¿ESTÁ SEGURO? Esto eliminará TODOS los contactos y no se puede deshacer.')) return;
        if (!confirm('Esta es su última oportunidad para cancelar. ¿Continuar?')) return;

        this.contacts = [];
        this.saveContacts();
        this.renderContacts();
        this.showToast('✅ Todos los contactos fueron eliminados', 'success');
    }

    // Utilities
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    toggleMenu() {
        this.showToast('Menú de opciones', 'warning');
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    new AgendaApp();
});
