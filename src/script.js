import MusicApp from "./MusicApp.js";
import localDB from "./localDB.js";

const songs = [
  {
    title: "時の傷痕 ハジマリノ 鼓動",
    artist: "Yasunori Mitsuda",
    src: "../media/mp3/ndak tawu.mp3",
    img: "../media/img/1.jpg",
  },
  {
    title: "Mimpi Buruk",
    artist: "Lil Salmonella",
    src: "../media/mp3/Lil Salmonela - Mimpi Buruk.mp3",
    img: "../media/img/mimpiburuk.jpg",
  },
  {
    title: "Odorouze",
    artist: "Yorushika",
    src: "../media/mp3/odorouze.mp3",
    img: "../media/img/odorouze.jpg",
  },
  {
    title: "Nandemonaiya",
    artist: "RADWIMPS",
    src: "../media/mp3/Nandemonaiya.mp3",
    img: "../media/img/radwimps.jpg",
  },
];

const player = new MusicApp(songs);

document.getElementById("btnCtrl").addEventListener("click", () => player.togglePlay());
document.getElementById("btnNext").addEventListener("click", () => player.next());
document.getElementById("btnPrev").addEventListener("click", () => player.prev());
document.getElementById("btnRepeat").addEventListener("click", () => player.toggleRepeat());
document.getElementById("btnShuffle").addEventListener("click", () => player.toggleShuffle());