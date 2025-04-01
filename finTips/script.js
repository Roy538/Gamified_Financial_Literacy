// Financial tips database
const financialTips = [
    {
        tip: "Create a monthly budget and stick to it. Use the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings.",
        category: "Budgeting",
        points: 10
    },
    {
        tip: "Start an emergency fund with at least 3-6 months of living expenses.",
        category: "Savings",
        points: 15
    },
    {
        tip: "Use student discounts whenever possible - many stores and services offer special rates for students.",
        category: "Smart Spending",
        points: 5
    },
    {
        tip: "Avoid impulse buying by waiting 24 hours before making non-essential purchases.",
        category: "Smart Spending",
        points: 10
    },
    {
        tip: "Track your expenses using a budgeting app or spreadsheet to identify spending patterns.",
        category: "Budgeting",
        points: 8
    },
    {
        tip: "Consider opening a high-yield savings account for better interest rates on your savings.",
        category: "Savings",
        points: 12
    },
    {
        tip: "Learn to cook basic meals instead of eating out frequently to save money.",
        category: "Smart Spending",
        points: 15
    },
    {
        tip: "Use cashback and rewards credit cards responsibly to earn benefits on your spending.",
        category: "Smart Spending",
        points: 10
    },
    {
        tip: "Start investing early, even with small amounts, to take advantage of compound interest.",
        category: "Investing",
        points: 20
    },
    {
        tip: "Avoid student loan debt by applying for scholarships and grants.",
        category: "Debt Management",
        points: 15
    }
];

// Gamification elements
const achievements = [
    {
        id: "first_tip",
        title: "First Step",
        description: "Get your first financial tip",
        icon: "fa-star",
        points: 50
    },
    {
        id: "saver",
        title: "Super Saver",
        description: "Save 5 tips",
        icon: "fa-piggy-bank",
        points: 100
    },
    {
        id: "learner",
        title: "Quick Learner",
        description: "Get tips from 3 different categories",
        icon: "fa-graduation-cap",
        points: 150
    },
    {
        id: "master",
        title: "Finance Master",
        description: "Get tips from all categories",
        icon: "fa-crown",
        points: 200
    }
];

// User state
let userState = {
    level: 1,
    points: 0,
    savedTips: [],
    unlockedAchievements: new Set(),
    categoriesSeen: new Set()
};

// DOM Elements
const tipCard = document.getElementById('tipCard');
const tipText = document.getElementById('tipText');
const generateTipBtn = document.getElementById('generateTip');
const saveTipBtn = document.getElementById('saveTip');
const userLevelElement = document.getElementById('userLevel');
const userPointsElement = document.getElementById('userPoints');
const achievementGrid = document.getElementById('achievementGrid');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const savedTipsGrid = document.getElementById('savedTipsGrid');

// Sound effects
const sounds = {
    click: new Audio('sounds/click.mp3'),
    levelUp: new Audio('sounds/level-up.mp3'),
    achievement: new Audio('sounds/achievement.mp3'),
    save: new Audio('sounds/save.mp3'),
    delete: new Audio('sounds/delete.mp3'),
    hover: new Audio('sounds/hover.mp3')
};

// Sound settings
let soundEnabled = true;

// Function to play sound with error handling
function playSound(soundName) {
    if (!soundEnabled) return;
    const sound = sounds[soundName];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(error => console.log('Sound play failed:', error));
    }
}

// Navigation Toggle
navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
    }
});

// Section Navigation
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1) + '-section';
        
        // Update active section
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(targetId).classList.add('active');
        
        // Update active nav link
        document.querySelectorAll('.nav-links a').forEach(a => {
            a.classList.remove('active');
        });
        link.classList.add('active');
        
        // Close mobile menu
        navLinks.classList.remove('active');
        
        // Render saved tips if on saved tips section
        if (targetId === 'saved-tips-section') {
            renderSavedTips();
        }
    });
});

// Initialize the application
function init() {
    loadUserState();
    updateUI();
    setupEventListeners();
    renderAchievements();
}

