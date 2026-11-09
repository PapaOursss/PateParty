type Film = {
  titre: string;
  annee: number;
  resume: string;
  couleurAffiche: string;
  genre: string;
};

const film: Film = {
  titre: "Dernier métro pour Mars",
  annee: 2026,
  resume: "Une conductrice découvre une station absente de tous les plans.",
  couleurAffiche: "#6b4a7a",
  genre: "Au cinéma",
};

export default function FicheFilm() {
  const estNouveau = film.annee >= 2025;

  return (
    <article className="fiche">
      <div className="affiche" style={{ backgroundColor: film.couleurAffiche }}>
        <span>{film.genre}</span>
        <strong>{film.titre}</strong>
        <span>{film.annee}</span>
      </div>

      <h2>{film.titre}</h2>
      {estNouveau && <span className="badge">Nouveau !</span>}
      <p className="annee">{film.annee}</p>
      <p>{film.resume.trim() !== "" ? film.resume : "Résumé indisponible."}</p>
    </article>
  );
}