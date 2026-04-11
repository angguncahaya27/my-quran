import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [surah, setSurah] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [ayat, setAyat] = useState([]);
  const [search, setSearch] = useState("");
  const [showScroll, setShowScroll] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tafsirData, setTafsirData] = useState([]);
  const [openTafsir, setOpenTafsir] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const rekomendasiIds = [36, 18, 55, 67, 56];

  useEffect(() => {
    fetch("https://equran.id/api/v2/surat")
      .then((res) => res.json())
      .then((data) => setSurah(data.data));

    const saved = localStorage.getItem("favorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 150);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ================= AUDIO =================

  const playAudio = (url) => {
    if (!url) return;

    if (currentAudio && currentAudio.src === url) {
      if (isPlaying) {
        currentAudio.pause();
        setIsPlaying(false);
      } else {
        currentAudio.play();
        setIsPlaying(true);
      }
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const audio = new Audio(url);
    audio.play();

    setCurrentAudio(audio);
    setIsPlaying(true);

    audio.onended = () => setIsPlaying(false);
  };

  // 🔥 STOP AUDIO (NEW)
  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlaying(false);
    }
  };

  // ================= API =================

  const handleClick = (nomor) => {
    fetch(`https://equran.id/api/v2/surat/${nomor}`)
      .then((res) => res.json())
      .then((data) => {
        setSelectedSurah(data.data);
        setAyat(data.data.ayat);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

    fetch(`https://equran.id/api/v2/tafsir/${nomor}`)
      .then((res) => res.json())
      .then((data) => {
        setTafsirData(data.data.tafsir);
      });
  };

  const toggleFavorite = (nomor) => {
    let updated;

    if (favorites.includes(nomor)) {
      updated = favorites.filter((f) => f !== nomor);
    } else {
      updated = [...favorites, nomor];
    }

    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredSurah = surah.filter((s) =>
    s.namaLatin.toLowerCase().includes(search.toLowerCase())
  );

  const rekomendasiSurah = surah.filter((s) =>
    rekomendasiIds.includes(s.nomor)
  );

  const favoriteSurah = surah.filter((s) =>
    favorites.includes(s.nomor)
  );

  return (
    <div className="container">

      {/* ================= LIST VIEW ================= */}
      {!selectedSurah && (
        <>
          <h1 className="title">🌿 Al-Qur'an Digital</h1>

          <input
            className="search"
            type="text"
            placeholder="Cari surat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* FAVORIT */}
          {favoriteSurah.length > 0 && (
            <>
              <h2 className="sectionTitle">❤️ Favorit</h2>
              <div className="list">
                {favoriteSurah.map((s) => (
                  <div key={s.nomor} className="surahItem">
                    <div
                      className="left"
                      onClick={() => handleClick(s.nomor)}
                    >
                      <div className="number">{s.nomor}</div>
                      <div>
                        <h3>{s.namaLatin}</h3>
                        <p className="arti">{s.arti}</p>
                      </div>
                    </div>

                    <button
                      className="favBtn active"
                      onClick={() => toggleFavorite(s.nomor)}
                    >
                      ❤️
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* REKOMENDASI */}
          <h2 className="sectionTitle">📚 Rekomendasi</h2>
          <div className="horizontalScroll">
            {rekomendasiSurah.map((s) => (
              <div
                key={s.nomor}
                className="rekomCard"
                onClick={() => handleClick(s.nomor)}
              >
                <h3>{s.namaLatin}</h3>
                <p className="arab">{s.nama}</p>
                <small>{s.jumlahAyat} ayat</small>
              </div>
            ))}
          </div>

          {/* LIST */}
          <div className="list">
            {filteredSurah.map((s) => (
              <div
                key={s.nomor}
                className="surahItem"
                onClick={() => handleClick(s.nomor)}
              >
                <div className="left">
                  <div className="number">{s.nomor}</div>
                  <div>
                    <h3>{s.namaLatin}</h3>
                    <p className="arti">{s.arti}</p>
                  </div>
                </div>

                <div className="right">
                  <p className="arab">{s.nama}</p>
                  <small>{s.jumlahAyat} ayat</small>
                </div>

                <button
                  className={`favBtn ${
                    favorites.includes(s.nomor) ? "active" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(s.nomor);
                  }}
                >
                  ❤️
                </button>
              </div>
            ))}
          </div>
        </>
      )}

  {/* ================= DETAIL VIEW ================= */}
{selectedSurah && (
  <div className="detail">

    {/* STICKY HEADER */}
    <div className="stickyHeader">
      <button
        className="backBtn"
        onClick={() => setSelectedSurah(null)}
      >
        ← Kembali
      </button>

      <p className="arabMini">{selectedSurah.nama}</p>
    </div>

    {/* HEADER */}
          <div className="detailHeader">
             <h2 className="latinTitle">{selectedSurah.namaLatin}</h2>
             <h2 className="arabTitle">{selectedSurah.nama}</h2>

            <p className="subInfo">
           {selectedSurah.arti} • {selectedSurah.jumlahAyat} ayat
         </p>

  {/* 🔥 AUDIO CONTROL */}
         <div className="audioControls">
            <button
              className="audioBtn"
              onClick={() => playAudio(selectedSurah.audioFull["05"])}
              disabled={!selectedSurah.audioFull["05"]}>
             {currentAudio?.src === selectedSurah.audioFull["05"] && isPlaying
               ? "⏸ Pause"
              : "▶️ Play"}
           </button>

            <button
               className="stopBtn"
               onClick={stopAudio}
               disabled={!currentAudio}
               >
              ⏹ Stop
            </button>
          </div>

  {/* 🔥 DESKRIPSI SURAT (PINDAH KE SINI) */}
                 <p
                className="surahDesc"
                dangerouslySetInnerHTML={{
                __html: selectedSurah.deskripsi,
              }}
            ></p>
          </div>
  

          {/* AYAT */}
          <div className="ayatList">
            {ayat.map((a) => (
              <div key={a.nomorAyat} className="ayatCard">
                <div className="ayatNumber">{a.nomorAyat}</div>

                <button
                  className="ayatAudioBtn"
                  onClick={() => playAudio(a.audio["05"])}
                >
                  {currentAudio?.src === a.audio["05"] && isPlaying
                    ? "⏸"
                    : "🔊"}
                </button>

                <button
                  className="tafsirBtn"
                  onClick={() =>
                    setOpenTafsir(
                      openTafsir === a.nomorAyat ? null : a.nomorAyat
                    )
                  }
                >
                  📖 Tafsir
                </button>

                <p className="arabText">{a.teksArab}</p>
                <p className="latinText">{a.teksLatin}</p>
                <p className="indoText">{a.teksIndonesia}</p>

                {openTafsir === a.nomorAyat && (
                  <div className="tafsirBox">
                    {
                      tafsirData.find((t) => t.ayat === a.nomorAyat)?.teks ||
                      "Tafsir tidak tersedia"
                    }
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SCROLL */}
      {showScroll && (
        <button className="scrollTopBtn" onClick={scrollToTop}>
          ↑
        </button>
      )}
    </div>
  );
}

export default App;