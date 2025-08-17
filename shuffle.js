// shuffle.js
function makeShuffler(arr){
  let bag = [];
  return function next(){
    if (bag.length === 0){
      bag = arr.slice();
      for (let i = bag.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
    }
    return bag.pop();
  };
}
