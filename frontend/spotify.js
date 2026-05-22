async function init() {

  let tracks;
  try {
    const response = await fetch("http://localhost:3000/tracks");
    if (!response.ok) throw new Error("Server returned " + response.status);
    tracks = await response.json();
  } catch (err) {
    console.error("❌ Could not load tracks:", err);
    document.querySelector(".card-contener").innerHTML =
      `<p style="color:#ff6b6b;padding:1rem;">⚠️ Could not connect to server. Make sure server.js is running on port 3000.</p>`;
    return;
  }

  let currentTrackIndex = 0;
  let isPlaying = false;
  let isShuffle = false;
  let repeatMode = "none";
  let isMuted = false;
  let prevVolume = 1;
  const likedTracks = new Set();

  const playerImg       = document.getElementById("player-img");
  const playerTitle     = document.getElementById("player-title");
  const playerArtist    = document.getElementById("player-artist");
  const playPauseBtn    = document.querySelector(".play-btn");
  const prevBtn         = document.querySelector(".fa-backward-step");
  const nextBtn         = document.querySelector(".fa-forward-step");
  const shuffleBtn      = document.querySelector(".fa-shuffle");
  const repeatBtn       = document.querySelector(".fa-repeat");
  const seekBar         = document.querySelector(".progress-bar input");
  const currentTimeEl   = document.querySelector(".progress-bar span:first-child");
  const totalDurationEl = document.querySelector(".progress-bar span:last-child");
  const volumeBar       = document.getElementById("volume-bar");
  const volumeIcon      = document.querySelector(".fa-volume-high");
  const likeBtn         = document.getElementById("like-btn");
  const cards           = document.querySelectorAll(".card[data-track]");

  const audio = new Audio();
  audio.volume = 0.8;

  function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function loadTrack(index) {
    const track = tracks[index];
    currentTrackIndex = index;

    audio.src = track.audioUrl;
    audio.load();

    playerImg.src = track.image;
    playerTitle.textContent  = track.title;
    playerArtist.textContent = track.artist;

    seekBar.value = 0;
    currentTimeEl.textContent   = "0:00";
    totalDurationEl.textContent = "0:00";

    updateLikeBtn();
    highlightActiveCard(index);
  }

  function playTrack() {
    audio.play().catch(() => {
      console.warn("Autoplay blocked.");
    });
    isPlaying = true;
    playPauseBtn.classList.remove("fa-circle-play");
    playPauseBtn.classList.add("fa-circle-pause");
  }

  function pauseTrack() {
    audio.pause();
    isPlaying = false;
    playPauseBtn.classList.remove("fa-circle-pause");
    playPauseBtn.classList.add("fa-circle-play");
  }

  function loadAndPlay(index) {
    loadTrack(index);
    playTrack();
  }

  function getNextIndex() {
    if (isShuffle) {
      let rand;
      do { rand = Math.floor(Math.random() * tracks.length); }
      while (rand === currentTrackIndex && tracks.length > 1);
      return rand;
    }
    return (currentTrackIndex + 1) % tracks.length;
  }

  function getPrevIndex() {
    if (isShuffle) return getNextIndex();
    return (currentTrackIndex - 1 + tracks.length) % tracks.length;
  }

  function highlightActiveCard(trackIndex) {
    cards.forEach((card) => {
      const idx = parseInt(card.dataset.track, 10);
      card.classList.toggle("active-card", idx === trackIndex);
    });
  }

  function updateLikeBtn() {
    if (likedTracks.has(currentTrackIndex)) {
      likeBtn.classList.remove("fa-regular");
      likeBtn.classList.add("fa-solid");
      likeBtn.style.color = "#1db954";
    } else {
      likeBtn.classList.remove("fa-solid");
      likeBtn.classList.add("fa-regular");
      likeBtn.style.color = "";
    }
  }

  function updateVolumeIcon() {
    volumeIcon.classList.remove("fa-volume-high", "fa-volume-low", "fa-volume-xmark");
    if (audio.volume === 0 || isMuted) {
      volumeIcon.classList.add("fa-volume-xmark");
    } else if (audio.volume < 0.5) {
      volumeIcon.classList.add("fa-volume-low");
    } else {
      volumeIcon.classList.add("fa-volume-high");
    }
  }

  
  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    seekBar.value = (audio.currentTime / audio.duration) * 100;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener("loadedmetadata", () => {
    totalDurationEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("ended", () => {
    if (repeatMode === "one") {
      audio.currentTime = 0;
      playTrack();
    } else if (repeatMode === "all") {
      loadAndPlay(getNextIndex());
    } else {
      if (currentTrackIndex < tracks.length - 1) {
        loadAndPlay(getNextIndex());
      } else {
        pauseTrack();
        loadTrack(0);
      }
    }
  });

  playPauseBtn.addEventListener("click", () => {
    if (isPlaying) pauseTrack();
    else playTrack();
  });

  nextBtn.addEventListener("click", () => loadAndPlay(getNextIndex()));

  prevBtn.addEventListener("click", () => {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
    } else {
      loadAndPlay(getPrevIndex());
    }
  });

  shuffleBtn.addEventListener("click", () => {
    isShuffle = !isShuffle;
    shuffleBtn.style.color   = isShuffle ? "#1db954" : "";
    shuffleBtn.style.opacity = isShuffle ? "1" : "";
  });

  repeatBtn.addEventListener("click", () => {
    const modes = ["none", "one", "all"];
    repeatMode = modes[(modes.indexOf(repeatMode) + 1) % modes.length];

    if (repeatMode === "none") {
      repeatBtn.style.color   = "";
      repeatBtn.style.opacity = "";
      repeatBtn.title = "Repeat: Off";
    } else if (repeatMode === "one") {
      repeatBtn.style.color   = "#1db954";
      repeatBtn.style.opacity = "1";
      repeatBtn.title = "Repeat: One";
    } else {
      repeatBtn.style.color   = "#1db954";
      repeatBtn.style.opacity = "1";
      repeatBtn.title = "Repeat: All";
    }
  });

  seekBar.addEventListener("input", () => {
    if (!audio.duration) return;
    audio.currentTime = (seekBar.value / 100) * audio.duration;
  });

  volumeBar.addEventListener("input", () => {
    audio.volume = parseFloat(volumeBar.value) / 100;
    isMuted = audio.volume === 0;
    updateVolumeIcon();
  });

  volumeIcon.addEventListener("click", () => {
    if (isMuted) {
      audio.volume = prevVolume || 1;
      volumeBar.value = audio.volume * 100;
      isMuted = false;
    } else {
      prevVolume = audio.volume;
      audio.volume = 0;
      volumeBar.value = 0;
      isMuted = true;
    }
    updateVolumeIcon();
  });

  likeBtn.addEventListener("click", () => {
    if (likedTracks.has(currentTrackIndex)) {
      likedTracks.delete(currentTrackIndex);
    } else {
      likedTracks.add(currentTrackIndex);
    }
    updateLikeBtn();
  });

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const trackIndex = parseInt(card.dataset.track, 10);
      loadAndPlay(trackIndex);
    });
  });

  
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT") return;

    switch (e.code) {
      case "Space":
        e.preventDefault(); 
        if (isPlaying) pauseTrack();
        else playTrack();
        break;

      case "ArrowRight":
        e.preventDefault();
        loadAndPlay(getNextIndex());
        break;

      case "ArrowLeft":
        e.preventDefault();
        if (audio.currentTime > 3) {
          audio.currentTime = 0;
        } else {
          loadAndPlay(getPrevIndex());
        }
        break;

      case "KeyM":
        volumeIcon.click(); 
        break;

      case "KeyS":
        shuffleBtn.click();
        break;

      case "KeyR":
        repeatBtn.click();
        break;
    }
  });

  loadTrack(0);
}

init();
