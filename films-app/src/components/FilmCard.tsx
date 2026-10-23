function FilmCard() {
    const film = {
        title: "Dernier métro pour Mars",
        year: 2026,
        poster: "https://picsum.photos/300/450",
        summary: "Une conductrice découvre une station absente de tous les plans."
    };

    return (
        <div className="card">
            <h1>TD 1 - Ma fiche film</h1>

            <img src={film.poster} alt={film.title} width="200" />

            {film.year >= 2025 && <span>Nouveau !</span>}

            <p>{film.year}</p>

            <p>{film.summary || "Résumé indisponible."}</p>
        </div>
    );
}

export default FilmCard;