let player;
let history = JSON.parse(localStorage.getItem('history')) || [];

// Cargar la API de YouTube
function loadYouTubeAPI() {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// Función que se llama cuando la API está lista
function onYouTubeIframeAPIReady() {
    // No crear el player aquí, solo cuando loadVideo sea llamado
}

// Cargar el video
function loadVideo() {
    const url = document.getElementById('youtube-url').value;
    const videoId = new URL(url).searchParams.get('v') || url.split('/').pop();
    
    if (!videoId) return alert('URL de YouTube no válida.');

    if (player) {
        // Si ya existe un player, cargar nuevo video
        player.loadVideoById(videoId);
    } else {
        // Crear nuevo player
        player = new YT.Player('video-container', {
            height: '390',
            width: '640',
            videoId: videoId,
            playerVars: {
                'playsinline': 1,
                'autoplay': 1
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
        
        // Agregar el event listener para las teclas solo una vez
        if (!window.keyboardControlsInitialized) {
            initializeKeyboardControls();
            window.keyboardControlsInitialized = true;
        }
    }

    addToHistory(url);
}

function onPlayerReady(event) {
    // El player está listo
    event.target.playVideo();
}

function onPlayerStateChange(event) {
    // Puedes manejar cambios de estado aquí si lo necesitas
}

// Inicializar controles de teclado
function initializeKeyboardControls() {
    // Referencias a los botones
    const backButton = document.querySelector('button[onclick="skip(-1)"]');
    const forwardButton = document.querySelector('button[onclick="skip(1)"]');

    document.addEventListener('keydown', function(event) {
        // Solo procesar si el player existe y no estamos en un input
        if (!player || event.target.tagName.toLowerCase() === 'input') return;

        switch(event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                skip(-1);
                // Añadir foco y efecto visual al botón de retroceder
                backButton.focus();
                addButtonPressEffect(backButton);
                break;
            case 'ArrowRight':
                event.preventDefault();
                skip(1);
                // Añadir foco y efecto visual al botón de avanzar
                forwardButton.focus();
                addButtonPressEffect(forwardButton);
                break;
        }
    });
}

// Función para añadir efecto visual al botón
function addButtonPressEffect(button) {
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 100);
}

// Función para saltar adelante o atrás
function skip(direction) {
    if (!player) return;

    const skipSeconds = parseInt(document.getElementById('skip-time').value, 10) || 5;
    if (isNaN(skipSeconds) || skipSeconds <= 0) return;

    const currentTime = player.getCurrentTime();
    const newTime = currentTime + (direction * skipSeconds);
    player.seekTo(newTime, true);
}

// Añadir al historial
function addToHistory(url) {
    if (!history.includes(url)) {
        history.push(url);
        localStorage.setItem('history', JSON.stringify(history));
        updateHistoryDisplay();
    }
}

// Mostrar historial
function updateHistoryDisplay() {
    const list = document.getElementById('history-list');
    list.innerHTML = history.map(url => 
        `<li><a href="#" onclick="loadVideoByUrl('${url}'); return false;">Ver video</a></li>`
    ).join('');
}

// Cargar video desde historial
function loadVideoByUrl(url) {
    document.getElementById('youtube-url').value = url;
    loadVideo();
}

// Borrar historial
function clearHistory() {
    history = [];
    localStorage.setItem('history', JSON.stringify(history));
    updateHistoryDisplay();
}

// Inicializar
loadYouTubeAPI();
updateHistoryDisplay();