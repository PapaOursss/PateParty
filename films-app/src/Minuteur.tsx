import { useEffect, useState } from 'react'

function formaterTemps(secondes: number) {
  const minutes = Math.floor(secondes / 60)
  const resteSecondes = secondes % 60
  return `${String(minutes).padStart(2, '0')}:${String(resteSecondes).padStart(2, '0')}`
}

function Minuteur() {
  const [secondes, setSecondes] = useState(0)
  const [demarre, setDemarre] = useState(false)

  useEffect(() => {
    if (!demarre) return

    const intervalle = window.setInterval(() => {
      setSecondes((temps) => temps + 1)
    }, 1000)

    return () => window.clearInterval(intervalle)
  }, [demarre])

  useEffect(() => {
    const titreInitial = document.title
    return () => {
      document.title = titreInitial
    }
  }, [])

  useEffect(() => {
    document.title = formaterTemps(secondes)
  }, [secondes])

  return (
    <>
      <section className="timer" aria-label="Minuteur">
        <p className="timer-value">{formaterTemps(secondes)}</p>
        <div className="timer-actions">
          <button type="button" onClick={() => setDemarre(true)}>Démarrer</button>
          <button type="button" onClick={() => setDemarre(false)}>Arrêter</button>
          <button
            type="button"
            onClick={() => {
              setDemarre(false)
              setSecondes(0)
            }}
          >
            Remettre à zéro
          </button>
        </div>
      </section>
      <CompteARebours />
    </>
  )
}

function CompteARebours() {
  const [compte, setCompte] = useState({ secondes: 10, demarre: false })
  const termine = compte.secondes === 0

  useEffect(() => {
    if (!compte.demarre) return

    const intervalle = window.setInterval(() => {
      setCompte((actuel) => ({
        secondes: Math.max(actuel.secondes - 1, 0),
        demarre: actuel.secondes > 1,
      }))
    }, 1000)

    return () => window.clearInterval(intervalle)
  }, [compte.demarre])

  function lancer() {
    setCompte({ secondes: 10, demarre: true })
  }

  return (
    <section className="timer" aria-label="Compte à rebours">
      <p className="timer-value">
        {termine ? 'Terminé !' : formaterTemps(compte.secondes)}
      </p>
      <div className="timer-actions">
        <button type="button" onClick={lancer} disabled={compte.demarre}>
          {termine ? 'Recommencer' : 'Démarrer le compte à rebours'}
        </button>
      </div>
    </section>
  )
}

export default Minuteur
