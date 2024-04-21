class Timer {
    constructor() {
        this.timers = new Map();
    }

    // Start a timer with a unique key
    startTimer(key, duration, callback) {
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
        }
        const timeout = setTimeout(() => {
            callback();
            this.timers.delete(key);
        }, duration);
        this.timers.set(key, timeout);
    }

    // Stop a timer with a given key
    stopTimer(key) {
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
            this.timers.delete(key);
        }
    }

    // Extend an existing timer with a new duration
    extendTimer(key, additionalTime) {
        if (this.timers.has(key)) {
            const timer = this.timers.get(key);
            const remainingTime = additionalTime + (clearTimeout(timer), additionalTime);
            this.startTimer(key, remainingTime, () => {
                // Callback remains the same as the initial one
            });
        }
    }
}

module.exports = new Timer();
