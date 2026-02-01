export default class MusicApp {
  #index = 0;
  #isRepeat = false;
  #isShuffle = false;

  constructor(songs) {
    this.songs = songs;
    this.slider = document.getElementById("slider");
    this.song = document.getElementById("song");
    this.ctrlIcon = document.querySelector("#btnCtrl i");
    this.currentTimeEl = document.getElementById("current-time");
    this.durationEl = document.getElementById("duration");
    this.btnShuffle = document.getElementById("btnShuffle");
    this.btnRepeat = document.getElementById("btnRepeat");
    this.titleEl = document.getElementById("title");
    this.artistEl = document.getElementById("artist");
    this.imgEl = document.getElementById("image");

    this.loadSong(this.#index);
    this.#registerEvents();
  }

  // Public Methods
  play() {
    this.song.play();
    this.ctrlIcon.classList.add("fa-pause");
    this.ctrlIcon.classList.remove("fa-play");
  }

  pause() {
    this.song.pause();
    this.ctrlIcon.classList.add("fa-play");
    this.ctrlIcon.classList.remove("fa-pause");
  }

  togglePlay() {
    this.song.paused ? this.play() : this.pause();
  }

  next() {
    this.#index = (this.#index + 1) % this.songs.length;
    this.loadSong(this.#index);
    this.play();
  }

  prev() {
    this.#index = (this.#index - 1 + this.songs.length) % this.songs.length;
    this.loadSong(this.#index);
    this.play();
  }

  toggleRepeat() {
    this.#isRepeat = !this.#isRepeat;
    this.btnRepeat.classList.toggle("text-green-400", this.#isRepeat);

    if (this.#isRepeat) {
      this.#isShuffle = false;
      this.btnShuffle.classList.remove("text-green-400");
    }
  }

  toggleShuffle() {
    this.#isShuffle = !this.#isShuffle;
    this.btnShuffle.classList.toggle("text-green-400", this.#isShuffle);

    if (this.#isShuffle) {
      this.#isRepeat = false;
      this.btnRepeat.classList.remove("text-green-400");
    }
  }

  loadSong(index) {
    const songData = this.songs[index];
    this.titleEl.textContent = songData.title;
    this.artistEl.textContent = songData.artist;
    this.song.src = songData.src;
    this.imgEl.src = songData.img;
  }

  // Private Methods
  #formatTime(time) {
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time % 60);
    if (seconds < 10) seconds = "0" + seconds;
    return minutes + ":" + seconds;
  }

  #handleSongEnd() {
    if (this.#isRepeat) {
      this.song.currentTime = 0;
      this.play();
    } else if (this.#isShuffle) {
      let random;
      do {
        random = Math.floor(Math.random() * songs.length);
      } while (random === this.#index);
      this.#index = random;
      this.loadSong(this.#index);
      this.play();
    } else {
        this.next();
    }
  }

  #updateSlider() {
    this.slider.value = this.song.currentTime;
    this.currentTimeEl.textContent = this.#formatTime(this.song.currentTime);
  }

  #setDuration() {
    this.slider.max = this.song.duration;
    this.durationEl.textContent = this.#formatTime(this.song.duration);
  }

  #seek() {
    this.song.currentTime = this.slider.value;
  }

  #registerEvents() {
    this.slider.addEventListener("input", () => this.#seek());
    this.song.addEventListener("timeupdate", () => this.#updateSlider());
    this.song.addEventListener("loadedmetadata", () => this.#setDuration());
    this.song.addEventListener("ended", () => this.#handleSongEnd());
  }
}