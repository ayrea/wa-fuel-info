import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

interface HasCoords {
  latitude: number
  longitude: number
}

export function MapAutoFit({ items }: { items: HasCoords[] }): null {
  const map = useMap()
  const hasFitted = useRef(false)
  useEffect(() => {
    if (hasFitted.current || items.length === 0) return
    const lats = items.map((r) => r.latitude)
    const lngs = items.map((r) => r.longitude)
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ]
    map.fitBounds(bounds, { padding: [30, 30] })
    hasFitted.current = true
  }, [items, map])
  return null
}
