// Game state
let gameState = {
    balance: 0,
    score: 0,
    level: 1,
    streak: 0,
    transactions: [],
    achievements: [],
    weeklySavings: [],
    lastSavingsDate: null,
    weeklyGoal: 140, // 20 KSH * 7 days
    dailyTarget: 20
};

// Sound effects
const coinSound = document.getElementById('coinSound');
const achievementSound = document.getElementById('achievementSound');
const savingsSound = document.getElementById('savingsSound');

// Achievement definitions
const achievements = [
    {
        id: 'first_savings',
        title: 'First Save',
        description: 'Make your first savings',
        icon: '💰',
        condition: (state) => state.weeklySavings.length > 0,
        points: 50
    },
    // {
    //     id: 'weekly_goal',
    //     title: 'Weekly Master',
    //     description: 'Complete a weekly savings goal',
    //     icon: '🎯',
    //     condition: (state) => state.weeklySavings.reduce((sum, s) => sum + s.amount, 0) >= state.weeklyGoal,
    //     points: 100
    // },
    {
        id: 'streak_3',
        title: 'Consistent Saver',
        description: 'Maintain a 3-day savings streak',
        icon: '🔥',
        condition: (state) => state.streak >= 3,
        points: 75
    },
    {
        id: 'high_balance',
        title: 'Money Maker',
        description: 'Reach a balance of 1000 KSH',
        icon: '💎',
        condition: (state) => state.balance >= 1000,
        points: 150
    }
];

// Initialize game
function initializeGame() {
    const savedState = localStorage.getItem('budgetHeroState');
    if (savedState) {
        gameState = JSON.parse(savedState);
        updateUI();
        checkDailySavings();
    }
    renderAchievements();
    updateWeeklyProgress();
}

// Save game state
function saveGameState() {
    localStorage.setItem('budgetHeroState', JSON.stringify(gameState));
}

// Update UI elements
function updateUI() {
    document.getElementById('currentBalance').textContent = gameState.balance;
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('streakCount').textContent = gameState.streak;
    document.getElementById('weeklySavingsTotal').textContent = 
        gameState.weeklySavings.reduce((sum, s) => sum + s.amount, 0);
    document.getElementById('savingsDaysCount').textContent = 
        `${gameState.weeklySavings.length}/7 days`;
    
    updateTransactionsList();
    updateWeeklyProgress();
    checkAchievements();
}

// Add income
function addIncome() {
    const amount = parseFloat(document.getElementById('incomeAmount').value);
    const source = document.getElementById('incomeSource').value;
    const expenseSound = document.getElementById('expenseSound');
    const coinSound = document.getElementById('coinSound');

    if (!amount || amount <= 0 || !source) {
        showNotification('Please enter valid amount and source', 'error');
        return;
    }

    gameState.balance += amount;
    gameState.transactions.unshift({
        type: 'income',
        amount: amount,
        description: source,
        date: new Date().toISOString()
    });

    coinSound.play();
    showNotification(`Added income: ${amount} KSH from ${source}`, 'success');
    
    document.getElementById('incomeAmount').value = '';
    document.getElementById('incomeSource').value = '';
    
    updateUI();
    saveGameState();
}

// Add expense
function addExpense() {
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const category = document.getElementById('expenseCategory').value;

    if (!amount || amount <= 0 || !category) {
        showNotification('Please enter valid amount and category', 'error');
        return;
    }

    if (amount > gameState.balance) {
        showNotification('Insufficient balance!', 'error');
        return;
    }

    gameState.balance -= amount;
    gameState.transactions.unshift({
        type: 'expense',
        amount: amount,
        description: category,
        date: new Date().toISOString()
    });

    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseCategory').value = '';
    
    updateUI();
    saveGameState();
}

