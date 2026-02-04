import MusicApp from "./MusicApp.js";
import CustomDB from "./CustomDB.js";

let songs = [];
let activeButton = null;
let editSongId = null;

const dropdown = document.getElementById("globalDropdown");
const tbody = document.getElementById("tableBody");
const template = document.getElementById("rowTemplate");

// ----- DOM Utilities Function ----
// --- Dropdown Script ---
function positionDropdown(button) {
  const rect = button.getBoundingClientRect();
  dropdown.style.top = rect.bottom + "px";
  dropdown.style.left = rect.right - dropdown.offsetWidth + "px";
}

function showDropdown(type) {
  dropdown.classList.remove("hidden");
  dropdown.innerHTML = `
    <button class="w-full text-left px-4 py-3 hover:bg-green-400/20 transition">
      <i class="fa-solid fa-pen-to-square text-green-400"></i>
      Edit ${type === "player" ? "Playlist" : "Song"}
    </button>
    <button class="btn-delete w-full text-left px-4 py-3 hover:bg-red-400/20 transition">
      <i class="fa-solid fa-trash text-red-400"></i>
      Delete ${type === "player" ? "Playlist" : "Song"}
    </button>
  `;
  requestAnimationFrame(() => {
    dropdown.classList.remove("opacity-0", "scale-95");
    dropdown.classList.add("opacity-100", "scale-100");
  });
}

function hideDropdown() {
  dropdown.classList.remove("opacity-100", "scale-100");
  dropdown.classList.add("opacity-0", "scale-95");
  setTimeout(() => dropdown.classList.add("hidden"), 150);
}
// --- End of Dropdown Script ---

// --- Mobile Action Sheet Script ---
const mobileSheet = document.getElementById("mobileSheet");
const mobileSheetOverlay = document.getElementById("mobileSheetOverlay");
const btnCancelSheet = document.getElementById("btnCancelSheet");
btnCancelSheet.addEventListener("click", hideMobileSheet);

function showMobileSheet(type) {
  mobileSheetOverlay.classList.remove("hidden");
  setTimeout(() => mobileSheetOverlay.classList.remove("opacity-0"), 10);

  const title = mobileSheet.querySelector("div");
  const buttons = mobileSheet.querySelectorAll("button");
  miniPlayer.style.pointerEvents = "none";

  if (type === "player") {
    title.textContent = "Playlist Actions";
    buttons[0].innerHTML = `<i class="fa-solid fa-pen-to-square text-green-400 text-lg"></i> Edit Playlist`;
    buttons[1].innerHTML = `<i class="fa-solid fa-trash text-red-400 text-lg"></i> Delete Playlist`;
  } else {
    title.textContent = "Song Actions";
    buttons[0].innerHTML = `<i class="fa-solid fa-pen-to-square text-green-400 text-lg"></i> Edit Song`;
    buttons[1].innerHTML = `<i class="fa-solid fa-trash text-red-400 text-lg"></i> Delete Song`;
  }

  mobileSheet.classList.remove("translate-y-full");
}

function hideMobileSheet() {
  mobileSheetOverlay.classList.add("opacity-0");
  mobileSheet.classList.add("translate-y-full");
  setTimeout(() => mobileSheetOverlay.classList.add("hidden"), 200);
  miniPlayer.style.pointerEvents = "auto";
}

mobileSheetOverlay.addEventListener("click", hideMobileSheet);
// --- End of Mobile Action Sheet Script ---

// Navbar Mobile Script
const btnMenu = document.getElementById("btnMenu");
const mobileMenu = document.getElementById("mobileMenu");

btnMenu.addEventListener("click", () => {
  if (mobileMenu.classList.contains("opacity-0")) {
    mobileMenu.classList.remove(
      "opacity-0",
      "-translate-y-2",
      "pointer-events-none",
    );
    mobileMenu.classList.add("opacity-100", "translate-y-0");
  } else {
    mobileMenu.classList.add(
      "opacity-0",
      "-translate-y-2",
      "pointer-events-none",
    );
    mobileMenu.classList.remove("opacity-100", "translate-y-0");
  }
});
// End of Navbar Mobile Script

