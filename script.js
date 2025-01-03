let iframe;
let currentTime = 0;
let history = loadHistory();  // Cargar el historial desde localStorage

// Cargar el video en el iframe
function loadVideo() {
    const url = document.getElementById('youtube-url').value;
    const videoId = extractVideoID(url);
    
    if (videoId) {
        const container = document.getElementById('video-container');
        const iframeHTML = `<iframe id="youtube-iframe" width="640" height="390" 
            src="https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1" 
            frameborder="0" allowfullscreen title="Video de YouTube"></iframe>`;
        
        container.innerHTML = iframeHTML;
        iframe = document.getElementById('youtube-iframe');
        
        // Obtener el título del video usando el título del iframe
        const title = iframe.getAttribute('title');
        
        // Añadir el video al historial con el título
        addToHistory(url, title);
    } else {
        alert('URL de YouTube no válida.');
    }
}

// Extraer el ID del video de la URL
function extractVideoID(url) {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop();
}

// Avanzar o retroceder el video
function skip(direction) {
    const skipSeconds = parseInt(document.getElementById('skip-time').value, 10);  // Solo enteros
    if (iframe) {
        iframe.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: 'seekTo',
            args: [currentTime + direction * skipSeconds, true]
        }), '*');

        currentTime += direction * skipSeconds;
    }
}

// Detectar las teclas de flecha y avanzar o retroceder
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
        skip(1);  // Avanzar
    } else if (event.key === 'ArrowLeft') {
        skip(-1);  // Retroceder
    }
});

// Función para agregar un video al historial
function addToHistory(url, title) {
    // Evitar duplicados en el historial
    if (!history.some(item => item.url === url)) {
        history.push({ url, title });
        saveHistory();  // Guardar en localStorage
        updateHistoryDisplay();
    }
}

// Función para actualizar la visualización del historial
function updateHistoryDisplay() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';  // Limpiar historial actual

    // Mostrar los videos en el historial
    history.forEach((video) => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = "#";
        link.textContent = `Ver video: ${video.title}`;
        link.onclick = function () {
            loadVideoByUrl(video.url);
        };
        listItem.appendChild(link);
        historyList.appendChild(listItem);
    });
}

// Cargar un video del historial al hacer clic
function loadVideoByUrl(url) {
    document.getElementById('youtube-url').value = url;
    loadVideo();
}

// Guardar el historial en localStorage
function saveHistory() {
    localStorage.setItem('youtube-history', JSON.stringify(history));
}

// Cargar el historial desde localStorage
function loadHistory() {
    const savedHistory = localStorage.getItem('youtube-history');
    return savedHistory ? JSON.parse(savedHistory) : [];
}

// Función para borrar el historial
function clearHistory() {
    history = [];  // Vaciar el arreglo de historial
    saveHistory();  // Guardar el historial vacío en localStorage
    updateHistoryDisplay();  // Actualizar la visualización del historial
}

// Actualizar el historial al cargar la página
updateHistoryDisplay();