// Load user state from localStorage
function loadUserState() {
    const savedState = localStorage.getItem('finTipsUserState');
    if (savedState) {
        userState = JSON.parse(savedState);
        userState.unlockedAchievements = new Set(userState.unlockedAchievements);
        userState.categoriesSeen = new Set(userState.categoriesSeen);
    }
}

// Save user state to localStorage
function saveUserState() {
    const stateToSave = {
        ...userState,
        unlockedAchievements: Array.from(userState.unlockedAchievements),
        categoriesSeen: Array.from(userState.categoriesSeen)
    };
    localStorage.setItem('finTipsUserState', JSON.stringify(stateToSave));
}

// Setup event listeners
function setupEventListeners() {
    generateTipBtn.addEventListener('click', () => {
        playSound('click');
        generateNewTip();
    });
    
    saveTipBtn.addEventListener('click', () => {
        playSound('click');
        saveCurrentTip();
    });

    // Add hover sound to buttons
    [generateTipBtn, saveTipBtn].forEach(btn => {
        btn.addEventListener('mouseenter', () => playSound('hover'));
    });

    // Add hover sound to navigation links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('mouseenter', () => playSound('hover'));
    });
}

// Generate a new financial tip
function generateNewTip() {
    const randomTip = financialTips[Math.floor(Math.random() * financialTips.length)];
    
    // Enhanced card animation
    tipCard.style.animation = 'none';
    tipCard.offsetHeight; // Trigger reflow
    tipCard.style.animation = 'cardAppear 0.5s ease, cardGlow 1s ease';
    
    // Update tip content with typing animation
    const tipElement = tipText;
    tipElement.textContent = '';
    let i = 0;
    const typingSpeed = 30; // milliseconds per character
    
    function typeWriter() {
        if (i < randomTip.tip.length) {
            tipElement.textContent += randomTip.tip.charAt(i);
            i++;
            setTimeout(typeWriter, typingSpeed);
        } else {
            // Enable save button with animation
            saveTipBtn.disabled = false;
            saveTipBtn.style.animation = 'buttonPulse 1s ease';
        }
    }
    
    typeWriter();
    
    // Update categories seen
    userState.categoriesSeen.add(randomTip.category);
    
    // Add points with animation
    const currentPoints = userState.points;
    userState.points += randomTip.points;
    animatePoints(currentPoints, userState.points);
    
    // Check for level up
    checkLevelUp();
    
    // Check for achievements
    checkAchievements();
    
    // Update UI
    updateUI();
}

// Add points animation
function animatePoints(start, end) {
    const duration = 1000; // 1 second
    const steps = 20;
    const increment = (end - start) / steps;
    let current = start;
    
    const interval = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(interval);
        }
        userPointsElement.textContent = Math.round(current);
    }, duration / steps);
}

// Save the current tip
function saveCurrentTip() {
    const currentTip = financialTips.find(tip => tip.tip === tipText.textContent);
    if (currentTip && !userState.savedTips.includes(currentTip.tip)) {
        playSound('save');
        userState.savedTips.push(currentTip.tip);
        saveUserState();
        saveTipBtn.disabled = true;
        
        // Enhanced save animation
        saveTipBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
        saveTipBtn.style.animation = 'saveSuccess 0.5s ease';
        
        // Add success particle effect
        createSuccessParticles(saveTipBtn);
        
        setTimeout(() => {
            saveTipBtn.innerHTML = '<i class="fas fa-bookmark"></i> Save Tip';
            saveTipBtn.style.animation = '';
        }, 2000);
        
        // Update saved tips view if on saved tips section
        if (document.getElementById('saved-tips-section').classList.contains('active')) {
            renderSavedTips();
        }
    }
}

// Check for level up
function checkLevelUp() {
    const newLevel = Math.floor(userState.points / 100) + 1;
    if (newLevel > userState.level) {
        userState.level = newLevel;
        showLevelUpAnimation();
    }
}

