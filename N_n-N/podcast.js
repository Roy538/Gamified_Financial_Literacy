// Podcast episodes data
const podcastEpisodes = [
    {
        id: 1,
        title: "Understanding Personal Finance Basics",
        description: "Learn the fundamental concepts of personal finance and money management.",
        duration: "25:30",
        category: "basics",
        image: "https://picsum.photos/300/200?random=1",
        audioUrl: "https://open.spotify.com/embed/episode/2xYVHGVYxNV5PZF1VhRSUd?utm_source=generator",
        xpPoints: 100,
        quiz: [
            {
                question: "What is the first step in creating a budget?",
                options: [
                    "Track your spending",
                    "Set financial goals",
                    "Calculate your income",
                    "Make investments"
                ],
                correctAnswer: 2
            }
        ]
    },
    {
        id: 2,
        title: "Investment Strategies for Beginners",
        description: "Learn the basics of investment and how to start your investment journey.",
        duration: "20:15",
        category: "investing",
        image: "https://picsum.photos/300/200?random=2",
        audioUrl: "https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav",
        xpPoints: 150,
        quiz: [
            {
                question: "What is diversification in investment?",
                options: [
                    "Putting all money in one stock",
                    "Spreading investments across different assets",
                    "Only investing in bonds",
                    "Keeping all money in savings"
                ],
                correctAnswer: 1
            }
        ]
    }
];

// Achievements data
const achievements = [
    {
        id: 1,
        title: "First Steps",
        description: "Complete your first episode",
        icon: "fa-shoe-prints",
        xpRequired: 0,
        earned: false
    },
    {
        id: 2,
        title: "Knowledge Seeker",
        description: "Complete 5 episodes",
        icon: "fa-book-reader",
        xpRequired: 500,
        earned: false
    },
    {
        id: 3,
        title: "Finance Master",
        description: "Earn 1000 XP",
        icon: "fa-crown",
        xpRequired: 1000,
        earned: false
    }
];

// User state
let userState = {
    xp: 0,
    level: 1,
    completedEpisodes: [],
    currentEpisode: null,
    playbackSpeed: 1
};

// DOM Elements
const podcastList = document.querySelector('.podcast-list');
const audioPlayer = new Audio();
const playPauseBtn = document.getElementById('play-pause');
const prevBtn = document.getElementById('prev-15');
const nextBtn = document.getElementById('next-15');
const volumeControl = document.getElementById('volume');
const speedBtn = document.getElementById('playback-speed');
const progressBar = document.querySelector('.timeline .progress-bar');
const currentTimeSpan = document.getElementById('current-time');
const durationSpan = document.getElementById('duration');
const filterBtns = document.querySelectorAll('.filter-btn');

// Initialize the page
function init() {
    loadUserState();
    renderPodcastEpisodes();
    renderAchievements();
    setupEventListeners();
    updateXPBar();
}

// Load user state from localStorage
function loadUserState() {
    const savedState = localStorage.getItem('podcastUserState');
    if (savedState) {
        userState = JSON.parse(savedState);
    }
}

// Save user state to localStorage
function saveUserState() {
    localStorage.setItem('podcastUserState', JSON.stringify(userState));
}

// Render podcast episodes
function renderPodcastEpisodes(category = 'all') {
    podcastList.innerHTML = '';
    const filteredEpisodes = category === 'all' 
        ? podcastEpisodes 
        : podcastEpisodes.filter(episode => episode.category === category);

    filteredEpisodes.forEach(episode => {
        const episodeCard = createEpisodeCard(episode);
        podcastList.appendChild(episodeCard);
    });
}

// Create episode card
function createEpisodeCard(episode) {
    const card = document.createElement('div');
    card.className = 'podcast-episode';
    card.innerHTML = `
        <img src="${episode.image}" alt="${episode.title}">
        <div class="episode-details">
            <h3>${episode.title}</h3>
            <p>${episode.description}</p>
            <span class="duration">${episode.duration}</span>
            ${userState.completedEpisodes.includes(episode.id) 
                ? '<span class="completed"><i class="fas fa-check"></i> Completed</span>' 
                : ''}
        </div>
    `;
    card.addEventListener('click', () => loadEpisode(episode));
    return card;
}

