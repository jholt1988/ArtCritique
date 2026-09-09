const fix = "Establish a strong focal point by adjusting the contrast. First, map out your values in a separate thumbnail. Then, apply a soft gradient overlay to push the background back. Watch out for tangent lines near the character's weapon.";
const objectives = fix.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
console.log(objectives);
