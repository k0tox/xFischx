let fishList=[]

let player={
level:1,
xp:0,
coins:0,
rod:"basic"
}

const rods={
basic:{maxWeight:40,price:0},
pro:{maxWeight:150,price:200},
legend:{maxWeight:1000,price:1000}
}

function log(text){

const el=document.getElementById("log")

el.innerHTML=text+"<br>"+el.innerHTML

}

async function loadFish(){

const rules=await fetch("fish-rules.json").then(r=>r.json())

const rarities=["common","uncommon","rare","legendary","mythic"]

function rand(min,max){
return Math.floor(Math.random()*(max-min+1))+min
}

function pickRarity(weights){

let total=0

for(let r of rarities){
total+=weights[r]||0
}

let roll=Math.random()*total

for(let r of rarities){
roll-=weights[r]||0
if(roll<=0) return r
}

return "common"

}

const prefixes={
common:["Pebble","River","Sun","Reed"],
uncommon:["Storm","Moon","Silver"],
rare:["Frost","Crystal","Shadow"],
legendary:["Ancient","Radiant"],
mythic:["Abyssal","Leviathan"]
}

const suffix=[
"Trout","Eel","Salmon","Ray","Carp","Snapper"
]

function randomName(r){

const p=prefixes[r][Math.floor(Math.random()*prefixes[r].length)]
const s=suffix[Math.floor(Math.random()*suffix.length)]

return p+" "+s

}

for(const island of rules.islands){

for(let i=0;i<island.fishCount;i++){

const rarity=pickRarity(island.rarityWeights)

const range=island.weightRanges[rarity]

if(!range) continue

const weight=rand(range[0],range[1])

fishList.push({

name:randomName(rarity),
rarity,
weight,
sellValue:Math.floor(weight*2),
xp:Math.floor(weight*0.5)

})

}

}

console.log("Fish generated:",fishList.length)

}

loadFish()

function getRandomFish(){

return fishList[Math.floor(Math.random()*fishList.length)]

}

document.getElementById("fishButton").onclick=function(){

const fish=getRandomFish()

if(!fish){
log("Fish not loaded yet")
return
}

const rod=rods[player.rod]

if(fish.weight>rod.maxWeight){

log("The fish was too strong and escaped!")

return

}

catchFish(fish)

}

function catchFish(fish){

player.coins+=fish.sellValue
player.xp+=fish.xp

if(player.xp>player.level*100){

player.level++
player.xp=0
log("LEVEL UP!")

}

updateUI()

spawnFishModel()

log("Caught "+fish.name+" ("+fish.weight+"kg)")

}

function updateUI(){

document.getElementById("coins").innerText=player.coins
document.getElementById("xp").innerText=player.xp
document.getElementById("level").innerText=player.level

}

function buyRod(type){

const rod=rods[type]

if(player.coins<rod.price){

log("Not enough coins")

return

}

player.coins-=rod.price

player.rod=type

log("Bought "+type+" rod")

updateUI()

}

function spawnFishModel(){

const scene=document.querySelector("#fishSpawn")

const fish=document.createElement("a-sphere")

fish.setAttribute("radius","0.3")
fish.setAttribute("color","orange")

fish.setAttribute("position",
(Math.random()*4-2)+" 2 "+(Math.random()*4-2)
)

scene.appendChild(fish)

setTimeout(()=>{

scene.removeChild(fish)

},3000)

}

AFRAME.registerComponent("ocean-wave",{

tick:function(t){

const ocean=document.querySelector("#ocean")

const y=Math.sin(t/500)*0.1

ocean.object3D.position.y=y

}

})

document.querySelector("#ocean").setAttribute("ocean-wave","")
