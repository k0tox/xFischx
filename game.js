// =====================
// FISH GENERATION SYSTEM
// =====================

let fishList = [];

async function loadFish() {
  const rules = await fetch("fish-rules.json").then(r => r.json());

  const rarityOrder = ["common","uncommon","rare","legendary","mythic","exotic"];

  function rand(min,max){
    return Math.floor(Math.random()*(max-min+1))+min;
  }

  function pickRarity(weights){
    const entries = Object.entries(weights);
    const total = entries.reduce((a,b)=>a+b[1],0);

    let roll = Math.random()*total;

    for(const [rarity,weight] of entries){
      if(roll < weight) return rarity;
      roll -= weight;
    }

    return entries[0][0];
  }

  function randomName(rarity){

    const prefixes = {
      common:["Pebble","River","Sun","Reed","Shore"],
      uncommon:["Moon","Storm","Wind","Tide"],
      rare:["Frost","Crystal","Shadow","Iron"],
      legendary:["Ancient","Radiant","Phantom","Solar"],
      mythic:["Abyssal","Titanic","Leviathan","Eldritch"],
      exotic:["Celestial","Voidborn","Astral","Eclipse"]
    };

    const suffixes=[
      "Trout","Minnow","Eel","Ray",
      "Salmon","Carp","Snapper","Bass"
    ];

    const p = prefixes[rarity][Math.floor(Math.random()*prefixes[rarity].length)];
    const s = suffixes[Math.floor(Math.random()*suffixes.length)];

    return `${p} ${s}`;
  }

  const generated = [];

  for(const island of rules.islands){

    for(let i=0;i<island.fishCount;i++){

      const rarity = pickRarity(island.rarityWeights);

      if(!island.weightRanges[rarity]) continue;

      const [minW,maxW] = island.weightRanges[rarity];

      if(maxW <= 0) continue;

      const weight = rand(minW,maxW);

      const rarityIndex = rarityOrder.indexOf(rarity);

      const sellValue = Math.floor(weight * (2 + rarityIndex * 2.5));
      const xp = Math.floor(weight * (1 + rarityIndex * 1.2));

      generated.push({
        name: randomName(rarity),
        rarity,
        weight,
        sellValue,
        xp,
        island: island.name,
        boss:false
      });

    }

  }

  fishList = generated;

  console.log("Fish generated:", fishList.length);
}

loadFish();
