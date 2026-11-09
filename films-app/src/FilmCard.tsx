import { useState } from 'react'

export type Film = {
    id: number
    titre: string
    annee: number
    resume: string
    affiche: string
    vu: boolean
}

function FilmCard({
    film,
    selected,
    onToggleSelected,
    onToggleVu,
    onDelete,
}: {
    film: Film
    selected: boolean
    onToggleSelected: () => void
    onToggleVu: () => void
    onDelete: () => void
}) {
    const [likes, setLikes] = useState(0)
    const [resumeVisible, setResumeVisible] = useState(false)

    return (
        <article className="film-card">
            <button
                type="button"
                className="film-poster"
                aria-label={`${resumeVisible ? 'Masquer' : 'Afficher'} le résumé de ${film.titre}`}
                aria-expanded={resumeVisible}
                onClick={() => setResumeVisible((visible) => !visible)}
            >
                <img src={film.affiche} alt="" className="film-poster-image" />
                <div className="film-poster-content">
                    <h2 className="film-poster-title">{film.titre}</h2>
                    <span className="film-poster-year">{film.annee}</span>
                </div>
            </button>

            <div className="film-details">
                <h2 className="film-title">{film.titre}</h2>
                {film.annee >= 2025 && <span className="film-badge">Nouveau !</span>}
                <p className="film-year">{film.annee}</p>
                {resumeVisible && (
                    <p className="film-summary">
                        {film.resume.trim() ? film.resume : 'Résumé indisponible.'}
                    </p>
                )}
                <button
                    className="film-select"
                    type="button"
                    aria-pressed={selected}
                    onClick={onToggleSelected}
                >
                    {selected ? 'Sélectionné' : 'Sélectionner'}
                </button>
                <button className="film-like" onClick={() => setLikes(likes + 1)}>
                    ♥ {likes}
                </button>
                <button
                    className="film-select"
                    type="button"
                    aria-pressed={film.vu}
                    onClick={onToggleVu}
                >
                    {film.vu ? 'Marquer à revoir' : 'Marquer vu'}
                </button>
                <button className="film-select" type="button" onClick={onDelete}>
                    Supprimer
                </button>
            </div>
        </article>
    )
}

export default FilmCard
