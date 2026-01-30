let slider = document.getElementById("slider");
let song = document.getElementById("song");
let ctrlIcon = document.querySelector("#ctrlIcon i");
let currentTime = document.getElementById("current-time");
let duration = document.getElementById("duration");
let repeat = document.getElementById("repeat");
let isRepeat = false;

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
  if (song.currentTime == song.duration) {
    if (isRepeat) {
      song.currentTime = 0;
      song.play();
    } else {
      playPause();
    }
  }
};

if (song.play()) {
  setInterval(() => {
    slider.value = song.currentTime;
  }, 500);
}

const repeatFunc = () => {
  if (repeat.classList.contains("text-green-400")) {
    isRepeat = false;
    repeat.classList.remove("text-green-400");
  } else {
    isRepeat = true;
    repeat.classList.add("text-green-400");
  }
};

const playPause = () => {
  if (ctrlIcon.classList.contains("fa-pause")) {
    song.pause();
    ctrlIcon.classList.remove("fa-pause");
    ctrlIcon.classList.add("fa-play");
  } else {
    song.play();
    ctrlIcon.classList.add("fa-pause");
    ctrlIcon.classList.remove("fa-play");
  }
};