function openEditModal(song) {
  const uploadModal = document.getElementById("uploadModal");

  document.querySelector("#uploadModal h2").textContent = "Edit Song";
  document.getElementById("btnUpload").textContent = "Save Changes";

  inputTitle.value = song.title;
  inputArtist.value = song.artist;
  inputAlbum.value = song.album;

  inputImage.value = "";
  inputAudio.value = "";

  editSongId = song.id;

  uploadModal.classList.remove("hidden");
}

// ----- End of DOM Utilities Function ----

// ----- Helper Function -----
// --- Audio Duration Helper ---
function getAudioDuration(src) {
  return new Promise((resolve) => {
    const audio = new Audio();
    if (src instanceof Blob) audio.src = URL.createObjectURL(src);
    else audio.src = src;

    audio.addEventListener("loadedmetadata", () => {
      const minutes = Math.floor(audio.duration / 60);
      let seconds = Math.floor(audio.duration % 60);
      if (seconds < 10) seconds = "0" + seconds;
      resolve(`${minutes}:${seconds}`);
    });
  });
}
// ----- End of Audio Duration Helper -----
// ----- Helper Function -----

// --- IndexedDB Init ---
async function initDB() {
  const db = new CustomDB("MusicDB", "songs");
  await db.open();

  let songsList = await db.getAll();

  if (songsList.length === 0) {
    songsList = [];
  }

  return { db, songs: songsList };
}

// --- Render Songs Table ---
async function renderSongsTable(songsArr, player, db) {
  tbody.innerHTML = "";

  const durations = await Promise.all(
    songsArr.map((s) => getAudioDuration(s.src)),
  );

  songsArr.forEach((song, i) => {
    const clone = template.content.cloneNode(true);
    const row = clone.querySelector(".row-song");
    row.dataset.index = i;

    const audioSrc =
      song.src instanceof Blob ? URL.createObjectURL(song.src) : song.src;
    const imgSrc =
      song.img instanceof Blob ? URL.createObjectURL(song.img) : song.img;

    clone.querySelector(".index-table").textContent = i + 1;
    clone.querySelector(".img-table").src = imgSrc;
    clone.querySelector(".title-table").textContent = song.title;
    clone.querySelector(".artist-table").textContent = song.artist;
    clone.querySelector(".album-table").textContent = song.album;
    clone.querySelector(".duration-table").textContent = durations[i];

    tbody.appendChild(clone);

    row.addEventListener("click", (e) => {
      if (e.target.closest(".btn-more")) return;
      player.playSong(i);
    });
  });
}

// --- Upload Modal ---
function setupUploadModal(player, db) {
  const uploadModal = document.getElementById("uploadModal");
  const inputTitle = document.getElementById("inputTitle");
  const inputArtist = document.getElementById("inputArtist");
  const inputAlbum = document.getElementById("inputAlbum");
  const inputImage = document.getElementById("inputImage");
  const inputAudio = document.getElementById("inputAudio");
  const btnUploadModal = document.getElementById("btnUpload");
  const btnCancel = document.getElementById("btnCancelUpload");

  document.querySelectorAll(".btn-upload").forEach((btn) => {
    btn.addEventListener("click", () => uploadModal.classList.remove("hidden"));
  });

  btnCancel.addEventListener("click", () =>
    uploadModal.classList.add("hidden"),
  );
  uploadModal.addEventListener("click", (e) => {
    if (e.target === uploadModal) uploadModal.classList.add("hidden");
  });

  btnUploadModal.addEventListener("click", async () => {
    const title = inputTitle.value.trim();
    const artist = inputArtist.value.trim();
    const album = inputAlbum.value.trim();
    const imgFile = inputImage.files[0];
    const audioFile = inputAudio.files[0];

    if (!title || !artist || !album) {
      alert("Title, Artist, Album wajib diisi!");
      return;
    }

    // Edit Mode
    if (editSongId !== null) {
      const updateData = { title, artist, album };

      if (imgFile) updateData.img = imgFile;
      if (audioFile) updateData.src = audioFile;

      await db.update(editSongId, updateData);

      editSongId = null;
      document.querySelector("#uploadModal h2").textContent = "Upload Song";
      btnUploadModal.textContent = "Upload";
    }

    // Add Mode
    else {
      if (!imgFile || !audioFile) {
        alert("Image dan Audio wajib diisi!");
        return;
      }
      await db.add({ title, artist, album, img: imgFile, src: audioFile });
    }

    songs = await db.getAll();
    await renderSongsTable(songs, player, db);
    player.updateSongs(songs);

    uploadModal.classList.add("hidden");
    inputTitle.value = "";
    inputArtist.value = "";
    inputAlbum.value = "";
    inputImage.value = "";
    inputAudio.value = "";
  });
}

