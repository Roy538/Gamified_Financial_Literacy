// Game state
// let gameState = {
    // points: 0,
    // level: 1,
    // progress: 0,
    // completedEpisodes: new Set(),
    // achievements: new Set(),
    // currentSpeed: 1
// };

// Sample podcast episodes data
const episodes = [
    {
        id: 1,
        title: "Budgeting Basics for Students",
        description: "Learn the fundamentals of creating and maintaining a student budget",
        audio: "path_to_audio/budgeting_basics.mp3",
        image: "https://via.placeholder.com/300?text=Budgeting+Basics",
        duration: "15:00",
        quiz: [
            {
                question: "What is the 50/30/20 rule in budgeting?",
                options: [
                    "50% needs, 30% wants, 20% savings",
                    "50% savings, 30% needs, 20% wants",
                    "50% wants, 30% savings, 20% needs",
                    "50% needs, 30% savings, 20% wants"
                ],
                correct: 0
            }
        ]
    },
    {
        id: 2,
        title: "Student Loans Explained",
        description: "Understanding student loans and responsible borrowing",
        audio: "path_to_audio/student_loans.mp3",
        image: "https://via.placeholder.com/300?text=Student+Loans",
        duration: "20:00",
        quiz: [
            {
                question: "What is the difference between subsidized and unsubsidized loans?",
                options: [
                    "Interest payment timing",
                    "Loan amount",
                    "Repayment schedule",
                    "Credit score requirement"
                ],
                correct: 0
            }
        ]
    }
];

// Achievements data
const achievements = [
    {
        id: "first_episode",
        title: "First Steps",
        description: "Complete your first episode",
        icon: "fa-solid fa-play"
    },
    {
        id: "all_episodes",
        title: "Knowledge Seeker",
        description: "Complete all episodes",
        icon: "fa-solid fa-graduation-cap"
    },
    {
        id: "perfect_quiz",
        title: "Perfect Score",
        description: "Get 100% on a quiz",
        icon: "fa-solid fa-star"
    }
];

// DOM Elements
const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const speedBtn = document.getElementById('speedBtn');
const currentTimeSpan = document.getElementById('currentTime');
const durationSpan = document.getElementById('duration');
const audioProgress = document.getElementById('audioProgress');
const episodesList = document.getElementById('episodesList');
const quizSection = document.getElementById('quizSection');
const achievementsGrid = document.getElementById('achievementsGrid');

// Initialize the page
function init() {
    updateGameStats();
    populateEpisodes();
    populateAchievements();
    setupEventListeners();
}

// Update game statistics display
function updateGameStats() {
    document.getElementById('pointsValue').textContent = gameState.points;
    document.getElementById('levelValue').textContent = gameState.level;
    document.getElementById('progressFill').style.width = `${gameState.progress}%`;
}

// Populate episodes list
function populateEpisodes() {
    episodesList.innerHTML = '';
    episodes.forEach(episode => {
        const episodeElement = document.createElement('div');
        episodeElement.className = 'episode-item';
        episodeElement.innerHTML = `
            <img src="${episode.image}" alt="${episode.title}">
            <div class="episode-info">
                <div class="episode-title">${episode.title}</div>
                <div class="episode-description">${episode.description}</div>
                <div class="episode-duration">${episode.duration}</div>
            </div>
            ${gameState.completedEpisodes.has(episode.id) ? '<i class="fas fa-check"></i>' : ''}
        `;
        episodeElement.addEventListener('click', () => loadEpisode(episode));
        episodesList.appendChild(episodeElement);
    });
}

// Populate achievements grid
function populateAchievements() {
    achievementsGrid.innerHTML = '';
    achievements.forEach(achievement => {
        const achievementElement = document.createElement('div');
        achievementElement.className = `achievement ${gameState.achievements.has(achievement.id) ? '' : 'locked'}`;
        achievementElement.innerHTML = `
            <i class="${achievement.icon}"></i>
            <h3>${achievement.title}</h3>
            <p>${achievement.description}</p>
        `;
        achievementsGrid.appendChild(achievementElement);
    });
}

// Load episode
function loadEpisode(episode) {
    document.getElementById('episodeImage').src = episode.image;
    document.getElementById('episodeTitle').textContent = episode.title;
    document.getElementById('episodeDescription').textContent = episode.description;
    
    // In a real implementation, you would load the actual audio file
    // For demo purposes, we're just updating the UI
    audioPlayer.src = episode.audio;
    updatePlayButton(false);
}

// Play/Pause toggle
function togglePlay() {
    if (audioPlayer.paused) {
        audioPlayer.play();
        updatePlayButton(true);
    } else {
        audioPlayer.pause();
        updatePlayButton(false);
    }
}

// Update play button icon
function updatePlayButton(isPlaying) {
    playBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
}

// Change playback speed
function changeSpeed() {
    const speeds = [1, 1.25, 1.5, 1.75, 2];
    const currentIndex = speeds.indexOf(gameState.currentSpeed);
    gameState.currentSpeed = speeds[(currentIndex + 1) % speeds.length];
    audioPlayer.playbackRate = gameState.currentSpeed;
    speedBtn.textContent = `${gameState.currentSpeed}x`;
}

// Show quiz for current episode
function showQuiz(episode) {
    const quiz = episode.quiz[0]; // For demo, we're using the first quiz question
    quizSection.classList.remove('hidden');
    document.getElementById('quizQuestion').textContent = quiz.question;
    
    const optionsContainer = document.getElementById('quizOptions');
    optionsContainer.innerHTML = '';
    
    quiz.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'quiz-option';
        optionElement.textContent = option;
        optionElement.addEventListener('click', () => selectQuizOption(index));
        optionsContainer.appendChild(optionElement);
    });
}

// Select quiz option
function selectQuizOption(index) {
    const options = document.querySelectorAll('.quiz-option');
    options.forEach(option => option.classList.remove('selected'));
    options[index].classList.add('selected');
}

// Submit quiz answer
function submitQuiz(episode) {
    const selectedOption = document.querySelector('.quiz-option.selected');
    if (!selectedOption) return;
    
    const selectedIndex = Array.from(document.querySelectorAll('.quiz-option')).indexOf(selectedOption);
    const isCorrect = selectedIndex === episode.quiz[0].correct;
    
    if (isCorrect) {
        awardPoints(100);
        if (!gameState.completedEpisodes.has(episode.id)) {
            gameState.completedEpisodes.add(episode.id);
            checkAchievements();
        }
    }
    
    quizSection.classList.add('hidden');
    updateGameStats();
    populateEpisodes();
}

// Award points and update level
function awardPoints(points) {
    gameState.points += points;
    gameState.progress += 10;
    
    if (gameState.progress >= 100) {
        gameState.level++;
        gameState.progress = 0;
    }
    
    updateGameStats();
}

// Check and award achievements
function checkAchievements() {
    if (gameState.completedEpisodes.size === 1) {
        gameState.achievements.add('first_episode');
    }
    
    if (gameState.completedEpisodes.size === episodes.length) {
        gameState.achievements.add('all_episodes');
    }
    
    populateAchievements();
}

// Setup event listeners
function setupEventListeners() {
    playBtn.addEventListener('click', togglePlay);
    speedBtn.addEventListener('click', changeSpeed);
    document.getElementById('submitQuiz').addEventListener('click', () => {
        const currentEpisodeTitle = document.getElementById('episodeTitle').textContent;
        const currentEpisode = episodes.find(ep => ep.title === currentEpisodeTitle);
        if (currentEpisode) {
            submitQuiz(currentEpisode);
        }
    });
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