// Add daily savings
function addDailySavings() {
    const amount = parseFloat(document.getElementById('savingsAmount').value);

    if (!amount || amount < gameState.dailyTarget) {
        showNotification(`Minimum daily savings is ${gameState.dailyTarget} KSH`, 'error');
        return;
    }

    if (amount > gameState.balance) {
        showNotification('Insufficient balance for savings!', 'error');
        return;
    }

    const today = new Date().toDateString();
    if (gameState.lastSavingsDate === today) {
        showNotification('You have already saved today! See yah Tomorrow Same Place', 'warning');
        return;
    }

    gameState.balance -= amount;
    gameState.weeklySavings.push({
        amount: amount,
        date: today
    });
    gameState.lastSavingsDate = today;
    gameState.streak++;
    
    savingsSound.play();
    showNotification(`Added ${amount} KSH to savings!`, 'success');
    
    document.getElementById('savingsAmount').value = '';
    
    updateUI();
    saveGameState();
}

// Update transactions list
function updateTransactionsList() {
    const transactionsList = document.getElementById('transactionsList');
    transactionsList.innerHTML = '';

    gameState.transactions.slice(0, 10).forEach(transaction => {
        const item = document.createElement('div');
        item.className = `transaction-item ${transaction.type}`;
        item.innerHTML = `
            <span>${transaction.description}</span>
            <span>${transaction.type === 'income' ? '+' : '-'}${transaction.amount} KSH</span>
        `;
        transactionsList.appendChild(item);
    });
}

// Update weekly progress
function updateWeeklyProgress() {
    const totalSaved = gameState.weeklySavings.reduce((sum, s) => sum + s.amount, 0);
    const progressPercentage = Math.min((totalSaved / gameState.weeklyGoal) * 100, 100);
    
    document.getElementById('weeklyProgress').style.width = `${progressPercentage}%`;
    document.getElementById('weeklyTotal').textContent = totalSaved;
    document.getElementById('weeklyGoal').textContent = gameState.weeklyGoal;
}

// Check achievements
function checkAchievements() {
    achievements.forEach(achievement => {
        if (!gameState.achievements.includes(achievement.id) && 
            achievement.condition(gameState)) {
            unlockAchievement(achievement);
        }
    });
}

// Unlock achievement
function unlockAchievement(achievement) {
    gameState.achievements.push(achievement.id);
    gameState.score += achievement.points;
    
    achievementSound.play();
    showNotification(`Achievement Unlocked: ${achievement.title}!`, 'success');
    
    updateUI();
    saveGameState();
    renderAchievements();
}

// Render achievements
function renderAchievements() {
    const achievementsGrid = document.getElementById('achievementsGrid');
    achievementsGrid.innerHTML = '';

    achievements.forEach(achievement => {
        const isUnlocked = gameState.achievements.includes(achievement.id);
        const achievementElement = document.createElement('div');
        achievementElement.className = `achievement ${isUnlocked ? 'unlocked' : 'locked'}`;
        achievementElement.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-title">${achievement.title}</div>
            <div class="achievement-description">${achievement.description}</div>
            <div class="achievement-points">+${achievement.points} points</div>
        `;
        achievementsGrid.appendChild(achievementElement);
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.className = 'notification';
    }, 3000);
}

// Check daily savings reminder
function checkDailySavings() {
    const today = new Date().toDateString();
    if (gameState.lastSavingsDate !== today) {
        document.getElementById('savingsReminder').style.display = 'block';
    }
}

// Reset game
document.getElementById('resetButton').addEventListener('click', () => {
    document.getElementById('resetModal').style.display = 'flex';
});

document.getElementById('confirmReset').addEventListener('click', () => {
    localStorage.removeItem('budgetHeroState');
    location.reload();
});

document.getElementById('cancelReset').addEventListener('click', () => {
    document.getElementById('resetModal').style.display = 'none';
});

// Close savings reminder
document.querySelector('.close-reminder').addEventListener('click', () => {
    document.getElementById('savingsReminder').style.display = 'none';
});

// Initialize game when page loads
window.addEventListener('load', initializeGame);
