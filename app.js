
    const URL = "./my_model/";

    let model, webcam, labelContainer, maxPredictions;

    // Load the image model and setup the webcam
    async function init() {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        // load the model and metadata
        // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
        // or files from your local hard drive
        // Note: the pose library adds "tmImage" object to your window (window.tmImage)
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Convenience function to setup a webcam
        const flip = true; // whether to flip the webcam
        webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
        await webcam.setup(); // request access to the webcam
        await webcam.play();
        window.requestAnimationFrame(loop);

        // append elements to the DOM
        document.getElementById("webcam-container").appendChild(webcam.canvas);
        labelContainer = document.getElementById("label-container");
        for (let i = 0; i < maxPredictions; i++) { // and class labels
            labelContainer.appendChild(document.createElement("div"));
        }
    }

    async function loop() {
        webcam.update(); // update the webcam frame
        await predict();
        window.requestAnimationFrame(loop);
    }

    // run the webcam image through the image model
    async function predict() {
        // predict can take in an image, video or canvas html element
        const prediction = await model.predict(webcam.canvas);
        for (let i = 0; i < maxPredictions; i++) {
            const classPrediction =
                prediction[i].className + ": " + prediction[i].probability.toFixed(2);
            labelContainer.childNodes[i].innerHTML = classPrediction;
        }
    }
    async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);

    labelContainer.innerHTML = "";

    for (let i = 0; i < maxPredictions; i++) {
        const className = prediction[i].className;
        const probability = prediction[i].probability;

        const predictionContainer = document.createElement("div");
        predictionContainer.className = "progress-bar-container";

        const label = document.createElement("div");
        label.textContent = className;
        label.style.fontWeight = "bold";
        label.style.marginBottom = "5px";

        const progressBar = document.createElement("div");
        progressBar.className = "progress-bar";

        const progressBarFill = document.createElement("div");
        progressBarFill.className = "progress-bar-fill";
        progressBarFill.style.width = (probability * 100).toFixed(2) + "%";

        if (className === "Healthy") {
            progressBarFill.style.backgroundColor = "green";
        } else if (className === "Early Blight") {
            progressBarFill.style.backgroundColor = "yellow";
        } else if (className === "Late Blight") {
            progressBarFill.style.backgroundColor = "red";
        } else {
            progressBarFill.style.backgroundColor = "#ff3434";
        }
        // กำหนดสีให้แต่ละ class โดยใช้ชื่อ class เปรียบเทียบ
    switch (className) {
    case "Fungal diseases":
        progressBarFill.style.backgroundColor = "#7E57C2"; // ม่วง
        break;
    case "Bacterial diseases":
        progressBarFill.style.backgroundColor = "#EF5350"; // แดง
        break;
    case "Viral diseases":
        progressBarFill.style.backgroundColor = "#42A5F5"; // ฟ้า
        break;
    case "Healthy":
        progressBarFill.style.backgroundColor = "#66BB6A"; // เขียว
        break;
    default:
        progressBarFill.style.backgroundColor = "#888"; // สำรอง
}

        // สร้างข้อความคำแนะนำการรักษา
        const treatmentText = document.createElement("div");
        treatmentText.className = "treatment-text";

        // ระบุคำแนะนำตาม className
        if (className === "Fungal diseases") {
            treatmentText.textContent = "แนะนำ: ใช้ยาป้องกันเชื้อรา เช่น แมนโคเซบ หรือ คาร์เบนดาซิม";
        } else if (className === "Bacterial diseases") {
            treatmentText.textContent = "แนะนำ: ใช้คอปเปอร์ออกไซด์ หรือสเตรปโตมัยซิน และตัดใบที่เป็นโรค";
        } else if (className === "Viral diseases") {
            treatmentText.textContent = "แนะนำ: ไม่มีทางรักษาโดยตรง แนะนำให้ทำลายพืชที่ติดโรค และควบคุมแมลงพาหะ เช่น เพลี้ยอ่อน";
        } else if (className === "Healthy") {
            treatmentText.textContent = "พืชสุขภาพดี! ดูแลต่อไปและตรวจสอบเป็นประจำ";
        }

        // เพิ่มเข้า container
        predictionContainer.appendChild(treatmentText);

        // Append progress bar fill to progress bar
        progressBar.appendChild(progressBarFill);

        const progressText = document.createElement("div");
        progressText.className = "progress-text";
        progressText.textContent = (probability * 100).toFixed(2) + "%";

        predictionContainer.appendChild(label);
        predictionContainer.appendChild(progressBar);
        predictionContainer.appendChild(progressText);

        labelContainer.appendChild(predictionContainer);
    }
}
