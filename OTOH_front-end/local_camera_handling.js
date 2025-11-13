const local_cam = document.getElementById("local_cam");
const cam_overlay = document.getElementById("cam_overlay");
const ctx = cam_overlay.getContext("2d");

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
        results.multiHandLandmarks.forEach((landmarks, i) => {

            //draw landmarks
             landmarks.forEach((point) => {
                ctx.beginPath();
                ctx.arc(point.x * cam_overlay.width, point.y * cam_overlay.height, 2, 0, 2 * Math.PI);
                ctx.fillStyle = "red";
                ctx.fill();
            });

            //draw landmark connections
            drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {color: "purple", lineWidth : 2});
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
