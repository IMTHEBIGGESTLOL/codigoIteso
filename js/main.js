const width = 320;
const height = 240;

let uploadedimage = null;
let isselectingcolor = false;

const downloadButton = $('#download-button');
const colorbox = $('#color-box');

const redslider = $('#red-slider');
const greenslider = $('#green-slider');
const blueslider = $('#blue-slider');
const presetSelect = $('#preset-select');

const toleranceslider = $('#tolerance-slider');

let sc_r=0, sc_g=0, sc_b=0;

function setup() {
    createCanvas(width, height).parent('canvas-container');
    pixelDensity(1);

    const htmldropzone = select("#dropzone");
    htmldropzone.dragOver(function(){
        htmldropzone.addClass("dragOver");
    });
    htmldropzone.dragLeave(function(){
        htmldropzone.removeClass("dragOver");
    });
    htmldropzone.drop(function(image){
        uploadedimage= loadImage(image.data);
        
        htmldropzone.removeClass("dragOver");
    });
}
  
function draw() {
    background(100,0);
    console.log(mouseincanvas());
    if (uploadedimage === null) return;

    let canvasratio = width/height;

    let imagewidth = uploadedimage.width;
    let imageheight = uploadedimage.height;
    let imageratio = imagewidth/imageheight;

    let x=0,y=0,w,h;

    if (imageratio > canvasratio){
        w = width;
        h = w/imageratio;
        y = (height - h)/2;
    }
    else{
        h = height;
        w = imageratio * h;
        x = (width - w)/2;
    }

    image(uploadedimage,x,y,w,h);

    // filters

    loadPixels();

    if(isselectingcolor && mouseincanvas()){
        x = Math.round(mouseX);
        y = Math.round(mouseY);
        let index= (y*width + x) * 4;
        sc_r = pixels[index+0];
        sc_g = pixels[index+1];
        sc_b = pixels[index+2];
        colorbox.css('background-color', `rgb(${sc_r}, ${sc_g}, ${sc_b})`);
    }

    if(presetSelect.val() === 'grayscale') grayscale(pixels);
    if(presetSelect.val() === 'sc') singlecolor(pixels);
    if(presetSelect.val() === 'black&white') blackpixels(pixels);
    else defaultpixels(pixels);
    
    updatePixels();
}

downloadButton.click(function(){

    uploadedimage.loadPixels();

    let pixelBackup = [];
    for(let i=0; i < uploadedimage.pixels.length; i++){
        pixelBackup.push(uploadedimage.pixels[i]);
    }

    if(presetSelect.val() === 'grayscale') grayscale(uploadedimage.pixels);
    else {
        if(presetSelect.val() === 'black&white'){
            blackpixels(uploadedimage.pixels);
        }else defaultpixels(uploadedimage.pixels);
    }

    uploadedimage.updatePixels();

    save(uploadedimage, 'edit.png');

    uploadedimage.loadPixels();

    for(let i=0; i < uploadedimage.pixels.length; i++){
        uploadedimage.pixels[i] = pixelBackup[i];
    }

    uploadedimage.updatePixels();
});

colorbox.click(function(){
    isselectingcolor = true; 
});

function mouseClicked(){
    if(mouseincanvas()){
        isselectingcolor = false;
    }
}

function mouseincanvas(){
    if(mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height ) return true;
    else return false;
}

//// filtros2.0 ////

function singlecolor(pixels){
    for(let pixel=0; pixel < pixels.length/4; pixel++){
        let i = pixel*4;

        let tolerance = number(toleranceslider.val());
        let dif = Math.abs(pixels[i] - sc_r) + Math.abs(pixels[i+1] - sc_g) + Math.abs(pixels[i+2] - sc_b);
        if(dif < tolerance) continue;
        
        let average = (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
        pixels[i+0] = average;
        pixels[i+1] = average;
        pixels[i+2] = average;
    }
}

function grayscale(pixels){
    for(let pixel=0; pixel < pixels.length/4; pixel++){
        let i = pixel*4;
        let average = (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
        pixels[i+0] = average;
        pixels[i+1] = average;
        pixels[i+2] = average;
    }
}

function defaultpixels(pixels){
    let r= Number(redslider.val());
    let g= Number(greenslider.val());
    let b= Number(blueslider.val());
    for(let pixel=0; pixel < pixels.length/4; pixel++){
        let i = pixel*4;
        pixels[i+0] = pixels[i+0] + r;
        pixels[i+1] = pixels[i+1] + g;            
        pixels[i+2] = pixels[i+2] + b;
    }
}

function blackpixels(pixels){
    for(let pixel=0; pixel < pixels.length/4; pixel++){
        let i = pixel*4;
        let average = (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
        let color = 0;
        if(average > 127){
            color = 255;
        }
        pixels[i+0] = color;
        pixels[i+1] = color;
        pixels[i+2] = color;
    }
}