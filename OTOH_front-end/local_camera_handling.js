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

//run model
async function runHandPose(){

    const model = await handpose.load();

    async function detectHands(){

        //performance timer starting point
        const performanceTimerStart = performance.now();
        const predictions = await model.estimateHands(local_cam);

        //clear drawn landmarks each frame
        ctx.clearRect(0, 0, cam_overlay.width, cam_overlay.height);

        if (predictions.length > 0) {

            const landmarks = predictions[0].landmarks;

            //draw overlay dots on landmarks
            landmarks.forEach(([x, y]) => {
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = "red";
                ctx.fill();
            });

            //locate hand structure dots
            const handStructure = [
                [0, 1], [1, 2], [2, 3], [3, 4], //thumb
                [0, 5], [5, 6], [6, 7], [7, 8], //Index
                [0, 9], [9, 10], [10, 11], [11, 12], //Middle
                [0, 13], [13, 14], [14, 15], [15, 16], //Ring
                [0, 17], [17, 18], [18, 19], [19, 20], //Pinky

                
                [0, 5], [5, 9], [9, 13], [13, 17], [17, 0], //Palm sides
                [0, 1], [1, 5] //Palm between fingers
            ];

            //draw hand structure
            handStructure.forEach(([start, end]) => {
                const [x1, y1] = landmarks[start];
                const [x2, y2] = landmarks[end];

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = "purple";
                ctx.lineWidth = 2;
                ctx.stroke();
            } )

        }

        //performance timer checkpoint
        const performanceTimerCheck1 = performance.now() - performanceTimerStart;
        //request animation after performance timer timeout. Cap max speed to the second @inParam
        setTimeout( () => requestAnimationFrame(detectHands), Math.max(0, 33 - performanceTimerCheck1) );
        
    }

    detectHands();
}