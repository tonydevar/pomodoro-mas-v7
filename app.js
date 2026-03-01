/**
 * Pomodoro Timer Application
 * Implements a full-featured Pomodoro timer with:
 * - Timer Engine with work/break intervals
 * - Visual progress ring
 * - Audio alerts
 * - Settings customization
 * - LocalStorage persistence
 * - Background-safe timestamp tracking
 */

class PomodoroTimer {
  constructor() {
    // State
    this.timerState = 'idle'; // 'work' | 'shortBreak' | 'longBreak' | 'idle'
    this.timeLeft = 25 * 60; // seconds
    this.settings = {
      workDuration: 25,
      shortBreak: 5,
      longBreak: 15
    };
    this.sessionCount = 0;
    this.isRunning = false;
    this.lastTimestamp = null;
    this.audioContext = null;

    // DOM Elements
    this.elements = {
      timerTime: document.getElementById('timerTime'),
      sessionLabel: document.getElementById('sessionLabel'),
      timerCircle: document.getElementById('timerCircle'),
      progressRing: document.getElementById('progressRing'),
      startPauseBtn: document.getElementById('startPauseBtn'),
      startPauseText: document.getElementById('startPauseText'),
      playIcon: document.getElementById('playIcon'),
      pauseIcon: document.getElementById('pauseIcon'),
      resetBtn: document.getElementById('resetBtn'),
      skipBtn: document.getElementById('skipBtn'),
      settingsHeader: document.getElementById('settingsHeader'),
      settingsToggle: document.getElementById('settingsToggle'),
      settingsContent: document.getElementById('settingsContent'),
      workDuration: document.getElementById('workDuration'),
      shortBreakDuration: document.getElementById('shortBreakDuration'),
      longBreakDuration: document.getElementById('longBreakDuration'),
      sessionCount: document.getElementById('sessionCount'),
      sessionDots: document.querySelectorAll('.session-dot')
    };

    // Progress ring circumference
    this.progressCircumference = 2 * Math.PI * 130; // r=130

    this.init();
  }

