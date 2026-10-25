import { useEffect, useState } from "react";
import "./App.css";

type Film = {
  id: number;
  title: string;
  year: number;
  overview: string;
};

function App() {
  const [films, setFilms] = useState<Film[]>([]);
  const [recherche, setRecherche] = useState("");
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [titre, setTitre] = useState("");
  const [annee, setAnnee] = useState("");
  const [erreurAjout, setErreurAjout] = useState("");

  useEffect(() => {
    fetch("/api/films")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}`);
        }
        return response.json() as Promise<Film[]>;
      })
      .then(setFilms)
      .catch(() => setErreur("Impossible de charger les films. Vérifie que le serveur fonctionne."))
      .finally(() => setChargement(false));
  }, []);

  const filmsFiltres = films.filter((film) =>
    film.title.toLowerCase().includes(recherche.toLowerCase()),
  );

  if (chargement) return <p>Chargement des films…</p>;
  if (erreur) return <p>{erreur}</p>;

  async function ajouterFilm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErreurAjout("");

    try {
      const response = await fetch("/api/films", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: titre, year: Number(annee) }),
      });

      const nouveauFilm = await response.json();

      if (!response.ok) {
        setErreurAjout(nouveauFilm.error ?? "Impossible d’ajouter le film.");
        return;
      }

      setFilms((filmsActuels) => [...filmsActuels, nouveauFilm as Film]);
      setTitre("");
      setAnnee("");
      setRecherche("");
    } catch {
      setErreurAjout("Le serveur ne répond pas. Vérifie qu’il est démarré.");
    }
  }

  return (
    <main>
      <h1>TD 10 — React lit ton API</h1>
      <form onSubmit={ajouterFilm}>
        <label htmlFor="titre-film">Titre</label>
        <input
          id="titre-film"
          value={titre}
          onChange={(event) => setTitre(event.target.value)}
          required
        />

        <label htmlFor="annee-film">Année</label>
        <input
          id="annee-film"
          type="number"
          min="1888"
          max="2030"
          step="1"
          value={annee}
          onChange={(event) => setAnnee(event.target.value)}
          required
        />

        <button type="submit">Ajouter le film</button>
        {erreurAjout && <p role="alert">{erreurAjout}</p>}
      </form>
      <label htmlFor="recherche">Rechercher un film</label>
      <br />
      <input
        id="recherche"
        value={recherche}
        onChange={(event) => setRecherche(event.target.value)}
      />

      <p>{filmsFiltres.length} film(s)</p>

      <div className="grille-films">
        {filmsFiltres.map((film) => (
          <article key={film.id}>
            <h2>{film.title}</h2>
            <p>{film.year}</p>
            <p>{film.overview}</p>
          </article>
        ))}
      </div>
    </main>
  );
}

export default App;