export default class MusicApp {
  #index = 0;
  #isShuffle = false;
  #repeatMode = "off";
  #shuffleQueue = [];
  #shufflePointer = 0;
  #mute = false;
  #lastVolume = 1;

  constructor(songs) {
    this.songs = songs.map((song) => {
      const src =
        song.src instanceof Blob ? URL.createObjectURL(song.src) : song.src;
      const img =
        song.img instanceof Blob ? URL.createObjectURL(song.img) : song.img;
      return { ...song, src, img };
    });

    this.audio = new Audio();
    this.audio.volume = 1;
    this.currentIndex = 0;

    // DOM Elements
    this.slider = document.querySelectorAll(".slider-song");
    this.sliderVolume = document.querySelector(".slider-volume");
    this.btnVolume = document.querySelector(".btn-volume i");
    this.ctrlIcons = document.querySelectorAll(".btn-play i");
    this.currentTimeEl = document.querySelectorAll(".current-time");
    this.durationEl = document.querySelectorAll(".duration");
    this.btnShuffles = document.querySelectorAll(".btn-shuffle");
    this.btnRepeats = document.querySelectorAll(".btn-repeat");
    this.titleEl = document.querySelectorAll(".title-song");
    this.artistEl = document.querySelectorAll(".artist-song");
    this.imgEl = document.querySelectorAll(".img-song");

    if (this.songs.length > 0) {
      this.loadSong(this.#index);
    }
    this.#toggleMiniPlayer(this.songs.length > 0);
    this.#registerEvents();
  }

  // Public Methods
  play() {
    this.audio.play();
    this.ctrlIcons.forEach((icon) => {
      icon.classList.add("fa-pause");
      icon.classList.remove("fa-play");
    });
  }

  pause() {
    this.audio.pause();
    this.ctrlIcons.forEach((icon) => {
      icon.classList.add("fa-play");
      icon.classList.remove("fa-pause");
    });
  }

  togglePlay() {
    this.audio.paused ? this.play() : this.pause();
  }

  playSong(index) {
    if (index === this.#index) {
      this.#highlightActiveRow();

      if (this.audio.paused) {
        this.play();
      }
      return;
    }

    this.#index = index;

    if (this.#isShuffle) {
      if (this.#shuffleQueue.length !== this.songs.length) {
        this.#buildShuffleQueue(index);
      }
      this.#shufflePointer = this.#shuffleQueue.indexOf(index);
    }

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
    if (this.#repeatMode === "off") this.#repeatMode = "all";
    else if (this.#repeatMode === "all") this.#repeatMode = "one";
    else this.#repeatMode = "off";

    this.btnRepeats.forEach((btn) => {
      const icon = btn.querySelector("i");

      if (this.#repeatMode === "off") {
        btn.classList.remove("text-green-400");
        btn.classList.add("hover:text-white");
        icon.classList.remove("fa-repeat-1");
        icon.classList.add("fa-repeat");
      }

      if (this.#repeatMode === "all") {
        btn.classList.add("text-green-400");
        btn.classList.remove("hover:text-white");
        icon.classList.remove("fa-repeat-1");
        icon.classList.add("fa-repeat");
      }

      if (this.#repeatMode === "one") {
        btn.classList.add("text-green-400");
        btn.classList.remove("hover:text-white");
        icon.classList.remove("fa-repeat");
        icon.classList.add("fa-repeat-1");
      }
    });
  }

  toggleShuffle() {
    this.#isShuffle = !this.#isShuffle;

    this.btnShuffles.forEach((btn) => {
      btn.classList.toggle("text-green-400", this.#isShuffle);
      btn.classList.toggle("hover:text-white", !this.#isShuffle);
    });

    if (this.#isShuffle) {
      this.#buildShuffleQueue(this.#index);
    }
  }

  updateSongs(newSongs) {
    this.songs = newSongs.map((song) => {
      const src =
        song.src instanceof Blob ? URL.createObjectURL(song.src) : song.src;
      const img =
        song.img instanceof Blob ? URL.createObjectURL(song.img) : song.img;
      return { ...song, src, img };
    });

    if (this.songs.length === 0) {
      this.audio.pause();
      this.audio.src = "";
      this.#index = 0;
      this.#toggleMiniPlayer(false);
      return;
    }

    if (this.#index >= this.songs.length) {
      this.#index = this.songs.length - 1;
    }

    this.#toggleMiniPlayer(true);

    if (this.#isShuffle) {
      this.#buildShuffleQueue(this.#index);
    }

    const wasPlaying = !this.audio.paused;
    this.loadSong(this.#index);
    if (wasPlaying) this.play();
  }

  loadSong(index) {
    if (!this.songs.length) return;

    const songData = this.songs[index];
    if (!songData) return;

    this.titleEl.forEach((el) => (el.textContent = songData.title));
    this.artistEl.forEach((el) => (el.textContent = songData.artist));
    this.imgEl.forEach((el) => (el.src = songData.img));

    this.audio.src = songData.src;
    this.#highlightActiveRow();
  }

  handleSongDeletion(deletedIndex) {
    if (this.songs.length === 0) {
      this.audio.pause();
      this.audio.src = "";
      this.#index = 0;
      this.#highlightActiveRow();
      this.#toggleMiniPlayer(false);
      return;
    }

    if (deletedIndex === this.#index) {
      this.audio.pause();

      if (deletedIndex < this.songs.length) {
        this.#index = deletedIndex;
      } else {
        this.#index = this.songs.length - 1;
      }

      this.loadSong(this.#index);
      this.play();
      return;
    }

    if (deletedIndex < this.#index) {
      this.#index--;
    }

    this.#highlightActiveRow();
  }

  // Private Methods
  #formatTime(time) {
    const minutes = Math.floor(time / 60);
    let seconds = Math.floor(time % 60);
    if (seconds < 10) seconds = "0" + seconds;
    return `${minutes}:${seconds}`;
  }

  #toggleMiniPlayer(show) {
    const mini = document.getElementById("miniPlayer");
    if (!mini) return;

    if (show) {
      mini.classList.remove(
        "translate-y-full",
        "opacity-0",
        "pointer-events-none",
      );
      mini.classList.add("translate-y-0", "opacity-100");
    } else {
      mini.classList.add(
        "translate-y-full",
        "opacity-0",
        "pointer-events-none",
      );
      mini.classList.remove("translate-y-0", "opacity-100");
    }
  }

  #buildShuffleQueue(startIndex = 0) {
    this.#shuffleQueue = this.songs.map((_, i) => i);

    for (let i = this.#shuffleQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.#shuffleQueue[i], this.#shuffleQueue[j]] = [
        this.#shuffleQueue[j],
        this.#shuffleQueue[i],
      ];
    }

    this.#shufflePointer = this.#shuffleQueue.indexOf(startIndex);
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
    // ----- Repeat One ------
    if (this.#repeatMode === "one") {
      this.audio.currentTime = 0;
      this.play();
      return;
    }

    // ----- Shuffle Mode -----
    if (this.#isShuffle) {
      this.#shufflePointer++;

      // Semua lagu sudah diputar
      if (this.#shufflePointer >= this.#shuffleQueue.length) {
        // Shuffle saja -> berhenti
        if (this.#repeatMode === "off") {
          this.pause();
          return;
        }

        // Shuffle + repeat all -> bikin queue baru
        if (this.#repeatMode === "all") {
          this.#buildShuffleQueue();
          this.#index = this.#shuffleQueue[0];
          this.loadSong(this.#index);
          this.play();
          return;
        }
      }

      this.#index = this.#shuffleQueue[this.#shufflePointer];
      this.loadSong(this.#index);
      this.play();
      return;
    }

    // ----- No Shuffle -----
    this.#index++;

    if (this.#index >= this.songs.length) {
      // Repeat all -> balik ke awal
      if (this.#repeatMode === "all") {
        this.#index = 0;
        this.loadSong(this.#index);
        this.play();
        return;
      }

      // Tidak ada repeat -> berhenti
      this.pause();
      return;
    }

    this.loadSong(this.#index);
    this.play();
  }

  #updateSlider() {
    this.slider.forEach((slider) => {
      slider.value = this.audio.currentTime;
      this.#updateSliderBackground(slider);
    });

    this.currentTimeEl.forEach((el) => {
      el.textContent = this.#formatTime(this.audio.currentTime);
    });
  }

  #updateVolumeBackground(slider) {
    const percent = slider.value * 100; // karena max = 1
    slider.style.background = `linear-gradient(to right, #22c55e ${percent}%, #444 ${percent}%)`;
  }

  #setVolume(e) {
    const slider = e.target;
    const value = parseFloat(slider.value);

    this.audio.volume = value;
    this.#mute = value === 0;

    this.#updateVolumeBackground(slider);
    this.#updateVolumeIcon();
  }

  #updateVolumeIcon() {
    const v = this.audio.volume;

    this.btnVolume.classList.remove(
      "fa-volume-high",
      "fa-volume",
      "fa-volume-low",
      "fa-volume-xmark",
    );

    if (v === 0) {
      this.btnVolume.classList.add("fa-volume-xmark");
    } else if (v < 0.25) {
      this.btnVolume.classList.add("fa-volume-low");
    } else if (v < 0.75) {
      this.btnVolume.classList.add("fa-volume");
    } else {
      this.btnVolume.classList.add("fa-volume-high");
    }
  }

  #toggleMute() {
    if (!this.#mute) {
      this.#lastVolume = this.audio.volume;
      this.audio.volume = 0;
      this.sliderVolume.value = 0;
      this.#mute = true;
    } else {
      this.audio.volume = this.#lastVolume || 1;
      this.sliderVolume.value = this.audio.volume;
      this.#mute = false;
    }

    this.#updateVolumeBackground(this.sliderVolume);
    this.#updateVolumeIcon();
  }

  #updateSliderBackground(slider) {
    const percent = (slider.value / slider.max) * 100;
    slider.style.background = `linear-gradient(to right, #22c55e ${percent}%, #444 ${percent}%)`;
  }

  #setDuration() {
    this.slider.forEach((slider) => {
      slider.max = this.audio.duration;
      this.#updateSliderBackground(slider);
    });

    this.durationEl.forEach((el) => {
      el.textContent = this.#formatTime(this.audio.duration);
    });
  }

  #seek(e) {
    const slider = e.target;
    this.audio.currentTime = slider.value;
    this.#updateSliderBackground(slider);
  }

  #registerEvents() {
    this.slider.forEach((slider) => {
      slider.addEventListener("input", (e) => this.#seek(e));
    });
    this.btnVolume.parentElement.addEventListener("click", () =>
      this.#toggleMute(),
    );
    this.audio.addEventListener("volumechange", () => this.#updateVolumeIcon());
    this.#updateVolumeIcon();
    this.#updateVolumeBackground(this.sliderVolume);
    this.sliderVolume.addEventListener("input", (e) => this.#setVolume(e));
    this.audio.addEventListener("timeupdate", () => this.#updateSlider());
    this.audio.addEventListener("loadedmetadata", () => this.#setDuration());
    this.audio.addEventListener("ended", () => this.#handleSongEnd());
  }
}
