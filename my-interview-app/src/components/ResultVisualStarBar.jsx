import React from 'react'

const Star = ({filled}) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? '#f6c94d' : 'none'} stroke={filled ? '#f6c94d' : '#c6c6c6'} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" />
  </svg>
)

// scores: [{subject, value}, ...]
const ResultVisualStarBar = ({scores = [], maxLevel = 4}) => {
  const computeLevel = (val) => {
    if (typeof val !== 'number' || isNaN(val)) return 0
    if (val <= maxLevel) return Math.max(0, Math.round(val))
    // assume 0-100 scale
    const lvl = Math.ceil((val/100) * maxLevel)
    return Math.min(maxLevel, Math.max(0, lvl))
  }

  return (
    <div className="resultStarBar">
      <div className="starBarHeader">各項目の総評</div>
      <div className="starBarList">
        {scores.map((s) => {
          const lvl = computeLevel(s.average)
          return (
            <div className="starBarItem" key={s.subject}>
              <div className="starBarLabel">{s.subject}</div>
              <div className="starBarStars">
                {Array.from({length: maxLevel}).map((_, i) => (
                  <span className="starWrap" key={i}><Star filled={i < lvl} /></span>
                ))}
              </div>
              <div className="starBarScore">{typeof s.average === 'number' ? s.average : ''}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ResultVisualStarBar
