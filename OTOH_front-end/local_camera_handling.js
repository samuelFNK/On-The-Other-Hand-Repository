const local_cam = document.getElementById("local_cam");
const cam_overlay = document.getElementById("cam_overlay");
const ctx = cam_overlay.getContext("2d");

//access local cam
navigator.mediaDevices.getUserMedia({video : true})
    .then(stream => {
        local_cam.srcObject = stream;

        //when ready, set overlay window size and start drawing
        local_cam.onloadedmetadata = () => {
            local_cam.play();
            cam_overlay.width = local_cam.videoWidth;
            cam_overlay.height = local_cam.videoHeight;
            runHandPose();
        }
    })
    .catch(err => {
        console.error("Could not access local camera: ", err);
    });

async function runHandPose(){

    const model = await handpose.load();

    async function detectHands(){
        const predictions = await model.estimateHands(local_cam);

        //clear drawn landmarks each frame
        ctx.clearRect(0, 0, cam_overlay.width, cam_overlay.height);

        if (predictions.length > 0) {
            console.log(predictions);
            const landmarks = predictions[0].landmarks;

            //draw overlay on landmarks
            landmarks.forEach(([x, y]) => {
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = "blue";
                ctx.fill();
            });
        }

        requestAnimationFrame(detectHands);
    }

    detectHands();
}