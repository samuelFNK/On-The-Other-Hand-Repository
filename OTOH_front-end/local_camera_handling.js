const local_cam = document.getElementById("local_cam");
const cam_overlay = document.getElementById("cam_overlay");
const ctx = cam_overlay.getContext("2d");
ctx.imageSmoothingEnabled = false; // turn off blur for scaled images on web

// Map image objects to fingertip array nums 
const fingertipImages = { 
    4: new Image(), 
    8: new Image(), 
    12: new Image(), 
    16: new Image(), 
    20: new Image() 
};

// Set image object sources to local paths
fingertipImages[4].src = "public/tinyLemonTree.jpg"; 
fingertipImages[8].src = "public/tinyLemonTree.jpg"; 
fingertipImages[12].src = "public/tinyLemonTree.jpg"; 
fingertipImages[16].src = "public/tinyLemonTree.jpg"; 
fingertipImages[20].src = "public/tinyLemonTree.jpg";


const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

//hand recognition model config
hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});

hands.onResults(results => {

    //clear entire overlay
    ctx.clearRect(0, 0, cam_overlay.width, cam_overlay.height);

    if (results.multiHandLandmarks){

        results.multiHandLandmarks.forEach(landmarks => {

            //display images on landmarks
            [4, 8, 12, 16, 20].forEach(id => {
                const imgPoint = landmarks[id];
                const fingertipImg = fingertipImages[id];

                const x = imgPoint.x * cam_overlay.width;
                const y = imgPoint.y * cam_overlay.height;

                const size = 30; //img display size
                ctx.drawImage(fingertipImg, x - size/2, y - size/2, size, size);
                
            });
        });
    }
});

//get camera stream
const camera = new Camera(local_cam, {
    onFrame: async () => {
        await hands.send({image: local_cam});
    },
});

camera.start();
local_cam.onloadedmetadata = () => {

    cam_overlay.width = local_cam.videoWidth;
    cam_overlay.height = local_cam.videoHeight;
};