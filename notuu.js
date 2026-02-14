const notesContainer = document.getElementById("notesContainer");
const addNoteBtn = document.getElementById("addNote");
const searchInput = document.getElementById("searchInput");
const dateFilter = document.getElementById("dateFilter");
const darkToggle = document.getElementById("darkToggle");
const musicToggle = document.getElementById("musicToggle");
const themeSwitcher = document.getElementById("themeSwitcher");
const bgMusic = document.getElementById("bgMusic");
const installBtn = document.getElementById('installApp');
const modal = document.getElementById("noteModal");
const closeModal = document.querySelector(".close-modal");

let notes = JSON.parse(localStorage.getItem("animeNotes")) || [];
let moodChart = null;
let deferredPrompt;

/* --- Core Functions --- */

function saveNotes() {
    localStorage.setItem("animeNotes", JSON.stringify(notes));
    renderNotes();
    updateChart();
}

addNoteBtn.onclick = () => {
    const titleInput = document.getElementById("noteTitle");
    const textInput = document.getElementById("noteText");
    const moodInput = document.getElementById("noteMood");
    
    const title = titleInput.value.trim();
    const text = textInput.value.trim();
    const mood = moodInput.value;
    const date = new Date().toISOString().split("T")[0];

    if (!title || !text) {
        alert("Please fill in both fields! ✨");
        return;
    }

    notes.push({ title, text, mood, date, pinned: false });
    
    titleInput.value = "";
    textInput.value = "";
    titleInput.blur();
    textInput.blur();
    
    saveNotes();
};

function renderNotes() {
    notesContainer.innerHTML = "";
    const searchTerm = searchInput.value.toLowerCase();

    let filtered = notes.filter(n =>
        n.title.toLowerCase().includes(searchTerm) &&
        (dateFilter.value ? n.date === dateFilter.value : true)
    );

    filtered.sort((a, b) => b.pinned - a.pinned || new Date(b.date) - new Date(a.date));

    filtered.forEach((note) => {
        const actualIndex = notes.indexOf(note);
        const div = document.createElement("div");
        div.className = "note";
        if (note.pinned) div.classList.add("pinned");

        div.innerHTML = `
            <div class="note-content" onclick="openNote(${actualIndex})">
                <h3>${note.mood} ${note.title}</h3>
                <p>${note.text}</p>
                <small>${note.date}</small>
            </div>
            <div class="note-actions">
                <button onclick="event.stopPropagation(); togglePin(${actualIndex})" aria-label="Pin">📌</button>
                <button onclick="event.stopPropagation(); deleteNote(${actualIndex})" aria-label="Delete">🗑️</button>
            </div>
        `;
        notesContainer.appendChild(div);
    });
}

/* --- Note Actions --- */

function deleteNote(i) {
    if(confirm("Delete this cute note? 🌸")) {
        notes.splice(i, 1);
        saveNotes();
    }
}

function togglePin(i) {
    notes[i].pinned = !notes[i].pinned;
    saveNotes();
}

function openNote(index) {
    const note = notes[index];
    document.getElementById("modalTitle").innerText = `${note.mood} ${note.title}`;
    document.getElementById("modalDate").innerText = note.date;
    document.getElementById("modalBody").innerText = note.text;
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

closeModal.onclick = () => {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
};

window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
};

/* --- Controls & Optimization --- */

let searchTimeout;
searchInput.oninput = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(renderNotes, 300);
};

dateFilter.onchange = renderNotes;

darkToggle.onclick = () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    darkToggle.innerText = isDark ? "☀️" : "🌙";
};

musicToggle.onclick = () => {
    if (bgMusic.paused) {
        bgMusic.play().catch(() => alert("Interact with the page to play music! 🎵"));
    } else {
        bgMusic.pause();
    }
};

themeSwitcher.onchange = e => {
    document.body.classList.remove("purple", "blue");
    if (e.target.value !== "pink") document.body.classList.add(e.target.value);
};

/* --- Animations & Charts --- */

const createSakura = () => {
    if (document.querySelectorAll('.sakura').length > 15) return;
    const sakura = document.createElement("div");
    sakura.className = "sakura";
    sakura.innerHTML = "🌸";
    sakura.style.left = Math.random() * 100 + "vw";
    const duration = Math.random() * 3 + 4;
    sakura.style.animationDuration = duration + "s";
    sakura.style.fontSize = Math.random() * 10 + 10 + "px";
    document.body.appendChild(sakura);
    setTimeout(() => sakura.remove(), duration * 1000); 
};
setInterval(createSakura, 800);

function updateChart() {
    const chartCanvas = document.getElementById("moodChart");
    if (!chartCanvas) return;
    const moods = { "😊": 0, "😐": 0, "😔": 0 };
    notes.forEach(n => moods[n.mood]++);
    if (moodChart) moodChart.destroy();
    moodChart = new Chart(chartCanvas, {
        type: "pie",
        data: {
            labels: Object.keys(moods),
            datasets: [{
                data: Object.values(moods),
                backgroundColor: ['#ff7eb3', '#bf94ff', '#70a1ff']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

/* --- PWA & Install Logic --- */

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("service-worker.js")
            .then(() => console.log("SW Registered"))
            .catch(err => console.log("SW Failed", err));
    });
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block';

    installBtn.addEventListener('click', () => {
        installBtn.style.display = 'none';
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choice) => {
            console.log(choice.outcome === 'accepted' ? 'User installed' : 'User dismissed');
            deferredPrompt = null;
        });
    });
});

window.addEventListener('appinstalled', () => {
    installBtn.style.display = 'none';
});

// Initial Setup
renderNotes();
updateChart();