// Load episode with enhanced error handling
function loadEpisode(episode) {
    userState.currentEpisode = episode;
    
    // Show loading state
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'loading-message';
    loadingMessage.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading audio...';
    document.querySelector('.player-container').appendChild(loadingMessage);
    
    // Reset player state
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    playPauseBtn.classList.remove('playing');
    progressBar.style.width = '0%';
    currentTimeSpan.textContent = '0:00';
    durationSpan.textContent = '0:00';
    
    // Update UI
    document.getElementById('episode-title').textContent = episode.title;
    document.getElementById('episode-description').textContent = episode.description;
    document.getElementById('episode-cover').src = episode.image;

    // Clean up existing audio
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.src = '';
        audioPlayer.load();
    }

    // Create new audio player if needed
    if (!audioPlayer) {
        audioPlayer = new Audio();
    }

    // Set up audio player with enhanced error handling
    try {
        audioPlayer.src = episode.audioUrl;
        audioPlayer.preload = 'auto';

        // Remove old event listeners
        audioPlayer.removeEventListener('canplaythrough', onCanPlayThrough);
        audioPlayer.removeEventListener('error', onError);

        // Add new event listeners
        const onCanPlayThrough = () => {
            loadingMessage.remove();
            playPauseBtn.classList.remove('loading');
            durationSpan.textContent = formatTime(audioPlayer.duration);
            updateProgress();
            // Auto-play when ready
            togglePlayPause();
        };

        const onError = (e) => {
            console.error('Audio Error:', e);
            loadingMessage.remove();
            let errorMessage = 'Failed to load audio. ';
            
            if (audioPlayer.error) {
                switch (audioPlayer.error.code) {
                    case 1:
                        errorMessage += 'The audio file could not be found.';
                        break;
                    case 2:
                        errorMessage += 'Network error occurred. Please check your internet connection.';
                        break;
                    case 3:
                        errorMessage += 'Audio decoding failed. The file might be corrupted.';
                        break;
                    case 4:
                        errorMessage += 'Audio format not supported by your browser.';
                        break;
                    default:
                        errorMessage += 'Please try again later.';
                }
            }
            
            showError(errorMessage);
            playPauseBtn.classList.remove('loading');
        };

        audioPlayer.addEventListener('canplaythrough', onCanPlayThrough);
        audioPlayer.addEventListener('error', onError);

        // Start loading the audio
        audioPlayer.load();
        
    } catch (error) {
        loadingMessage.remove();
        console.error('Error setting up audio:', error);
        showError('Failed to set up audio player. Please try again.');
        playPauseBtn.classList.remove('loading');
    }
}

// Enhanced toggle play/pause with better error handling
function togglePlayPause() {
    if (!userState.currentEpisode) {
        showError('Please select an episode first.');
        return;
    }

    if (audioPlayer.paused) {
        // Check if audio is actually loaded
        if (!audioPlayer.src) {
            showError('Audio source not loaded. Please wait or try reloading the episode.');
            return;
        }

        const playPromise = audioPlayer.play();
        
        if (playPromise !== undefined) {
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            playPauseBtn.classList.add('playing');
            // Add XP bonus for playing
            awardXP(5);
            console.log('Audio playing successfully');
        }
    } else {
        audioPlayer.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        playPauseBtn.classList.remove('playing');
    }
}

// Enhanced seek function with visual feedback
function seek(seconds) {
    if (!userState.currentEpisode) return;
    
    const newTime = Math.max(0, Math.min(audioPlayer.currentTime + seconds, audioPlayer.duration));
    audioPlayer.currentTime = newTime;
    
    // Add visual feedback
    const button = seconds > 0 ? nextBtn : prevBtn;
    button.classList.add('seeking');
    setTimeout(() => button.classList.remove('seeking'), 200);
}

// Enhanced volume control with visual feedback
function updateVolume() {
    const volume = volumeControl.value / 100;
    audioPlayer.volume = volume;
    
    // Update volume icon
    const volumeIcon = volumeControl.previousElementSibling;
    if (volume === 0) {
        volumeIcon.className = 'fas fa-volume-mute';
    } else if (volume < 0.5) {
        volumeIcon.className = 'fas fa-volume-down';
    } else {
        volumeIcon.className = 'fas fa-volume-up';
    }
}

// Toggle playback speed
function togglePlaybackSpeed() {
    const speeds = [1, 1.25, 1.5, 1.75, 2];
    const currentIndex = speeds.indexOf(userState.playbackSpeed);
    userState.playbackSpeed = speeds[(currentIndex + 1) % speeds.length];
    audioPlayer.playbackRate = userState.playbackSpeed;
    speedBtn.textContent = `${userState.playbackSpeed}x`;
}

// Add timeline click functionality
function setupTimelineClick() {
    const timeline = document.querySelector('.timeline');
    timeline.addEventListener('click', (e) => {
        if (!userState.currentEpisode) return;
        
        const rect = timeline.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        audioPlayer.currentTime = pos * audioPlayer.duration;
    });
}

// Enhanced progress update with smooth animation
function updateProgress() {
    if (!userState.currentEpisode) return;

    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.style.width = `${progress}%`;
    
    currentTimeSpan.textContent = formatTime(audioPlayer.currentTime);
    durationSpan.textContent = formatTime(audioPlayer.duration);
    
    // Award XP for listening (every 5 minutes)
    if (Math.floor(audioPlayer.currentTime) % 300 === 0) {
        awardXP(10);
    }
}

