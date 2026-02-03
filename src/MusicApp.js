export default class MusicApp {
  #index = 0;
  #isRepeat = false;
  #isShuffle = false;

  constructor(songs) {
    this.songs = songs;
    this.slider = document.querySelectorAll(".slider-song");
    this.song = document.getElementById("song");
    this.ctrlIcons = document.querySelectorAll(".btn-play i");
    this.currentTimeEl = document.querySelectorAll(".current-time");
    this.durationEl = document.querySelectorAll(".duration");
    this.btnShuffles = document.querySelectorAll(".btn-shuffle");
    this.btnRepeats = document.querySelectorAll(".btn-repeat");
    this.titleEl = document.querySelectorAll(".title-song");
    this.artistEl = document.querySelectorAll(".artist-song");
    this.imgEl = document.querySelectorAll(".img-song");

    this.loadSong(this.#index);
    this.#registerEvents();
  }

  // Public Methods
  play() {
    this.song.play();
    this.ctrlIcons.forEach((icon) => {
      icon.classList.add("fa-pause");
      icon.classList.remove("fa-play");
    });
  }

  pause() {
    this.song.pause();
    this.ctrlIcons.forEach((icon) => {
      icon.classList.add("fa-play");
      icon.classList.remove("fa-pause");
    });
  }

  togglePlay() {
    this.song.paused ? this.play() : this.pause();
  }

  playSong(index) {
    this.#index = index;
    this.loadSong(index);
    this.play();
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

    this.btnRepeats.forEach((btn) => {
      btn.classList.toggle("text-green-400", this.#isRepeat);
      btn.classList.toggle("hover:text-white", !this.#isRepeat);
    });

    if (this.#isRepeat) {
      this.#isShuffle = false;
      this.btnShuffles.forEach((btn) => {
        btn.classList.remove("text-green-400");
        btn.classList.add("hover:text-white");
      });
    }
  }

  toggleShuffle() {
    this.#isShuffle = !this.#isShuffle;

    this.btnShuffles.forEach((btn) => {
      btn.classList.toggle("text-green-400", this.#isShuffle);
      btn.classList.toggle("hover:text-white", !this.#isShuffle);
    });

    if (this.#isShuffle) {
      this.#isRepeat = false;
      this.btnRepeats.forEach((btn) => {
        btn.classList.remove("text-green-400");
        btn.classList.add("hover:text-white");
      });
    }
  }

  loadSong(index) {
    const songData = this.songs[index];

    this.titleEl.forEach((el) => (el.textContent = songData.title));
    this.artistEl.forEach((el) => (el.textContent = songData.artist));
    this.imgEl.forEach((el) => (el.src = songData.img));

    this.song.src = songData.src;

    this.#highlightActiveRow(); 
  }

  // Private Methods
  #formatTime(time) {
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time % 60);
    if (seconds < 10) seconds = "0" + seconds;
    return minutes + ":" + seconds;
  }

  #highlightActiveRow() {
    document.querySelectorAll(".row-song").forEach((row) => {
      row.classList.remove("bg-green-400/20");
      row.classList.add("hover:bg-green-400/10");
    });

    const activeRow = document.querySelector(
      `.row-song[data-index="${this.#index}"]`,
    );
    if (activeRow) {
      activeRow.classList.remove("hover:bg-green-400/10");
      activeRow.classList.add("bg-green-400/20");
    }
  }

  #handleSongEnd() {
    if (this.#isRepeat) {
      this.song.currentTime = 0;
      this.play();
    } else if (this.#isShuffle) {
      let random;
      do {
        random = Math.floor(Math.random() * this.songs.length);
      } while (random === this.#index);
      this.#index = random;
      this.loadSong(this.#index);
      this.play();
    } else {
      this.next();
    }
  }

  #updateSlider() {
    this.slider.forEach((slider) => {
      slider.value = this.song.currentTime;
      this.#updateSliderBackground(slider);
    });

    this.currentTimeEl.forEach((el) => {
      el.textContent = this.#formatTime(this.song.currentTime);
    });
  }

  #updateSliderBackground(slider) {
    const percent = (slider.value / slider.max) * 100;
    slider.style.background = `linear-gradient(to right, #22c55e ${percent}%, #444 ${percent}%)`;
  }

  #setDuration() {
    this.slider.forEach((slider) => {
      slider.max = this.song.duration;
      this.#updateSliderBackground(slider);
    });

    this.durationEl.forEach((el) => {
      el.textContent = this.#formatTime(this.song.duration);
    });
  }

  #seek(e) {
    const slider = e.target;
    this.song.currentTime = slider.value;
    this.#updateSliderBackground(slider);
  }

  #registerEvents() {
    this.slider.forEach((slider) => {
      slider.addEventListener("input", (e) => this.#seek(e));
    });
    this.song.addEventListener("timeupdate", () => this.#updateSlider());
    this.song.addEventListener("loadedmetadata", () => this.#setDuration());
    this.song.addEventListener("ended", () => this.#handleSongEnd());
  }
}
