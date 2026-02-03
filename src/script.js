import MusicApp from "./MusicApp.js";
import CustomDB from "./CustomDB.js";

// IndexedDB Init
async function initDB() {
  const db = new CustomDB("MusicDB", "songs");
  await db.open();

  let songs = await db.getAll();

  if (songs.length === 0) {
    songs = [];

    for (const song of songs) {
      await db.add(song);
    }
  }

  return { db, songs };
}

// Audio Duration
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

// Render Table
const tbody = document.getElementById("tableBody");
const template = document.getElementById("rowTemplate");

async function renderSongsTable(songs, player) {
  tbody.innerHTML = "";

  const durations = await Promise.all(
    songs.map((s) => getAudioDuration(s.src)),
  );

  songs.forEach((song, i) => {
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

// Upload Modal
function setupUploadModal(player, db) {
  const uploadModal = document.getElementById("uploadModal");
  const inputTitle = document.getElementById("inputTitle");
  const inputArtist = document.getElementById("inputArtist");
  const inputAlbum = document.getElementById("inputAlbum");
  const inputImage = document.getElementById("inputImage");
  const inputAudio = document.getElementById("inputAudio");
  const btnUploadModal = document.getElementById("btnUpload");

  btnUploadModal.addEventListener("click", async () => {
    const title = inputTitle.value.trim();
    const artist = inputArtist.value.trim();
    const album = inputAlbum.value.trim();
    const imgFile = inputImage.files[0];
    const audioFile = inputAudio.files[0];

    if (!title || !artist || !album || !imgFile || !audioFile) {
      alert("Semua field harus diisi!");
      return;
    }

    await db.add({
      title,
      artist,
      album,
      img: imgFile,
      src: audioFile,
    });

    const songs = await db.getAll();
    await renderSongsTable(songs, player);
    player.updateSongs(songs);

    uploadModal.classList.add("hidden");
    inputTitle.value = "";
    inputArtist.value = "";
    inputAlbum.value = "";
    inputImage.value = "";
    inputAudio.value = "";
  });
}

// Init
async function init() {
  const { db, songs } = await initDB();

  const player = new MusicApp(songs);

  await renderSongsTable(songs, player);

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
}

init();