// --- Init App ---
async function init() {
  const { db, songs: initialSongs } = await initDB();
  songs = initialSongs;

  const player = new MusicApp(songs);
  await renderSongsTable(songs, player, db);

  // Player controls
  document
    .querySelectorAll(".btn-play")
    .forEach((btn) => btn.addEventListener("click", () => player.togglePlay()));
  document
    .querySelectorAll(".btn-next")
    .forEach((btn) => btn.addEventListener("click", () => player.next()));
  document
    .querySelectorAll(".btn-prev")
    .forEach((btn) => btn.addEventListener("click", () => player.prev()));
  document
    .querySelectorAll(".btn-repeat")
    .forEach((btn) =>
      btn.addEventListener("click", () => player.toggleRepeat()),
    );
  document
    .querySelectorAll(".btn-shuffle")
    .forEach((btn) =>
      btn.addEventListener("click", () => player.toggleShuffle()),
    );

  setupUploadModal(player, db);

  // --- Dropdown Global Listener ---
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-more");
    const clickInsideDropdown = e.target.closest("#globalDropdown");

    if (btn) {
      const row = btn.closest(".row-song");

      const type = btn.dataset.type;

      if (window.innerWidth < 1024) {
        showMobileSheet(type);
      } else {
        activeButton = btn;
        showDropdown(type);
        positionDropdown(btn);
      }

      // Edit
      const dropdownEdit = dropdown.querySelector("button:first-child");
      if (dropdownEdit) {
        dropdownEdit.onclick = () => {
          const index = row.dataset.index;
          const song = songs[index];
          openEditModal(song);
          hideDropdown();
        };
      }

      const mobileSheetEdit = mobileSheet.querySelector("button:first-of-type");
      if (mobileSheetEdit) {
        mobileSheetEdit.onclick = () => {
          const index = row.dataset.index;
          const song = songs[index];
          openEditModal(song);
          hideMobileSheet();
        };
      }

      // Delete
      const dropdownDelete = dropdown.querySelector(".btn-delete");
      if (dropdownDelete) {
        dropdownDelete.onclick = async () => {
          const index = row.dataset.index;
          const song = songs[index];
          await db.delete(song.id);

          songs = await db.getAll();
          await renderSongsTable(songs, player, db);
          player.updateSongs(songs);

          hideDropdown();
        };
      }

      const mobileSheetDelete = mobileSheet.querySelector(".btn-delete");
      if (mobileSheetDelete) {
        mobileSheetDelete.onclick = async () => {
          const index = row.dataset.index;
          const song = songs[index];
          await db.delete(song.id);

          songs = await db.getAll();
          await renderSongsTable(songs, player, db);
          player.updateSongs(songs);

          hideMobileSheet();
        };
      }
      return;
    }

    if (!clickInsideDropdown) {
      hideDropdown();
      activeButton = null;
    }
  });

  window.addEventListener("resize", () => {
    if (activeButton && !dropdown.classList.contains("hidden"))
      positionDropdown(activeButton);
  });

  window.addEventListener("scroll", () => {
    if (activeButton && !dropdown.classList.contains("hidden"))
      positionDropdown(activeButton);
  });
}

init();
