document.addEventListener('DOMContentLoaded', function () {
    const petImage = document.getElementById('pet-image');
    const petContainer = document.getElementById('pet-container');
    const notification = document.getElementById('notification');

    const petBtn = document.getElementById('pet-btn');
    const feedBtn = document.getElementById('feed-btn');
    const playBtn = document.getElementById('play-btn');
    const sleepBtn = document.getElementById('sleep-btn');
    const resetBtn = document.getElementById('reset-btn');

    const happinessProgress = document.getElementById('happiness-progress');
    const hungerProgress = document.getElementById('hunger-progress');
    const energyProgress = document.getElementById('energy-progress');
    const happinessValue = document.getElementById('happiness-value');
    const hungerValue = document.getElementById('hunger-value');
    const energyValue = document.getElementById('energy-value');

    const petSound = document.getElementById('pet-sound');
    const feedSound = document.getElementById('feed-sound');
    const playSound = document.getElementById('play-sound');
    const sleepSound = document.getElementById('sleep-sound');
    const evolveSound = document.getElementById('evolve-sound');
    const notificationSound = document.getElementById('notification-sound');
    const bgMusic = document.getElementById('bg-music');

    const state = {
        happiness: 50,
        hunger: 50,
        energy: 50,
        isSleeping: false,
        isEvolved: false,
        level: 1,
        experience: 0,
        currentAnimation: 'idle',
        animationFrame: 0,
        animationInterval: null,
        needs: {
            happiness: 0,
            hunger: 0,
            energy: 0
        },
        items: {
            toy: 3,
            food: 5,
            medicine: 2,
            ball: 2,
            hat: 1
        },
        lastActionTime: Date.now()
    };

    const animations = {
        idle: { frames: ['assets/idle_1.png', 'assets/idle_2.png', 'assets/idle_3.png'], speed: 1000, loop: true },
        petting: { frames: ['assets/petting_1.png', 'assets/petting_2.png', 'assets/petting_3.png'], speed: 300, loop: false },
        feeding: { frames: ['assets/feeding_1.png', 'assets/feeding_2.png', 'assets/feeding_3.png'], speed: 300, loop: false },
        playing: { frames: ['assets/playing_1.png', 'assets/playing_2.png', 'assets/playing_3.png'], speed: 300, loop: false },
        ball: { frames: ['assets/ball_1.png', 'assets/ball_2.png', 'assets/ball_3.png'], speed: 300, loop: false },
        sleeping: { frames: ['assets/sleeping_1.png', 'assets/sleeping_2.png'], speed: 800, loop: true },
        evolved: { frames: ['assets/evolved_1.png', 'assets/evolved_2.png'], speed: 500, loop: true },
        sick: { frames: ['assets/sick_1.png', 'assets/sick_2.png'], speed: 1000, loop: true }
    };

    function updateStatsDisplay() {
        happinessProgress.style.width = state.happiness.toFixed(2) + '%';
        hungerProgress.style.width = state.hunger.toFixed(2) + '%';
        energyProgress.style.width = state.energy.toFixed(2) + '%';

        happinessValue.textContent = state.happiness.toFixed(2) + '%';
        hungerValue.textContent = state.hunger.toFixed(2) + '%';
        energyValue.textContent = state.energy.toFixed(2) + '%';

        happinessProgress.style.backgroundColor = state.happiness < 30 ? '#EF4444' : state.happiness < 70 ? '#F59E0B' : '#10B981';
        hungerProgress.style.backgroundColor = state.hunger < 30 ? '#EF4444' : state.hunger < 70 ? '#F59E0B' : '#10B981';
        energyProgress.style.backgroundColor = state.energy < 30 ? '#EF4444' : state.energy < 70 ? '#F59E0B' : '#10B981';
    }

    function startAnimation(animationName) {
        if (state.currentAnimation === animationName && animationName !== 'idle') return;
        state.currentAnimation = animationName;
        state.animationFrame = 0;
        clearInterval(state.animationInterval);

        const animation = animations[animationName];
        if (!animation) return;

        petImage.src = animation.frames[0];

        if (animation.frames.length > 1) {
            state.animationInterval = setInterval(() => {
                state.animationFrame = (state.animationFrame + 1) % animation.frames.length;
                petImage.src = animation.frames[state.animationFrame];

                if (!animation.loop && state.animationFrame === animation.frames.length - 1) {
                    clearInterval(state.animationInterval);
                    setTimeout(() => {
                        startAnimation(state.isEvolved ? 'evolved' : 'idle');
                    }, 300);
                }
            }, animation.speed);
        }
    }

    function showNotification(message, duration = 2000) {
        notification.textContent = message;
        notification.classList.add('show');
        notificationSound.currentTime = 0;
        notificationSound.play();
        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    }

    function startNeedsDecay() {
        setInterval(() => {
            if (state.isSleeping) {
                state.energy = Math.min(100, state.energy + 2);
                state.hunger = Math.max(0, state.hunger - 0.5);
            } else {
                state.happiness = Math.max(0, state.happiness - 0.2);
                state.hunger = Math.max(0, state.hunger - 0.5);
                state.energy = Math.max(0, state.energy - 0.3);
            }

            if (state.happiness < 30) state.needs.happiness++;
            if (state.hunger < 30) state.needs.hunger++;
            if (state.energy < 30) state.needs.energy++;

            if (state.happiness < 20) showNotification("Your pet is sad! Pet or play with it!");
            if (state.hunger < 20) showNotification("Your pet is hungry! Feed it!");
            if (state.energy < 20) showNotification("Your pet is tired! Let it sleep!");

            if (!state.isEvolved && state.happiness >= 80 && state.hunger >= 70 && state.energy >= 70) {
                evolvePet();
            }

            if (Math.random() < 0.005 && !state.isSleeping && state.currentAnimation !== 'sick') {
                startAnimation('sick');
                showNotification("Your pet doesn't feel well! Use medicine!", 4000);
            }

            updateStatsDisplay();
        }, 1000);
    }

    function evolvePet() {
        state.isEvolved = true;
        state.level++;
        evolveSound.play();
        showNotification("Congratulations! Your pet evolved!", 3000);
        startAnimation('evolved');
    }

    function useItem(itemType) {
        switch (itemType) {
            case 'toy':
                state.happiness = Math.min(100, state.happiness + 15);
                playSound.play();
                startAnimation('playing');
                showNotification("Your pet loves the toy!");
                break;
            case 'food':
                state.hunger = Math.min(100, state.hunger + 20);
                feedSound.play();
                startAnimation('feeding');
                showNotification("Yummy! Your pet is eating.");
                break;
            case 'medicine':
                if (state.currentAnimation === 'sick') {
                    startAnimation(state.isEvolved ? 'evolved' : 'idle');
                    showNotification("Your pet feels better now!");
                } else {
                    showNotification("Your pet doesn't need medicine.");
                }
                break;
            case 'ball':
                state.happiness = Math.min(100, state.happiness + 10);
                state.energy = Math.max(0, state.energy - 5);
                playSound.play();
                startAnimation('ball');
                showNotification("Your pet is playing with the ball!");
                break;
            case 'hat':
                state.happiness = Math.min(100, state.happiness + 5);
                showNotification("Your pet looks stylish with the hat!");
                const oldSrc = petImage.src;
                petImage.src = 'assets/hat_pet.png';
                setTimeout(() => {
                    petImage.src = oldSrc;
                }, 5000);
                break;
        }

        updateStatsDisplay();
    }

    function setupInventory() {
        const items = document.querySelectorAll('.item');
        items.forEach(item => {
            const itemType = item.dataset.item;
            item.addEventListener('click', () => {
                useItem(itemType);
            });
        });
    }

    function init() {
        updateStatsDisplay();
        startAnimation('idle');
        startNeedsDecay();
        setupInventory();
        bgMusic.volume = 0.3;
        bgMusic.play().catch(e => console.log("Auto-play prevented"));

        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyM') {
                bgMusic.muted = !bgMusic.muted;
                showNotification(bgMusic.muted ? "Sound muted" : "Sound unmuted");
            }
        });
    }

    init();

    // --- BUTTON FUNCTIONALITY ---

    petBtn.addEventListener('click', () => {
        if (state.isSleeping) return showNotification("Shhh... your pet is sleeping!");
        state.happiness = Math.min(100, state.happiness + 10);
        petSound.play();
        startAnimation('petting');
        updateStatsDisplay();
    });

    feedBtn.addEventListener('click', () => {
        if (state.isSleeping) return showNotification("Let your pet sleep first!");
        state.hunger = Math.min(100, state.hunger + 15);
        feedSound.play();
        startAnimation('feeding');
        updateStatsDisplay();
    });

    playBtn.addEventListener('click', () => {
        if (state.isSleeping) return showNotification("Your pet is napping!");
        if (state.energy < 10) return showNotification("Too tired to play!");
        state.happiness = Math.min(100, state.happiness + 5);
        state.energy = Math.max(0, state.energy - 10);
        playSound.play();
        startAnimation('playing');
        updateStatsDisplay();
    });

    sleepBtn.addEventListener('click', () => {
        state.isSleeping = !state.isSleeping;
        sleepSound.play();
        startAnimation(state.isSleeping ? 'sleeping' : (state.isEvolved ? 'evolved' : 'idle'));
        showNotification(state.isSleeping ? "Your pet is now sleeping..." : "Your pet woke up!");
    });

    resetBtn.addEventListener('click', () => {
        if (confirm("Reset your pet?")) {
            state.happiness = 50;
            state.hunger = 50;
            state.energy = 50;
            state.isSleeping = false;
            state.isEvolved = false;
            startAnimation('idle');
            updateStatsDisplay();
            showNotification("Pet has been reset!");
        }
    });
});

<!-- Update 2024-11-11T12:05:03+05:30 -->
<!-- Update 2024-11-24T12:40:13+05:30 -->
<!-- Update 2024-12-22T06:15:22+05:30 -->
<!-- Update 2024-12-28T11:33:24+05:30 -->