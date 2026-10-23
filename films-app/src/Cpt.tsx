import { useState } from 'react'

function Cpt() {
  const [count, setCount] = useState(0)

  return (
    <div className="counter">
      <p className={count >= 10 ? 'counter-value counter-high' : 'counter-value'}>
        {count}
      </p>
      <div className="counter-actions">
        <button onClick={() => setCount(count - 1)} disabled={count === 0}>
          −1
        </button>
        <button onClick={() => setCount(count + 1)}>+1</button>
        <button onClick={() => setCount(0)}>Remettre à zéro</button>
      </div>
    </div>
  )
}

export default Cpt
