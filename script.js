const revealElements = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            } else {
                entry.target.classList.remove("visible");
            }
        });
    },
    {
        threshold: 0.3
    }
);

// FOOD RANKINGS
// Replace these example values with your real restaurants!

const restaurants = [
    { name: "Gas Station/CVS", visits: 27 },
    { name: "Chick-fil-A", visits: 17 },
    { name: "Others", visits: 15 },
    { name: "Chipotle", visits: 12 }
];

// Automatically sort from most visits to least visits
restaurants.sort((a, b) => b.visits - a.visits);

const restaurantList = document.getElementById("restaurantList");

const maxVisits = Math.max(
    1,
    ...restaurants.map(r => r.visits)
);

// Create restaurant rows
restaurants.forEach((restaurant, index) => {
    const row = document.createElement("div");
    row.className = "restaurantRow";

    const rank = document.createElement("div");
    rank.className = "restaurantRank";
    rank.textContent = index + 1;

    const info = document.createElement("div");
    info.className = "restaurantInfo";

    const name = document.createElement("div");
    name.className = "restaurantName";
    name.textContent = restaurant.name;

    const bar = document.createElement("div");
    bar.className = "restaurantBar";

    const fill = document.createElement("div");
    fill.className = "restaurantBarFill";
    bar.appendChild(fill);

    info.append(name, bar);

    const count = document.createElement("div");
    count.className = "restaurantCount";
    count.textContent = restaurant.visits;

    const label = document.createElement("small");
    label.textContent = "visits";
    count.appendChild(label);

    row.append(rank, info, count);
    restaurantList.appendChild(row);

    // Reveal each restaurant when scrolled into view
    const rowObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                row.classList.add("visible");

                const percentage =
                    (restaurant.visits / maxVisits) * 100;

                fill.style.width = `${percentage}%`;

                rowObserver.unobserve(row);
            }
        });
    }, {
        threshold: 0.2
    });

    rowObserver.observe(row);
});

// ==================================
// MUSIC ZONE SYSTEM
// ==================================

// Add your songs here
const musicFiles = {
    foru: "assets/music/foru.mp3",
    guillotine: "assets/music/guillotine.mp3",
    horoscopes: "assets/music/horoscopes.mp3"
};

const musicPlayer = document.getElementById("backgroundMusic");
const musicButton = document.getElementById("musicButton");

const slides = [...document.querySelectorAll(".slide")];

let musicEnabled = true;
let currentSong = null;
let activeZone = null;

musicPlayer.loop = true;
musicPlayer.volume = 0.5;

// ==================================
// FIND WHICH MUSIC ZONE A SLIDE IS IN
// ==================================

function getMusicZone(slideIndex) {
    let song = null;

    for (let i = 0; i <= slideIndex; i++) {
        const slide = slides[i];

        // End the previous zone
        if (slide.hasAttribute("data-music-stop")) {
            song = null;
        }

        // Begin a new zone
        if (slide.dataset.musicStart) {
            song = slide.dataset.musicStart;
        }
    }

    return song;
}

// ==================================
// FIND CURRENTLY VISIBLE SLIDE
// ==================================

function getActiveSlideIndex() {
    let activeIndex = 0;
    let maxVisible = 0;

    slides.forEach((slide, index) => {
        const rect = slide.getBoundingClientRect();

        const visibleHeight = Math.max(
            0,
            Math.min(rect.bottom, window.innerHeight)
            - Math.max(rect.top, 0)
        );

        if (visibleHeight > maxVisible) {
            maxVisible = visibleHeight;
            activeIndex = index;
        }
    });

    return activeIndex;
}

// ==================================
// CHANGE MUSIC
// ==================================

function updateMusic() {
    if (!musicEnabled) return;

    const activeIndex = getActiveSlideIndex();
    const desiredSong = getMusicZone(activeIndex);

    // Already playing the correct song
    if (desiredSong === activeZone && !musicPlayer.paused) return;

    activeZone = desiredSong;

    // Stop music outside a zone
    if (!desiredSong) {
        musicPlayer.pause();
        currentSong = null;
        return;
    }

    // Don't restart the same song
    if (desiredSong === currentSong) {
        if (musicPlayer.paused) {
            musicPlayer.play().catch(console.error);
        }
        return;
    }

    // Load and play new song
    const file = musicFiles[desiredSong];

    if (!file) {
        console.warn("Missing music:", desiredSong);
        musicPlayer.pause();
        currentSong = null;
        return;
    }

    musicPlayer.pause();
    musicPlayer.src = file;
    currentSong = desiredSong;

    musicPlayer.play().catch(error => {
        console.warn("Music playback failed:", error);
        console.log("Audio file:", musicPlayer.src);
    });
}

// ==================================
// ENABLE / DISABLE MUSIC
// ==================================

musicButton.addEventListener("click", () => {
    musicEnabled = !musicEnabled;

    if (musicEnabled) {
        musicButton.textContent = "🔊 Music On";

        // Force an update for the current slide
        activeZone = null;
        updateMusic();
    } else {
        musicButton.textContent = "🔇 Music Off";

        musicPlayer.pause();
        currentSong = null;
        activeZone = null;
    }
});

// ==================================
// LISTEN FOR SCROLLING
// ==================================

let scrollScheduled = false;

window.addEventListener("scroll", () => {
    if (scrollScheduled) return;

    scrollScheduled = true;

    requestAnimationFrame(() => {
        updateMusic();
        scrollScheduled = false;
    });
}, { passive: true });

// Update when returning to the tab
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        musicPlayer.pause();
    } else {
        activeZone = null;
        updateMusic();
    }
});
// Try starting music when the page loads
window.addEventListener("load", () => {
    updateMusic();
});

// If autoplay was blocked, retry after the first interaction
function unlockMusic() {
    if (!musicEnabled) return;

    activeZone = null;
    updateMusic();
}

document.addEventListener("pointerdown", unlockMusic, {
    once: true
});

document.addEventListener("keydown", unlockMusic, {
    once: true
});

revealElements.forEach((element) => {
    observer.observe(element);
});
