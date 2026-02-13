const local_cam = document.getElementById("local_cam");
const cam_overlay = document.getElementById("cam_overlay");
const ctx = cam_overlay.getContext("2d");
ctx.imageSmoothingEnabled = false; // turn off blur for scaled images on web


//handle toggle_fingertracking button
let fingerTrackingEnabled = true;
const toggleFingerBtn = document.querySelector(".toggle_fingertracking");

toggleFingerBtn.addEventListener("click", () => { 
    fingerTrackingEnabled = !fingerTrackingEnabled; 
    toggleFingerBtn.classList.toggle("active", fingerTrackingEnabled); 
});

//handle toggle_camera button
let cameraEnabled = true;
const toggleCameraBtn = document.querySelector(".toggle_camera");

toggleCameraBtn.addEventListener("click", () => {
    cameraEnabled = !cameraEnabled;
    toggleCameraBtn.classList.toggle("active", cameraEnabled);

    if (cameraEnabled) {
        startCamera();
    } else {
        stopCamera();
    }
})

function startCamera(){
    camera.start();
}

function stopCamera(){
    const stream = local_cam.srcObject;
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    local_cam.srcObject = null;
    ctx.clearRect(0, 0, cam_overlay.width, cam_overlay.height);
}

//load all /public images into array. (for loop needs to know how many images there are)
const publicImageArr = [];
for (let i = 1; i <= 8; i++) {
    const img = new Image();
    img.src = `public/img${i}.png`;
    publicImageArr.push(img);
}

// fingertip landmark ID's
const fingertipIds = [4, 8, 12, 16, 20];

//frame counter + cycling index 
let frameCount = 0; 
let currentImageIndex = 0; 
const framesPerImage = 20; //change speed

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

    //skip if fingertracking disabled
    if (!fingerTrackingEnabled) { 
        return; 
    }

    frameCount++;
    if (frameCount % framesPerImage === 0) { 
        currentImageIndex = (currentImageIndex + 1) % publicImageArr.length; 
    } 
    const fingertipImg = publicImageArr[currentImageIndex];

    if (results.multiHandLandmarks){

        results.multiHandLandmarks.forEach(landmarks => {

            //display images on landmarks
            fingertipIds.forEach((id, fingerIndex) => {
                const imgPoint = landmarks[id];
               
                const x = imgPoint.x * cam_overlay.width;
                const y = imgPoint.y * cam_overlay.height;

                const size = 25; //img display size

                const imgIndex = (currentImageIndex + fingerIndex) % publicImageArr.length;
                const fingertipImg = publicImageArr[imgIndex];

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