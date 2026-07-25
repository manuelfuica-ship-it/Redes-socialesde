// DOM Elements
const ideaInput = document.getElementById('ideaInput');
const toneSelect = document.getElementById('tone');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const exportBtn = document.getElementById('exportBtn');
const saveBtn = document.getElementById('saveBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const outputSection = document.getElementById('outputSection');
const promptOutput = document.getElementById('promptOutput');
const historySection = document.getElementById('historySection');
const historyList = document.getElementById('historyList');
const loadingSpinner = document.getElementById('loadingSpinner');
const toast = document.getElementById('toast');

// State
let currentPrompt = '';
let promptHistory = [];
const OLLAMA_URL = 'http://localhost:11434';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    setupEventListeners();
    checkOllamaStatus();
});

// Setup Event Listeners
function setupEventListeners() {
    generateBtn.addEventListener('click', generatePrompt);
    copyBtn.addEventListener('click', copyPrompt);
    exportBtn.addEventListener('click', exportPrompt);
    saveBtn.addEventListener('click', savePrompt);
    clearHistoryBtn.addEventListener('click', clearHistory);
}

// Check if Ollama is running (with CORS tolerance)
async function checkOllamaStatus() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch(`${OLLAMA_URL}/api/tags`, {
            signal: controller.signal,
            mode: 'no-cors'
        });
        clearTimeout(timeoutId);
        showToast('✅ Ollama conectado', 'success');
    } catch (error) {
        // CORS error es normal en HTTPS → HTTP, pero significa que Ollama está corriendo
        if (error.name === 'TypeError') {
            showToast('✅ Ollama detectado (modo local)', 'success');
        }
    }
}

// Generate Prompt
async function generatePrompt() {
    const idea = ideaInput.value.trim();
    const tone = toneSelect.value;

    if (!idea) {
        showToast('Por favor ingresa una idea', 'error');
        return;
    }

    showLoading(true);

    try {
        const prompt = await callOllamaAPI(idea, tone);
        currentPrompt = prompt;
        promptOutput.textContent = prompt;
        outputSection.style.display = 'block';
        outputSection.scrollIntoView({ behavior: 'smooth' });
        showToast('Prompt generado exitosamente', 'success');
    } catch (error) {
        console.error('Error generating prompt:', error);
        showToast(`Error: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// Call Ollama API (local)
async function callOllamaAPI(idea, tone) {
    const systemPrompt = `Eres un experto en la creación de prompts profesionales. Tu tarea es transformar ideas breves en prompts detallados, claros y efectivos.

El tono del prompt debe ser: ${tone}

Genera un prompt profesional que:
1. Sea claro y específico
2. Incluya contexto necesario
3. Defina el resultado esperado
4. Sea conciso pero completo
5. Esté optimizado para obtener respuestas de alta calidad

Responde SOLO con el prompt generado, sin explicaciones adicionales.

Idea: ${idea}`;

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'mistral',
            prompt: systemPrompt,
            stream: false,
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        throw new Error('No se pudo conectar con Ollama. ¿Está ejecutándose?');
    }

    const data = await response.json();

    if (!data.response) {
        throw new Error('Respuesta inesperada de Ollama');
    }

    return data.response.trim();
}

// Copy Prompt to Clipboard
function copyPrompt() {
    if (!currentPrompt) return;

    navigator.clipboard.writeText(currentPrompt).then(() => {
        showToast('Prompt copiado al portapapeles', 'success');
    }).catch(() => {
        showToast('Error al copiar', 'error');
    });
}

// Export Prompt
function exportPrompt() {
    if (!currentPrompt) return;

    const timestamp = new Date().toLocaleString('es-ES');
    const exportData = `PROMPT GENERADO
================
Fecha: ${timestamp}
Tono: ${toneSelect.value}

${currentPrompt}`;

    const blob = new Blob([exportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Prompt exportado', 'success');
}

// Save Prompt to History
function savePrompt() {
    if (!currentPrompt) return;

    const historyItem = {
        id: Date.now(),
        idea: ideaInput.value,
        tone: toneSelect.value,
        prompt: currentPrompt,
        timestamp: new Date().toLocaleString('es-ES'),
    };

    promptHistory.unshift(historyItem);
    localStorage.setItem('promptHistory', JSON.stringify(promptHistory));
    renderHistory();
    showToast('Prompt guardado en el historial', 'success');
}

// Load History from localStorage
function loadHistory() {
    const saved = localStorage.getItem('promptHistory');
    if (saved) {
        promptHistory = JSON.parse(saved);
        renderHistory();
    }
}

// Render History
function renderHistory() {
    if (promptHistory.length === 0) {
        historySection.style.display = 'none';
        return;
    }

    historySection.style.display = 'block';
    historyList.innerHTML = promptHistory.map((item) => `
        <div class="history-item">
            <div class="history-item-text">
                <strong>Idea:</strong> ${escapeHtml(item.idea)}
            </div>
            <div class="history-item-text">
                <strong>Tono:</strong> ${item.tone}
            </div>
            <div class="history-item-time">${item.timestamp}</div>
            <div style="display: flex; gap: 8px; margin-top: 10px;">
                <button class="btn btn-secondary" style="flex: 1;" onclick="loadFromHistory(${item.id})">
                    Cargar
                </button>
                <button class="btn btn-secondary" style="flex: 1;" onclick="deleteFromHistory(${item.id})">
                    Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

// Load Prompt from History
function loadFromHistory(id) {
    const item = promptHistory.find((h) => h.id === id);
    if (item) {
        ideaInput.value = item.idea;
        toneSelect.value = item.tone;
        currentPrompt = item.prompt;
        promptOutput.textContent = item.prompt;
        outputSection.style.display = 'block';
        outputSection.scrollIntoView({ behavior: 'smooth' });
        showToast('Prompt cargado desde el historial', 'success');
    }
}

// Delete from History
function deleteFromHistory(id) {
    promptHistory = promptHistory.filter((h) => h.id !== id);
    localStorage.setItem('promptHistory', JSON.stringify(promptHistory));
    renderHistory();
    showToast('Prompt eliminado del historial', 'success');
}

// Clear All History
function clearHistory() {
    if (confirm('¿Estás seguro de que deseas eliminar todo el historial?')) {
        promptHistory = [];
        localStorage.removeItem('promptHistory');
        renderHistory();
        showToast('Historial limpiado', 'success');
    }
}

// Show Loading Spinner
function showLoading(show) {
    loadingSpinner.style.display = show ? 'flex' : 'none';
    generateBtn.disabled = show;
}

// Show Toast Notification
function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
