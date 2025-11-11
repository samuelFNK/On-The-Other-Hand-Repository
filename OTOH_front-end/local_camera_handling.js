const local_cam = document.getElementById("local_cam");

navigator.mediaDevices.getUserMedia({video : true})
    .then(stream => {
        local_cam.srcObject = stream;
    })
    .catch(err => {
        console.error("Could not access local camera: ", err);
    });