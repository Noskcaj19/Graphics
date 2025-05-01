let canvas = document.getElementById("root")
/**
 * @type {CanvasRenderingContext2D}
 */
let ctx = canvas.getContext('2d')

ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)


function drawLine(from, to) {
    ctx.beginPath(); // Start a new path
    ctx.moveTo(...from); // Move the pen to (30, 50)
    ctx.lineTo(...to); // Draw a line to (150, 100)
    ctx.closePath()
    ctx.stroke(); // Render the path
}


canvas.addEventListener('click', (e) => {
    function getCursorPosition(canvas, event) {
        var b = canvas.getBoundingClientRect()
        var scale = canvas.width / parseFloat(b.width)
        var x = (event.clientX - b.left) * scale
        var y = (event.clientY - b.top) * scale
        return [x, y]
    }

    let [x, y] = getCursorPosition(canvas, e)
    let screen = [x, y]
    console.log(screen)

})


window.angle = function angle([x1, y1], [x2, y2]) {
    return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
}

window.points = [
    [156, 48,],

    [542, 46,],

    [545, 163,],

    [442, 162,],

    [441, 356,],

    [388, 451,],

    [273, 451,],

    [233, 367,],

    [298, 366,],

    [337, 314,],

    [337, 165,],

    [168, 162,],
    // [156, 48,],
]

let last = points[0]
for (let point of points) {
    drawLine(last, point)
    last = point
}
drawLine(last, points[0])
