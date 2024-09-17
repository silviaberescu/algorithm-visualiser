const N = 20;
const array = [];
let moves = [];
let i;

const myCanvas = document.getElementById('myCanvas');
myCanvas.width = 600;
myCanvas.height = 400;
const margin = 20;

const cols = [];
const spacing = (myCanvas.width - margin * 2) / N;
const ctx = myCanvas.getContext("2d");
const maxHeight = 300

let isPaused = false; 
const pauseButton = document.getElementById("pauseButton");
pauseButton.addEventListener("click", togglePause);

init();

function init() {
    for (i = 0; i < N; i++) {
        array[i] = randomIntFrom(5, 1000);
    }
    moves = [];
    for (i = 0; i < array.length; i++) {
        const x = i * spacing + spacing / 2 + margin;
        const y = myCanvas.height - margin - 4 * i;
        const width = spacing - 4;
        const height = maxHeight * array[i] / 1000;
        cols[i] = {
            x, 
            y, 
            width, 
            height, 
            queue: [], 
            color: { r: 120, g: 200, b: 120 }
        };
    }
}

function randomIntFrom(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function lerp (a, b, t){
    return a + (b - a) * t;
}

function moveTo(col, loc, frameCount = 50) {
    for (i = 1; i <= frameCount; i++) {
        const t = i / frameCount;
        col.queue.push({
            x: lerp(col.x, loc.x, t),
            y: lerp(col.y, loc.y, t),
        });
    }
}

function jump(col, frameCount = 50) {
    for (i = 1; i <= frameCount; i++) {
        const t = i / frameCount;
        const u = Math.sin(t * Math.PI);
        col.queue.push({
            x: col.x,
            y: col.y - u * col.width,
        });
    }
}

function play() {
    moves = bubbleSort(array);
}

function drawColumn(ctx, col) {
    let change = false;
    if (col.queue.length > 0) {
        const { x, y } = col.queue.shift();
        col.x = x;
        col.y = y;
        change = true;
    }

    const left = col.x - col.width / 2;
    const top = col.y - col.height;
    const right = col.x + col.width / 2;

    ctx.beginPath();
    const { r, g, b } = col.color;
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.moveTo(left, top);
    ctx.lineTo(left, col.y);
    ctx.ellipse(col.x, col.y, col.width / 2, col.width / 4, 0, Math.PI, Math.PI * 2, true);
    ctx.lineTo(right, top);
    ctx.ellipse(col.x, top, col.width / 2, col.width / 4, 0, 0, 2 * Math.PI, true);
    ctx.fill();
    ctx.stroke();

    return change;
}

function bubbleSort (array){
    const moves =[];
    do {
        var swapped = false;
        for (i = 1; i < array.length; i++) {
            if (array[i - 1] > array[i]) {
                swapped = true;
                [array[i - 1], array[i]] = [array[i], array[i - 1]];
                moves.push(
                    {indices: [i - 1, i], swap: true});
            } else {
                moves.push(
                {indices: [i - 1, i], swap: false});
            }
        }
    } while (swapped);
    return moves;
}


function animate()  {
    if (!isPaused) {
        ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
        let change = false;
        for (i = 0; i < cols.length; i++) {
            change = drawColumn(ctx, cols[i]) || change;
        }
        if(!change && moves.length > 0) {
            const move = moves.shift();
            const [i, j] = move.indices;
            if(move.swap){
                moveTo(cols[i], cols[j]);
                moveTo(cols[j], cols[i]);
                [cols[i], cols[j]] = [cols[j], cols[i]];
            } else {
                jump(cols[i]);
                jump(cols[j]);
            }

        }
    }
    requestAnimationFrame(animate);
}

function togglePause() {
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? "Resume" : "Pause";
}

animate();