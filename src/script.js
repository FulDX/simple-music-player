import MusicApp from "./MusicApp.js";
import localDB from "./localDB.js";

const songs = [
  {
    title: "時の傷痕 ハジマリノ 鼓動",
    artist: "Yasunori Mitsuda",
    album: "Chrono Trigger",
    src: "../media/mp3/ndak tawu.mp3",
    img: "../media/img/1.jpg",
  },
  {
    title: "Mimpi Buruk",
    artist: "Lil Salmonella",
    album: "Lil Salmonella",
    src: "../media/mp3/Lil Salmonela - Mimpi Buruk.mp3",
    img: "../media/img/mimpiburuk.jpg",
  },
  {
    title: "Odorouze",
    artist: "Yorushika",
    album: "Yorushika",
    src: "../media/mp3/odorouze.mp3",
    img: "../media/img/odorouze.jpg",
  },
  {
    title: "Nandemonaiya",
    artist: "RADWIMPS",
    album: "RADWIMPS",
    src: "../media/mp3/Nandemonaiya.mp3",
    img: "../media/img/radwimps.jpg",
  },
];

const player = new MusicApp(songs);

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
  .forEach((btn) => btn.addEventListener("click", () => player.toggleRepeat()));

document
  .querySelectorAll(".btn-shuffle")
  .forEach((btn) =>
    btn.addEventListener("click", () => player.toggleShuffle()),
  );

function getAudioDuration(src) {
  return new Promise((resolve) => {
    const audio = new Audio(src);
    audio.addEventListener("loadedmetadata", () => {
      const minutes = Math.floor(audio.duration / 60);
      let seconds = Math.floor(audio.duration % 60);
      if (seconds < 10) seconds = "0" + seconds;
      resolve(`${minutes}:${seconds}`);
    });
  });
}

const tbody = document.getElementById("tableBody");
const template = document.getElementById("rowTemplate");

const durations = await Promise.all(songs.map((s) => getAudioDuration(s.src)));

songs.forEach((song, i) => {
  const clone = template.content.cloneNode(true);
  const row = clone.querySelector(".row-song");
  row.dataset.index = i;

  clone.querySelector(".index-table").textContent = i + 1;
  clone.querySelector(".img-table").src = song.img;
  clone.querySelector(".title-table").textContent = song.title;
  clone.querySelector(".artist-table").textContent = song.artist;
  clone.querySelector(".album-table").textContent = song.album;
  clone.querySelector(".duration-table").textContent = durations[i];

  tbody.appendChild(clone);
});

tbody.addEventListener("click", (e) => {
  if (e.target.closest(".btn-more")) return;

  const row = e.target.closest(".row-song");
  if (!row) return;

  const index = row.dataset.index;
  player.playSong(index);
});