  init() {
    this.loadState();
    this.bindEvents();
    this.updateDisplay();
    this.updateProgress();
    this.updateFavicon();
    
    // Handle visibility change for background-safe timing
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isRunning) {
        this.handleVisibilityChange();
      }
    });

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  bindEvents() {
    // Start/Pause button
    this.elements.startPauseBtn.addEventListener('click', () => this.toggleTimer());

    // Reset button
    this.elements.resetBtn.addEventListener('click', () => this.resetTimer());

    // Skip button
    this.elements.skipBtn.addEventListener('click', () => this.skipSession());

    // Settings toggle
    this.elements.settingsHeader.addEventListener('click', () => this.toggleSettings());

    // Settings inputs
    this.elements.workDuration.addEventListener('change', (e) => this.updateSettings('workDuration', e.target.value));
    this.elements.shortBreakDuration.addEventListener('change', (e) => this.updateSettings('shortBreak', e.target.value));
    this.elements.longBreakDuration.addEventListener('change', (e) => this.updateSettings('longBreak', e.target.value));
  }

  toggleTimer() {
    if (this.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    // Initialize audio context on user interaction
    this.initAudio();

    // If idle, start with work session
    if (this.timerState === 'idle') {
      this.timerState = 'work';
      this.timeLeft = this.settings.workDuration * 60;
    }

    this.isRunning = true;
    this.lastTimestamp = Date.now();
    this.updateButtonState();
    this.updateDisplay();
    this.updateSessionIndicator();
    this.saveState();

    // Start the timer loop
    this.timerLoop();
  }

  pauseTimer() {
    this.isRunning = false;
    this.updateButtonState();
    this.saveState();
  }

  resetTimer() {
    this.isRunning = false;
    this.timerState = 'idle';
    this.timeLeft = this.settings.workDuration * 60;
    this.updateButtonState();
    this.updateDisplay();
    this.updateProgress();
    this.updateSessionIndicator();
    this.updateFavicon();
    this.saveState();
  }

  skipSession() {
    this.completeSession();
  }

  timerLoop() {
    if (!this.isRunning) return;

    const now = Date.now();
    const elapsed = Math.floor((now - this.lastTimestamp) / 1000);

    if (elapsed >= 1) {
      this.timeLeft = Math.max(0, this.timeLeft - elapsed);
      this.lastTimestamp = now;
      this.updateDisplay();
      this.updateProgress();
      this.updateFavicon();

      if (this.timeLeft === 0) {
        this.completeSession();
        return;
      }
    }

    requestAnimationFrame(() => this.timerLoop());
  }

  handleVisibilityChange() {
    // Recalculate time when returning to the tab
    if (this.isRunning && this.lastTimestamp) {
      const now = Date.now();
      const elapsed = Math.floor((now - this.lastTimestamp) / 1000);
      if (elapsed >= 1) {
        this.timeLeft = Math.max(0, this.timeLeft - elapsed);
        this.lastTimestamp = now;
        this.updateDisplay();
        this.updateProgress();
        this.updateFavicon();

        if (this.timeLeft === 0) {
          this.completeSession();
        }
      }
    }
  }

  completeSession() {
    this.isRunning = false;
    this.playNotificationSound();

    // Show notification
    this.showNotification();

    if (this.timerState === 'work') {
      this.sessionCount++;
      
      // Every 4 work sessions, take a long break
      if (this.sessionCount % 4 === 0) {
        this.timerState = 'longBreak';
        this.timeLeft = this.settings.longBreak * 60;
      } else {
        this.timerState = 'shortBreak';
        this.timeLeft = this.settings.shortBreak * 60;
      }
    } else {
      // After any break, go back to work
      this.timerState = 'work';
      this.timeLeft = this.settings.workDuration * 60;
    }

    this.updateButtonState();
    this.updateDisplay();
    this.updateProgress();
    this.updateSessionIndicator();
    this.updateFavicon();
    this.saveState();
  }

  updateButtonState() {
    if (this.isRunning) {
      this.elements.playIcon.style.display = 'none';
      this.elements.pauseIcon.style.display = 'block';
      this.elements.startPauseText.textContent = 'Pause';
      this.elements.startPauseBtn.classList.add('running');
      document.body.classList.add('timer-running');
    } else {
      this.elements.playIcon.style.display = 'block';
      this.elements.pauseIcon.style.display = 'none';
      this.elements.startPauseText.textContent = 'Start';
      this.elements.startPauseBtn.classList.remove('running');
      document.body.classList.remove('timer-running');
    }
  }

  updateDisplay() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    this.elements.timerTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update session label
    const labels = {
      'work': 'Work',
      'shortBreak': 'Short Break',
      'longBreak': 'Long Break',
      'idle': 'Ready'
    };
    this.elements.sessionLabel.textContent = labels[this.timerState] || 'Ready';
    
    // Update session count
    this.elements.sessionCount.textContent = this.sessionCount;
  }

  updateProgress() {
    let totalTime;
    switch (this.timerState) {
      case 'work':
        totalTime = this.settings.workDuration * 60;
        break;
      case 'shortBreak':
        totalTime = this.settings.shortBreak * 60;
        break;
      case 'longBreak':
        totalTime = this.settings.longBreak * 60;
        break;
      default:
        totalTime = this.settings.workDuration * 60;
    }

    const progress = totalTime > 0 ? (totalTime - this.timeLeft) / totalTime : 0;
    const offset = this.progressCircumference * (1 - progress);
    
    this.elements.progressRing.style.strokeDashoffset = offset;
  }

  updateSessionIndicator() {
    // Update timer circle color
    this.elements.timerCircle.className = 'timer-circle ' + this.timerState;

    // Update session dots
    this.elements.sessionDots.forEach((dot, index) => {
      dot.classList.remove('active', 'completed');
      
      if (this.timerState === 'work') {
        if (index < (this.sessionCount % 4)) {
          dot.classList.add('completed');
        } else if (index === (this.sessionCount % 4)) {
          dot.classList.add('active');
        }
      } else if (this.timerState === 'shortBreak' || this.timerState === 'longBreak') {
        if (index < (this.sessionCount % 4)) {
          dot.classList.add('completed');
        }
      }
    });
  }

  updateFavicon() {
    const emojis = {
      'work': '🍅',
      'shortBreak': '☕',
      'longBreak': '🌴',
      'idle': '🍅'
    };
    const emoji = emojis[this.timerState] || '🍅';
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
      favicon.href = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${emoji}</text></svg>`;
    }
  }

  toggleSettings() {
    this.elements.settingsContent.classList.toggle('open');
    this.elements.settingsToggle.classList.toggle('open');
  }

  updateSettings(setting, value) {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 1) return;

    this.settings[setting] = numValue;

    // Update time if idle
    if (this.timerState === 'idle') {
      this.timeLeft = this.settings.workDuration * 60;
      this.updateDisplay();
      this.updateProgress();
    }

    // Update input values to ensure they're in sync
    switch (setting) {
      case 'workDuration':
        this.elements.workDuration.value = numValue;
        break;
      case 'shortBreak':
        this.elements.shortBreakDuration.value = numValue;
        break;
      case 'longBreak':
        this.elements.longBreakDuration.value = numValue;
        break;
    }

    this.saveState();
  }

  initAudio() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume audio context if suspended
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  playNotificationSound() {
    if (!this.audioContext) return;

    // Create a pleasant notification tone
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Play a two-tone notification
    oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime); // A5
    oscillator.frequency.setValueAtTime(1108.73, this.audioContext.currentTime + 0.15); // C#6
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.4);
  }

  showNotification() {
    const titles = {
      'work': 'Work Session Complete!',
      'shortBreak': 'Break Over!',
      'longBreak': 'Long Break Over!'
    };

    const bodies = {
      'work': 'Time for a break!',
      'shortBreak': 'Ready for another work session?',
      'longBreak': 'Ready for another work session?'
    };

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(titles[this.timerState] || 'Pomodoro', {
        body: bodies[this.timerState] || 'Time to focus!',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍅</text></svg>'
      });
    }
  }

  saveState() {
    const state = {
      timerState: this.timerState,
      timeLeft: this.timeLeft,
      settings: this.settings,
      sessionCount: this.sessionCount,
      isRunning: this.isRunning,
      lastTimestamp: this.lastTimestamp
    };
    localStorage.setItem('pomodoroState', JSON.stringify(state));
  }

  loadState() {
    try {
      const saved = localStorage.getItem('pomodoroState');
      if (saved) {
        const state = JSON.parse(saved);
        
        this.timerState = state.timerState || 'idle';
        this.timeLeft = state.timeLeft || this.settings.workDuration * 60;
        this.settings = { ...this.settings, ...state.settings };
        this.sessionCount = state.sessionCount || 0;
        
        // Restore timestamp for background-safe timing
        if (state.lastTimestamp && state.isRunning) {
          // Calculate elapsed time while away
          const elapsed = Math.floor((Date.now() - state.lastTimestamp) / 1000);
          this.timeLeft = Math.max(0, this.timeLeft - elapsed);
          
          if (this.timeLeft === 0) {
            this.timerState = 'idle';
            this.timeLeft = this.settings.workDuration * 60;
          }
        }

        // Update input values
        this.elements.workDuration.value = this.settings.workDuration;
        this.elements.shortBreakDuration.value = this.settings.shortBreak;
        this.elements.longBreakDuration.value = this.settings.longBreak;
      }
    } catch (e) {
      console.warn('Failed to load saved state:', e);
    }
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.pomodoroTimer = new PomodoroTimer();
});
