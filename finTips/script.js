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
    generateTipBtn.addEventListener('click', generateNewTip);
    saveTipBtn.addEventListener('click', saveCurrentTip);
}

// Generate a new financial tip
function generateNewTip() {
    const randomTip = financialTips[Math.floor(Math.random() * financialTips.length)];
    
    // Animate the card
    tipCard.style.animation = 'none';
    tipCard.offsetHeight; // Trigger reflow
    tipCard.style.animation = 'cardAppear 0.5s ease';
    
    // Update tip content
    tipText.textContent = randomTip.tip;
    
    // Update categories seen
    userState.categoriesSeen.add(randomTip.category);
    
    // Add points
    userState.points += randomTip.points;
    
    // Enable save button
    saveTipBtn.disabled = false;
    
    // Check for level up
    checkLevelUp();
    
    // Check for achievements
    checkAchievements();
    
    // Update UI
    updateUI();
}

// Save the current tip
function saveCurrentTip() {
    const currentTip = financialTips.find(tip => tip.tip === tipText.textContent);
    if (currentTip && !userState.savedTips.includes(currentTip.tip)) {
        userState.savedTips.push(currentTip.tip);
        saveUserState();
        saveTipBtn.disabled = true;
        
        // Show success animation
        saveTipBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
        setTimeout(() => {
            saveTipBtn.innerHTML = '<i class="fas fa-bookmark"></i> Save Tip';
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
    const levelUpMessage = document.createElement('div');
    levelUpMessage.className = 'level-up-message';
    levelUpMessage.innerHTML = `
        <i class="fas fa-star"></i>
        <span>Level Up!</span>
        <span>You're now level ${userState.level}</span>
    `;
    document.body.appendChild(levelUpMessage);
    
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
    userState.savedTips = userState.savedTips.filter(tip => tip !== tipText);
    saveUserState();
    renderSavedTips();
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', init); 