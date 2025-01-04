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
    if (!player) return;

    document.addEventListener('keydown', function(event) {
        // Solo procesar si el player existe y no estamos en un input
        if (!player || event.target.tagName.toLowerCase() === 'input') return;

        if (event.key == 'ArrowLeft' || event.key == 'j') {
            event.preventDefault();
            skip(-1);
        }

        if (event.key == 'ArrowRight' || event.key == 'l') {
            event.preventDefault();
            skip(1);
        }

        if (event.key == ' ' || event.key == 'k') {
            event.preventDefault();
            togglePlay();
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

    // Referencias a los botones
    const backButton = document.querySelector('button[onclick="skip(-1)"]');
    const forwardButton = document.querySelector('button[onclick="skip(1)"]');

    if (direction == 1) {
        // Añadir foco y efecto visual al botón de avanzar
        forwardButton.focus();
        addButtonPressEffect(forwardButton);
    } else {
        // Añadir foco y efecto visual al botón de retroceder
        backButton.focus();
        addButtonPressEffect(backButton);
    }


    const currentTime = player.getCurrentTime();
    const newTime = currentTime + (direction * skipSeconds);
    player.seekTo(newTime, true);
}

function togglePlay() {
    if (!player) return;

    const togglePlayButton = document.querySelector('button[onclick="togglePlay()"]');

    const playerState = player.getPlayerState();
    if (playerState === YT.PlayerState.PLAYING) {
        player.pauseVideo();
        togglePlayButton.textContent = '▶';
    } else {
        player.playVideo();
        togglePlayButton.textContent = '⏸';
    }
    togglePlayButton.focus();
    addButtonPressEffect(togglePlayButton);
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
        `<li><a href="#" onclick="loadVideoByUrl('${url}'); return false;">${url}</a></li>`
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