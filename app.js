const URL = "./my_model/";

let model, webcam, labelContainer, maxPredictions;
let facingMode = "user"; // เริ่มต้นกล้องหน้า

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    if (webcam && webcam.stream) {
        // ปิด stream เก่า
        webcam.stream.getTracks().forEach(track => track.stop());
        document.getElementById("webcam-container").innerHTML = "";
    }

    try {
        const constraints = {
            video: {
                width: 200,
                height: 200,
                facingMode: facingMode  // "user" หรือ "environment"
            }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        // สร้าง webcam แบบไม่มีการสร้าง stream ใหม่ (ใช้ stream ที่ได้)
        webcam = new tmImage.Webcam(200, 200, true);
        await webcam.setup({ video: stream });
        await webcam.play();

        document.getElementById("webcam-container").appendChild(webcam.canvas);

        labelContainer = document.getElementById("label-container");
        labelContainer.innerHTML = "";
        for (let i = 0; i < maxPredictions; i++) {
            labelContainer.appendChild(document.createElement("div"));
        }

        window.requestAnimationFrame(loop);
    } catch (err) {
        alert("ไม่สามารถเข้าถึงกล้อง: " + err.message);
        console.error("Error accessing webcam:", err);
    }
}

async function switchCamera() {
    facingMode = (facingMode === "user") ? "environment" : "user";
    console.log("Switching camera to:", facingMode);
    await init();
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
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

        switch (className) {
            case "Fungal diseases":
                progressBarFill.style.backgroundColor = "#7E57C2";
                break;
            case "Bacterial diseases":
                progressBarFill.style.backgroundColor = "#EF5350";
                break;
            case "Viral diseases":
                progressBarFill.style.backgroundColor = "#42A5F5";
                break;
            case "Healthy":
                progressBarFill.style.backgroundColor = "#66BB6A";
                break;
            default:
                progressBarFill.style.backgroundColor = "#888";
        }

        const treatmentText = document.createElement("div");
        treatmentText.className = "treatment-text";

        if (className === "Fungal diseases") {
            treatmentText.textContent = "แนะนำ: ใช้ยาป้องกันเชื้อรา เช่น แมนโคเซบ หรือ คาร์เบนดาซิม";
        } else if (className === "Bacterial diseases") {
            treatmentText.textContent = "แนะนำ: ใช้คอปเปอร์ออกไซด์ หรือสเตรปโตมัยซิน และตัดใบที่เป็นโรค";
        } else if (className === "Viral diseases") {
            treatmentText.textContent = "แนะนำ: ไม่มีทางรักษาโดยตรง ควรทำลายพืชที่ติดโรค และควบคุมแมลงพาหะ";
        } else if (className === "Healthy") {
            treatmentText.textContent = "พืชสุขภาพดี! ดูแลต่อไปและตรวจสอบเป็นประจำ";
        }

        const progressText = document.createElement("div");
        progressText.className = "progress-text";
        progressText.textContent = (probability * 100).toFixed(2) + "%";

        progressBar.appendChild(progressBarFill);
        predictionContainer.appendChild(label);
        predictionContainer.appendChild(progressBar);
        predictionContainer.appendChild(progressText);
        predictionContainer.appendChild(treatmentText);

        labelContainer.appendChild(predictionContainer);
    }
}