// Show level up animation
function showLevelUpAnimation() {
    playSound('levelUp');
    const levelUpMessage = document.createElement('div');
    levelUpMessage.className = 'level-up-message';
    levelUpMessage.innerHTML = `
        <i class="fas fa-star"></i>
        <span>Level Up!</span>
        <span>You're now level ${userState.level}</span>
    `;
    document.body.appendChild(levelUpMessage);
    
    // Add confetti effect
    createConfetti();
    
    setTimeout(() => {
        levelUpMessage.remove();
    }, 3000);
}

// Check for achievements
function checkAchievements() {
    achievements.forEach(achievement => {
        if (!userState.unlockedAchievements.has(achievement.id)) {
            let unlocked = false;
            
            switch (achievement.id) {
                case 'first_tip':
                    unlocked = userState.savedTips.length >= 1;
                    break;
                case 'saver':
                    unlocked = userState.savedTips.length >= 5;
                    break;
                case 'learner':
                    unlocked = userState.categoriesSeen.size >= 3;
                    break;
                case 'master':
                    unlocked = userState.categoriesSeen.size >= 5;
                    break;
            }
            
            if (unlocked) {
                userState.unlockedAchievements.add(achievement.id);
                userState.points += achievement.points;
                showAchievementUnlock(achievement);
            }
        }
    });
}

// Show achievement unlock animation
function showAchievementUnlock(achievement) {
    playSound('achievement');
    const achievementMessage = document.createElement('div');
    achievementMessage.className = 'achievement-unlock';
    achievementMessage.innerHTML = `
        <i class="fas ${achievement.icon}"></i>
        <div>
            <h4>Achievement Unlocked!</h4>
            <p>${achievement.title}</p>
            <small>+${achievement.points} points</small>
        </div>
    `;
    document.body.appendChild(achievementMessage);
    
    // Add achievement sparkle effect
    createSparkles(achievementMessage);
    
    setTimeout(() => {
        achievementMessage.remove();
    }, 3000);
}

// Update UI elements
function updateUI() {
    userLevelElement.textContent = `Level ${userState.level}`;
    userPointsElement.textContent = userState.points;
    saveUserState();
}

// Render achievements grid
function renderAchievements() {
    achievementGrid.innerHTML = achievements.map(achievement => `
        <div class="achievement-item ${userState.unlockedAchievements.has(achievement.id) ? 'unlocked' : 'locked'}">
            <i class="fas ${achievement.icon}"></i>
            <h4>${achievement.title}</h4>
            <p>${achievement.description}</p>
            <small>${achievement.points} points</small>
        </div>
    `).join('');
}

// Render saved tips
function renderSavedTips() {
    if (userState.savedTips.length === 0) {
        savedTipsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bookmark"></i>
                <p>No saved tips yet. Start saving tips to see them here!</p>
            </div>
        `;
        return;
    }

    savedTipsGrid.innerHTML = userState.savedTips.map(tipText => {
        const tip = financialTips.find(t => t.tip === tipText);
        return `
            <div class="saved-tip-card">
                <div class="tip-icon">
                    <i class="fas fa-lightbulb"></i>
                </div>
                <div class="tip-category">${tip.category}</div>
                <div class="tip-content">${tip.tip}</div>
                <div class="tip-points">
                    <i class="fas fa-coins"></i>
                    ${tip.points} points
                </div>
                <div class="delete-tip" onclick="deleteTip('${tip.tip}')">
                    <i class="fas fa-trash"></i>
                </div>
            </div>
        `;
    }).join('');
}

// Delete saved tip
function deleteTip(tipText) {
    playSound('delete');
    const tipCard = event.target.closest('.saved-tip-card');
    tipCard.style.animation = 'deleteTip 0.5s ease forwards';
    
    setTimeout(() => {
        userState.savedTips = userState.savedTips.filter(tip => tip !== tipText);
        saveUserState();
        renderSavedTips();
    }, 500);
}

// Particle effects
function createSuccessParticles(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.className = 'success-particle';
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        document.body.appendChild(particle);
        
        setTimeout(() => particle.remove(), 1000);
    }
}

function createConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 5000);
    }
}

function createSparkles(element) {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < 8; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = (rect.left + Math.random() * rect.width) + 'px';
        sparkle.style.top = (rect.top + Math.random() * rect.height) + 'px';
        document.body.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 1000);
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', init); 