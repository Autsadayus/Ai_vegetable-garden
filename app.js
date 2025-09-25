const URL = "./my_model/";

let model, webcam, labelContainer, maxPredictions;
let facingMode = "user"; // เริ่มต้นกล้องหน้า

// เริ่มต้น webcam + โหลด model
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // ปิดกล้องเก่าก่อน (ถ้ามี)
    if (webcam) {
        await webcam.stop();
        document.getElementById("webcam-container").innerHTML = "";
    }

    // สร้างกล้องใหม่ตาม facingMode โดยส่ง options เป็น object
    webcam = new tmImage.Webcam(200, 200, true, { facingMode: facingMode });
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);

    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = "";
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }
}

// ฟังก์ชันเปลี่ยนกล้อง
async function switchCamera() {
    facingMode = (facingMode === "user") ? "environment" : "user";
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

        // สีตาม class
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

        // คำแนะนำ
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