// Format time in MM:SS
function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Enhanced show error function with better visibility
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">✕</button>
    `;
    document.body.appendChild(errorDiv);
    
    // Add some interactivity
    errorDiv.addEventListener('click', () => {
        errorDiv.classList.add('fade-out');
        setTimeout(() => errorDiv.remove(), 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(errorDiv)) {
            errorDiv.classList.add('fade-out');
            setTimeout(() => errorDiv.remove(), 300);
        }
    }, 5000);
}

// Enhanced episode completion with rewards
function handleEpisodeComplete() {
    if (!userState.currentEpisode) return;

    if (!userState.completedEpisodes.includes(userState.currentEpisode.id)) {
        userState.completedEpisodes.push(userState.currentEpisode.id);
        
        // Award base XP
        awardXP(userState.currentEpisode.xpPoints);
        
        // Award bonus XP for listening to the entire episode
        awardXP(50);
        
        // Show completion animation
        showCompletionAnimation();
        
        // Show quiz after a short delay
        setTimeout(showQuiz, 1500);
    }
}

// Show completion animation
function showCompletionAnimation() {
    const completionDiv = document.createElement('div');
    completionDiv.className = 'completion-animation';
    completionDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <h3>Episode Complete!</h3>
        <p>+${userState.currentEpisode.xpPoints} XP</p>
    `;
    document.body.appendChild(completionDiv);
    
    setTimeout(() => {
        completionDiv.classList.add('fade-out');
        setTimeout(() => completionDiv.remove(), 500);
    }, 2000);
}

// Show quiz
function showQuiz() {
    const quizContainer = document.querySelector('.quiz-container');
    const quizContent = document.querySelector('.quiz-content');
    quizContent.innerHTML = '';

    userState.currentEpisode.quiz.forEach((question, index) => {
        const questionElement = createQuizQuestion(question, index);
        quizContent.appendChild(questionElement);
    });

    quizContainer.classList.remove('hidden');
}

// Create quiz question
function createQuizQuestion(question, index) {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'quiz-question';
    questionDiv.innerHTML = `
        <h3>Question ${index + 1}</h3>
        <p>${question.question}</p>
        <div class="quiz-options">
            ${question.options.map((option, i) => `
                <div class="quiz-option" data-index="${i}">
                    ${option}
                </div>
            `).join('')}
        </div>
    `;

    const options = questionDiv.querySelectorAll('.quiz-option');
    options.forEach(option => {
        option.addEventListener('click', () => {
            options.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
        });
    });

    return questionDiv;
}

// Check achievements
function checkAchievements() {
    achievements.forEach(achievement => {
        if (!achievement.earned && userState.xp >= achievement.xpRequired) {
            achievement.earned = true;
            showAchievementNotification(achievement);
        }
    });
}

// Show achievement notification
function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <i class="fas ${achievement.icon}"></i>
        <div class="achievement-details">
            <h3>${achievement.title}</h3>
            <p>${achievement.description}</p>
        </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Render achievements
function renderAchievements() {
    const achievementsGrid = document.querySelector('.achievements-grid');
    achievementsGrid.innerHTML = '';

    achievements.forEach(achievement => {
        const card = document.createElement('div');
        card.className = `achievement-card ${achievement.earned ? 'earned' : 'locked'}`;
        card.innerHTML = `
            <i class="fas ${achievement.icon}"></i>
            <h3>${achievement.title}</h3>
            <p>${achievement.description}</p>
            <div class="xp-required">Required XP: ${achievement.xpRequired}</div>
        `;
        achievementsGrid.appendChild(card);
    });
}

// Award XP points
function awardXP(points) {
    userState.xp += points;
    updateXPBar();
    checkAchievements();
    saveUserState();
}

// Update XP bar
function updateXPBar() {
    const xpForNextLevel = 1000;
    const progress = (userState.xp % xpForNextLevel) / xpForNextLevel * 100;
    const level = Math.floor(userState.xp / xpForNextLevel) + 1;
    
    document.querySelector('.xp-text').textContent = `Level ${level} - ${getLevelTitle(level)}`;
    document.querySelector('.progress-bar').style.width = `${progress}%`;
}

// Get level title
function getLevelTitle(level) {
    const titles = {
        1: "Financial Rookie",
        2: "Money Manager",
        3: "Investment Apprentice",
        4: "Finance Expert",
        5: "Wealth Master"
    };
    return titles[level] || "Finance Guru";
}

// Setup event listeners
function setupEventListeners() {
    // Player controls
    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', () => seek(-15));
    nextBtn.addEventListener('click', () => seek(15));
    volumeControl.addEventListener('input', updateVolume);
    speedBtn.addEventListener('click', togglePlaybackSpeed);

    // Audio player events
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', handleEpisodeComplete);

    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderPodcastEpisodes(btn.dataset.category);
        });
    });

    // Add timeline click handler
    setupTimelineClick();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (!userState.currentEpisode) return;
        
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                togglePlayPause();
                break;
            case 'ArrowLeft':
                seek(-15);
                break;
            case 'ArrowRight':
                seek(15);
                break;
            case 'ArrowUp':
                volumeControl.value = Math.min(100, parseInt(volumeControl.value) + 10);
                updateVolume();
                break;
            case 'ArrowDown':
                volumeControl.value = Math.max(0, parseInt(volumeControl.value) - 10);
                updateVolume();
                break;
        }
    });
}

// Initialize the page
init(); 


//Home Page Button Sound
function playClickSound() {
  const sound = document.getElementById("click-sound");
  if (sound) sound.play();
}
