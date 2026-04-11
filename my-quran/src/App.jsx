import { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
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

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlaying(false);
    }
  };

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
    <div className="container py-4">

      {!selectedSurah && (
        <>
          <h1 className="text-center mb-4">🌿 Al-Qur'an Digital</h1>

          <input
            className="form-control mb-4"
            type="text"
            placeholder="Cari surat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* FAVORIT */}
          {favoriteSurah.length > 0 && (
            <>
              <h4>❤️ Favorit</h4>
              <div className="row">
                {favoriteSurah.map((s) => (
                  <div key={s.nomor} className="col-md-6 mb-3">
                    <div className="card p-3 d-flex justify-content-between flex-row align-items-center">
                      <div onClick={() => handleClick(s.nomor)}>
                        <h5>{s.namaLatin}</h5>
                        <small>{s.arti}</small>
                      </div>
                      <button
                        className="btn btn-danger"
                        onClick={() => toggleFavorite(s.nomor)}
                      >
                        ❤️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* REKOMENDASI */}
          <h4 className="mt-4">📚 Rekomendasi</h4>
          <div className="row">
            {rekomendasiSurah.map((s) => (
              <div key={s.nomor} className="col-md-4 mb-3">
                <div
                  className="card p-3 text-center"
                  onClick={() => handleClick(s.nomor)}
                >
                  <h5>{s.namaLatin}</h5>
                  <p>{s.nama}</p>
                </div>
              </div>
            ))}
          </div>

          {/* LIST */}
          <div className="row">
            {filteredSurah.map((s) => (
              <div key={s.nomor} className="col-md-6 mb-3">
                <div
                  className="card p-3"
                  onClick={() => handleClick(s.nomor)}
                >
                  <div className="d-flex justify-content-between">
                    <div>
                      <h5>{s.namaLatin}</h5>
                      <small>{s.arti}</small>
                    </div>
                    <button
                      className={`btn ${
                        favorites.includes(s.nomor)
                          ? "btn-danger"
                          : "btn-outline-danger"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(s.nomor);
                      }}
                    >
                      ❤️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* DETAIL */}
      {selectedSurah && (
        <div>
          <button
            className="btn btn-secondary mb-3"
            onClick={() => setSelectedSurah(null)}
          >
            ← Kembali
          </button>

          <h2>{selectedSurah.namaLatin}</h2>
          <h3>{selectedSurah.nama}</h3>
          <p>{selectedSurah.arti}</p>

          <div className="mb-3">
            <button
              className="btn btn-primary me-2"
              onClick={() => playAudio(selectedSurah.audioFull["05"])}
            >
              ▶️ Play
            </button>

            <button className="btn btn-danger" onClick={stopAudio}>
              ⏹ Stop
            </button>
          </div>

          <div
            className="mb-4"
            dangerouslySetInnerHTML={{
              __html: selectedSurah.deskripsi,
            }}
          ></div>

          {ayat.map((a) => (
            <div key={a.nomorAyat} className="card mb-3 p-3">
              <div className="d-flex justify-content-between">
                <strong>{a.nomorAyat}</strong>
                <div>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => playAudio(a.audio["05"])}
                  >
                    🔊
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() =>
                      setOpenTafsir(
                        openTafsir === a.nomorAyat ? null : a.nomorAyat
                      )
                    }
                  >
                    Tafsir
                  </button>
                </div>
              </div>

              <p className="mt-3 text-end">{a.teksArab}</p>
              <p>{a.teksLatin}</p>
              <p>{a.teksIndonesia}</p>

              {openTafsir === a.nomorAyat && (
                <div className="alert alert-info">
                  {
                    tafsirData.find((t) => t.ayat === a.nomorAyat)?.teks ||
                    "Tafsir tidak tersedia"
                  }
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showScroll && (
        <button
          className="btn btn-primary position-fixed bottom-0 end-0 m-4"
          onClick={scrollToTop}
        >
          ↑
        </button>
      )}
    </div>
  );
}

export default App;