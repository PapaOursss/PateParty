import { useState } from 'react'

function Prenom() {
  const [prenom, setPrenom] = useState('')
  const nom = prenom.trim()

  return (
    <div className="prenom">
      <label htmlFor="prenom-input" className="prenom-label">Ton prénom</label>
      <input
        id="prenom-input"
        type="text"
        className="prenom-input"
        value={prenom}
        onChange={(e) => setPrenom(e.target.value)}
      />
      <p className="prenom-message">
        {nom
          ? `Bonjour ${nom} ! (${nom.length} caractères)`
          : 'Tape ton prénom.'}
      </p>
    </div>
  )
}

export default Prenom
