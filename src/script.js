// ID VAR
let slider = document.getElementById("slider");
let song = document.getElementById("song");
let ctrlIcon = document.querySelector("#ctrlIcon i");
let currentTime = document.getElementById("current-time");
let duration = document.getElementById("duration");
let shuffle = document.getElementById("shuffle");
let repeat = document.getElementById("repeat");
let title = document.getElementById("title");
let artist = document.getElementById("artist");
let img = document.getElementById("image");

let isRepeat = false;
let isShuffle = false;
let indexOfSong = 0;

// SONGS DATA
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

title.textContent = songs[0].title;
artist.textContent = songs[0].artist;
song.src = songs[0].src;
img.src = songs[0].img;

function prevSong() {
  indexOfSong--;
  if (indexOfSong < 0) {
    indexOfSong = songs.length - 1;
  }
  console.log(indexOfSong);
  changeSong(indexOfSong);
  playSong();
}

function nextSong() {
  indexOfSong++;
  if (indexOfSong >= songs.length) {
    indexOfSong = 0;
  }
  console.log(indexOfSong);
  changeSong(indexOfSong);
  playSong();
}

function changeSong(index) {
  title.textContent = songs[index].title;
  artist.textContent = songs[index].artist;
  song.src = songs[index].src;
  img.src = songs[index].img;
}

function formatTime(time) {
  let minutes = Math.floor(time / 60);
  let seconds = Math.floor(time % 60);
  if (seconds < 10) seconds = "0" + seconds;
  return minutes + ":" + seconds;
}

slider.oninput = function () {
  song.currentTime = slider.value;
};

song.onloadedmetadata = function () {
  slider.max = song.duration;
  slider.value = song.currentTime;
  duration.textContent = formatTime(song.duration);
};

song.ontimeupdate = function () {
  slider.value = song.currentTime;
  currentTime.textContent = formatTime(song.currentTime);
};

song.onended = function () {
  if (isRepeat) {
    song.currentTime = 0;
    playSong();
  } else if (isShuffle) {
    let random;
    do {
      random = Math.floor(Math.random() * songs.length);
    } while (random === indexOfSong);

    indexOfSong = random;
    changeSong(indexOfSong);
    playSong();
  } else {
    nextSong();
  }
};

function playSong() {
  song.play();
  ctrlIcon.classList.add("fa-pause");
  ctrlIcon.classList.remove("fa-play");
}

function pauseSong() {
  song.pause();
  ctrlIcon.classList.remove("fa-pause");
  ctrlIcon.classList.add("fa-play");
}

function togglePlay() {
  if (song.paused) {
    playSong();
  } else {
    pauseSong();
  }
}

function repeatFunc() {
  isRepeat = !isRepeat;

  if (isRepeat) {
    repeat.classList.add("text-green-400");
    isShuffle = false;
    shuffle.classList.remove("text-green-400");
  } else {
    repeat.classList.remove("text-green-400");
  }
}

function shuffleFunc() {
  isShuffle = !isShuffle;
  if (isShuffle) {
    shuffle.classList.add("text-green-400");
    isRepeat = false;
    repeat.classList.remove("text-green-400");
  } else {
    shuffle.classList.remove("text-green-400");
  }
}
