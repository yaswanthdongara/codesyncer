(function() {
    const IDLE_TIMEOUT = 60 * 1000; // 1 minute
    const CHECK_INTERVAL = 5 * 1000; // 5 seconds
    let lastActivity = Date.now();

    function updateActivity() {
        lastActivity = Date.now();
    }

    ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, updateActivity, { passive: true });
    });

    function getTodayStr() {
        return new Date().toISOString().split('T')[0];
    }

    function trackTime() {
        const now = Date.now();
        if (now - lastActivity < IDLE_TIMEOUT) {
            // User is active
            const today = getTodayStr();
            let usage = JSON.parse(localStorage.getItem('daily_usage') || '{}');
            
            // Add CHECK_INTERVAL (in seconds) to today's usage
            usage[today] = (usage[today] || 0) + (CHECK_INTERVAL / 1000);
            
            localStorage.setItem('daily_usage', JSON.stringify(usage));
        }
    }

    setInterval(trackTime, CHECK_INTERVAL);
})();
