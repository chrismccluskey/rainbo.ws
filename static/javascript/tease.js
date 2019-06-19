// global variables
var ctx, canvas, center, height, width, total;
var colors = [];
var color_sets = [];
var stroke = false;
var reverse = false;
var userHasBeenWarned = false;

// configurable settings
var rainbow = ["red", "orange", "yellow", "green", "blue", "purple", "pink", "white"];
var seemless = true;
var max_multiplyer = 20;
var max_speed = 1;
var multiplyer = 1;
var speed = 0.001;
var offset = 0;
var offset_increment = 0;
var edge_pixels = 0;
var video_webm = "//zippy.gfycat.com/LeanPointedCopperbutterfly.webm"
var video_mp4 = "//zippy.gfycat.com/LeanPointedCopperbutterfly.mp4"

// support non-webkit browsers
window.requestAnimationFrame = window.requestAnimationFrame ||
                               window.webkitRequestAnimationFrame;

// modify settings based on mouse movement
window.onmousemove = function (event) {
    // IE support
    event = event || window.event;

    // get color index based on percentage of screen cursor X-axis is on * max_multiplyer.
    color_set_index = parseInt(max_multiplyer * (event.clientX / window.innerWidth));
    changeColorSet(color_set_index);

    // get color index based on percentage of screen cursor X-axis is on * max_multiplyer.
    changeSpeed(event.clientY / window.innerHeight);
}

// correct <canvas> size when screen window is resized
window.onresize = function (event) {
    correctCanvasSize();
}

window.onclick = function (event) {
    reverse = !reverse;
}

// keep the size of the window and the size of the canvas in sync
function correctCanvasSize() {
    // set global variables to proper sizes
    width = window.innerWidth;
    height = window.innerHeight;
    center = [parseInt(width/2), parseInt(height/2)];
    canvas.width = width;
    canvas.height = height;
    edge_pixels = (width+height)*2;
    offset_increment = edge_pixels*(speed/edge_pixels);
}

// populate color_sets with hex color values. 
// costly function that should be run only once or rarely.
function populateColorSets() {
    for(var mm=0; mm<max_multiplyer; mm++) {
        color_sets[mm] = [];

        for(var m=0; m<=mm; ++m) {
            for(var i=0; i<rainbow.length; ++i) {
                color_sets[mm].push(rainbow[i]);
            }
            if(seemless) {
                rainbow.reverse();
                for(var i=1; i<rainbow.length-1; ++i) {
                    color_sets[mm].push(rainbow[i]);
                }
                rainbow.reverse();
            }
        }
    }
}

// switch the active color set with a value between 0 and color_set.length
function changeColorSet(index) {
    colors = color_sets[index];
    total = colors.length;
}

// change the speed given a percentage of max speed (float: 0-1)
function changeSpeed(percent) {
    speed = max_speed * percent;
    offset_increment = edge_pixels*(speed/edge_pixels);
    //console.log(offset_increment);
}

// determine the closest corner coordinates for a given point.
function closestCorner(x, y) {
    corner = [0, 0]
    if (x >= center[0]) {
        corner[0] = window.innerWidth;
    } else {
        corner[0] = 0;
    }
    if (y >= center[1]) {
        corner[1] = window.innerHeight;
    } else {
        corner[1] = 0;
    }
    return corner;
}

function nextOffset(currentOffset) {
    offset += offset_increment;
    if(offset > edge_pixels) {
        offset -= edge_pixels;
    }
    return currentOffset;
}

function nextSliceCoordinate(sliceNumber) {
    if(reverse) {
        next_value = parseInt(nextOffset(offset, true) + (sliceNumber*(1/total)*edge_pixels));
        if(next_value > edge_pixels) {
            next_value = next_value-edge_pixels;
        }
    } else {
        next_value = parseInt((sliceNumber*(1/total)*edge_pixels) - nextOffset(offset, true));
        if(next_value < 0) {
            next_value = next_value+edge_pixels;
        }
    }

    if(next_value < width) {
        return [next_value, 0];
    } else {
        if(next_value < width+height) {
            return [width, next_value-width];
        } else {
            if(next_value < width+height+width) {
                return [width-(next_value-(width+height)), height];
            } else {
                return [0, height-(next_value-(width+height+width))];
            }
        }
    }
}

function draw(time) {

    // loop once for every color found in activated color_set
    for(var i=0; i<total; ++i) {

        // set fill color to the color currently being drawn
        ctx.fillStyle = colors[i];

        // start drawing a path
        ctx.beginPath();

        // start from the center
        ctx.moveTo(center[0], center[1]);

        // calculate corner coordinates
        first_corner = nextSliceCoordinate(i);
        last_corner = nextSliceCoordinate(i+1);

        // draw the first line
        ctx.lineTo(first_corner[0], first_corner[1]);

        // if the slice is rounding the corner
        if(first_corner[0] != last_corner[0] && first_corner[1] != last_corner[1]) {

            // calculate the corner coordinate
            corner_coord = closestCorner(first_corner[0], first_corner[1]);

            // draw the line to the corner
            ctx.lineTo(corner_coord[0], corner_coord[1]);
        }

        // draw a line to the last corner
        ctx.lineTo(last_corner[0], last_corner[1]);

        // stroke the line
        if(stroke) {
            ctx.stroke();
        }

        // fill the shape
        ctx.fill();
    }

    // Call the draw function when the animation frame is ready.
    window.requestAnimationFrame(draw);
}

function warnUser() {
    kitteh = document.getElementById('kitteh');
    kitteh.style.display = "none";
}

function removeWarning() {
    warning = document.getElementById('warning');
    warning.style.display = "none";

    html = document.getElementsByTagName('html')[0];
    html.style.backgroundColor = "";

    kitteh = document.getElementById('kitteh');
    kitteh.style.display = "block";
    populateColorSets();
    changeColorSet(0);
    correctCanvasSize();
}

// Similar to jQuery's ready(). Only run when DOM Content is Loaded.
document.addEventListener('DOMContentLoaded', function () {

    if (!!!document.getCSSCanvasContext) {

        // Browser doesn't support CSS Canvas objects
        // canvas = document.createElement('canvas');
        canvas = document.querySelector('#canvas');
        ctx = canvas.getContext('2d');

    } else {

        canvas = document.querySelector('#canvas');
        canvas.remove();
        // Browser does support CSS Canvas objects
        ctx = document.getCSSCanvasContext('2d', 'animation', height, width);
        canvas = ctx.canvas;

    }

    // Initialize colors, switch to small color set and canvas size
    warnUser();

    // Call the draw function when the animation frame is ready.
    window.requestAnimationFrame(draw);

});
