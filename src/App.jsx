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

  // ✅ TAMBAHAN AUDIO STATE
  

  useEffect(() => {
    fetch("https://equran.id/api/v2/surat")
      .then((res) => res.json())
      .then((data) => setSurah(data.data));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 150);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ TAMBAHAN FUNCTION AUDIO
  const playAudio = (url) => {
  if (!url) return;

  // kalau audio sama → toggle pause/play
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

  // stop audio sebelumnya
  if (currentAudio) {
    currentAudio.pause();
  }

  const audio = new Audio(url);
  audio.play();

  setCurrentAudio(audio);
  setIsPlaying(true);

  audio.onended = () => {
    setIsPlaying(false);
  };
};

  const handleClick = (nomor) => {
    fetch(`https://equran.id/api/v2/surat/${nomor}`)
      .then((res) => res.json())
      .then((data) => {
        setSelectedSurah(data.data);
        setAyat(data.data.ayat);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredSurah = surah.filter((s) =>
    s.namaLatin.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">

      {/* LIST VIEW */}
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
            <div className="stickyContent">
              <button
                className="backBtn"
                onClick={() => setSelectedSurah(null)}
              >
                ← Kembali ke daftar
              </button>

              <div className="stickySurah">
                <h3>{selectedSurah.namaLatin}</h3>
                <span className="arabMini">{selectedSurah.nama}</span>
              </div>
            </div>
          </div>

          {/* INFO SURAH */}
          <div className="detailHeader">
            <h2>{selectedSurah.namaLatin}</h2>
            <h2 className="arabTitle">{selectedSurah.nama}</h2>
            <p><strong>Arti:</strong> {selectedSurah.arti}</p>
            <p><strong>Jumlah Ayat:</strong> {selectedSurah.jumlahAyat}</p>

            {/* ✅ AUDIO FULL SURAH */}
            <button
              className="audioBtn"
              onClick={() => playAudio(selectedSurah.audioFull["05"])}
            >
            {currentAudio?.src === selectedSurah.audioFull["05"] && isPlaying
                   ? "⏸ Pause Surah"
                   : "▶️ Putar Surah"}
              </button>

            <p
              className="deskripsi"
              dangerouslySetInnerHTML={{ __html: selectedSurah.deskripsi }}
            />
          </div>

          {/* AYAT */}
          <div className="ayatList">
            {ayat.map((a) => (
              <div key={a.nomorAyat} className="ayatCard">
                <div className="ayatNumber">{a.nomorAyat}</div>

                {/*  AUDIO PER AYAT */}
                <button
                   className="ayatAudioBtn"
                   onClick={() => playAudio(a.audio["05"])}
                >
                  {currentAudio?.src === a.audio["05"] && isPlaying ? "⏸" : "🔊"}
                </button>

                <p className="arabText">{a.teksArab}</p>

                <p className="latinText">
                  {a.teksLatin || "Latin tidak tersedia"}
                </p>

                <p className="indoText">{a.teksIndonesia}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SCROLL TO TOP BUTTON */}
      {showScroll && (
        <button className="scrollTopBtn" onClick={scrollToTop}>
          ↑
        </button>
      )}
    </div>
  );
}

export default App;