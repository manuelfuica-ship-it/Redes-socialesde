// DOM Elements
const apiKeyInput = document.getElementById('apiKey');
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadApiKey();
    loadHistory();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    generateBtn.addEventListener('click', generatePrompt);
    copyBtn.addEventListener('click', copyPrompt);
    exportBtn.addEventListener('click', exportPrompt);
    saveBtn.addEventListener('click', savePrompt);
    clearHistoryBtn.addEventListener('click', clearHistory);

    apiKeyInput.addEventListener('change', saveApiKey);
}

// Save API Key to localStorage
function saveApiKey() {
    localStorage.setItem('groqApiKey', apiKeyInput.value);
    showToast('API Key guardada', 'success');
}

// Load API Key from localStorage
function loadApiKey() {
    const savedKey = localStorage.getItem('groqApiKey');
    if (savedKey) {
        apiKeyInput.value = savedKey;
    }
}

// Generate Prompt
async function generatePrompt() {
    const idea = ideaInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    const tone = toneSelect.value;

    if (!idea) {
        showToast('Por favor ingresa una idea', 'error');
        return;
    }

    if (!apiKey) {
        showToast('Por favor configura tu API Key de Groq', 'error');
        apiKeyInput.focus();
        return;
    }

    showLoading(true);

    try {
        const prompt = await callGroqAPI(idea, tone, apiKey);
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

// Call Google Generative AI API
async function callGroqAPI(idea, tone, apiKey) {
    const systemPrompt = `Eres un experto en la creación de prompts profesionales. Tu tarea es transformar ideas breves en prompts detallados, claros y efectivos.

El tono del prompt debe ser: ${tone}

Genera un prompt profesional que:
1. Sea claro y específico
2. Incluya contexto necesario
3. Defina el resultado esperado
4. Sea conciso pero completo
5. Esté optimizado para obtener respuestas de alta calidad

Responde SOLO con el prompt generado, sin explicaciones adicionales.`;

    const fullPrompt = `${systemPrompt}\n\nIdea: ${idea}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            text: fullPrompt,
                        },
                    ],
                },
            ],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
            },
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Error en la API de Google Gemini');
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Respuesta inesperada de la API');
    }

    return data.candidates[0].content.parts[0].text;
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
