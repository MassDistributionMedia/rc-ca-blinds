

export default function (width, wFrac, height, hFrac) {
  return formatDim(width, wFrac) + " x " + formatDim(height, hFrac);
}

export function formatDim(int, frac) {
  function handleFrac(frac) {
    if(typeof frac === "string") {
        if(/\/8$/.test(frac)) return frac;
        frac = parseInt(frac);
    }
    if (frac === 0) return "";
    return " " + frac + "/" + "8";
  }
  return int + handleFrac(frac);
}
