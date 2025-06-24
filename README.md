# Visu.ai

Visu.ai is a Chrome extension that activates on shopping websites (currently supports amazon). It prompts users to select a background surface, detects the searched object, and generates a 3D model from segmented 2D images right on the local compute.

# Contributors 

- Gunjan Giri
    gunjangiri8410@gmail.com
    https://www.linkedin.com/in/gunjan-giri/
- Risabh Kedia
    risabh.kedia12@gmail.com
    https://www.linkedin.com/in/risabh-kedia/
- Shuvam Kumar Panda
    shuvamkumar2001@gmail.com
    https://www.linkedin.com/in/shuvam-kumar-panda-9901b4192/ 
- Manas Ranjan Munda
    manasranjanmunda1410@gmail.com
    https://www.linkedin.com/in/manas-ranjan-munda/

# 🚀 Features
- 🔗 1-Click Chrome Extension Integration
    Seamlessly integrates with online shopping platforms (currently Amazon) to extract product images in one click. No copy-pasting or manual image downloads required.

- 🖼️ AI-Powered Product Image Detection
    Automatically detects, segments, and enhances product images using YOLOv8 for high-precision object isolation — ensuring only the product is extracted, not the background clutter.

- 🧠 2D to 3D Model Conversion Engine
    Leverages Midas + Anything Model (SAM) to infer depth and structure from a single 2D image, generating a lightweight, realistic 3D mesh.

- 🔍 Real-Time 3D Model Viewer
    Instantly preview the 3D model in an interactive viewer right within the browser. Rotate, zoom, and inspect the product from any angle in real-time.
    
- 🔄 Python-Based Backend (Flask + OpenCV)
    Robust and efficient backend processing pipeline for image preprocessing, depth estimation, segmentation, and 3D reconstruction.
    
- 🧵 PLY Model Generation with Color Fidelity
    Outputs .ply 3D models that preserve texture and color using advanced vertex coloring — perfect for realistic previews and downstream use in AR/VR pipelines.

- 🌐 Cross-Platform Support
    Works across macOS, Windows, and Linux with minimal dependencies, enabling developers and consumers alike to experience high-fidelity 3D without special hardware.


## Motivation

We created this project to address the challenge of visualizing 3D models of products in a shopping site. The current process of generating 3D models manually is time-consuming and requires users to manually input dimensions of the product fromm the end user. Our extension automates this process, saving users time and effort.

# 🛠️ Tech Stack

## 🧩 Frontend

- Chrome Extension (JavaScript, HTML, CSS)
      Provides a seamless one-click UI integrated directly into shopping websites (currently Amazon).
      Extracts relevant product image URLs from the DOM and sends them to the backend for processing.
      Allows users to preview 3D models within the browser using embedded viewers (powered by Three.js).

- Three.js
      Enables interactive 3D model visualization in the browser.
      Allows real-time rotation, zooming, lighting effects, and material rendering to simulate a realistic product viewing experience.
      Supports importing and rendering .ply models with vertex color data for accurate textures.
  
## ⚙️ Backend
- Flask (Python)
      Lightweight REST API framework serving as the primary controller for handling image segmentation, depth estimation, and 3D reconstruction pipelines.
      Handles incoming requests from the Chrome extension and returns processed 3D model files.
      Routes are modular and support asynchronous handling for scalability.
- OpenCV
      Used for advanced image preprocessing: denoising, cropping, contour extraction, and background removal.
      Assists in isolating product objects and preparing them for depth estimation and segmentation.

- Node.js
      Supports utility microservices like file conversion, logging, cloud storage interactions (e.g., uploading to S3/GCS), or optional proxy handling for CORS and CDN management.
      Can also act as a bridge between the frontend Chrome extension and the Python backend in hybrid deployments.


## 🧠 AI/ML Models
- Ultralytics YOLOv8 (Object Detection)
     High-performance object detection model used for identifying and segmenting the core product object from cluttered e-commerce images.
     Supports bounding box refinement and mask prediction (with instance segmentation extension).

- MiDaS + SAM (Midas Anything Model)
        Combines MiDaS (depth estimation) with Meta's SAM (Segment Anything Model) to produce semantically accurate depth maps and segment masks from a single 2D image.
        Enables 3D shape reconstruction from a flat image using inferred depth, ideal for generating textured mesh surfaces.


## 🧪 Other Technologies & Libraries
- NumPy, SciPy
  Used in backend for numerical processing, mesh computation, and matrix operations involved in 3D reconstruction.
    
- Trimesh / Open3D / MeshLab (Optional)
  Libraries considered for cleaning, repairing, or optimizing 3D mesh outputs before visualization.
    
- Pandas / JSON Handling
  For handling metadata, logging, and communicating results and inference stats across backend modules.

## Reference Images:
### Object Detection using Yolov8
![image](https://github.com/user-attachments/assets/539be039-4182-427c-84ca-86d00c6e52e8)

### 3d Point Cloud Mesh
![image](https://github.com/user-attachments/assets/35a4f6e1-8218-4d1f-a593-379b83c74344)


## 📦 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/visu.ai.git
   cd visu.ai
   ```

2. Install node JS:

   ```
   # Download and install Chocolatey:
   powershell -c "irm https://community.chocolatey.org/install.ps1|iex"

   # Download and install Node.js
   choco install nodejs-lts --version="22"

   # Verify the Node.js version:
   node -v
   ```

3. Install Python 3:

   ```bash
   https://www.python.org/downloads/windows/
   ```

4. Install dependencies for :

   ```bash
   cd AI_Server && pip install -r requirements.txt
   ```

5. (Optional) Download YOLOv8 model and place it under AI_Server:
   ```python
   from ultralytics import YOLO
   YOLO('yolov8m.pt')  # Will auto-download if not present
   ```

---

## 🧩 Chrome Extension Setup

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer Mode**
3. Click **Load unpacked**
4. Select the `extension/` folder in this repository which is `ChromeExtension`

![image](https://github.com/user-attachments/assets/4e5a6bcc-795f-4263-a64a-f07fdbe4f645)


---

## 📦 Installation

1. Run the project :

   ```bash
   ./startup.ps1
   ```

---

## 📂 Folder Structure

```
Visu_Ai/

.
├── AI_Server
│   ├── app.py
│   ├── depth.py
│   ├── depth_maps
│   │   ├── Background.jpg
│   │   └── Object.jpg
│   ├── detect.py
│   ├── extension_data
│   │   ├── Background.jpg
│   │   └── Object.jpg
│   ├── merge_ply.py
│   ├── mesh.py
│   ├── midas-midas-v2-float.onnx
│   └── yolov8n.pt
├── ChromeExtension
│   ├── README.md
│   ├── background.js
│   ├── content.js
│   ├── evidence.jpeg
│   ├── manifest.json
│   ├── popup.html
│   └── popup.js
├── ChromeExtensionNode
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
├── LICENSE
├── README.md
└── threed-render
    ├── package-lock.json
    ├── package.json
    ├── public
    │   ├── favicon.ico
    │   ├── index.html
    │   ├── logo192.png
    │   ├── logo512.png
    │   ├── manifest.json
    │   ├── models
    │   │   ├── Backup.ply
    │   │   └── merge_scene.ply
    │   └── robots.txt
    └── src
        ├── 3DModelViewer.js
        ├── App.css
        ├── App.js
        ├── App.test.js
        ├── DoubleModelViewer.js
        ├── DualModelViewer.js
        ├── index.css
        ├── index.js
        ├── logo.svg
        ├── reportWebVitals.js
        └── setupTests.js
```

---

## 🤝 Contributing

Contributions are welcome! Please fork the repo and create a pull request with your improvements.

## 📄 License

Licensed under the [MIT License](LICENSE).

---

## 🙌 Acknowledgments

- [Ultralytics](https://github.com/ultralytics/ultralytics)
- [OpenCV](https://opencv.org/)
- [Flask](https://flask.palletsprojects.com/)
- [Chrome Extensions Docs](https://developer.chrome.com/docs/extensions/)

## Team Behind the Dream : 

![image](https://github.com/user-attachments/assets/3936d30e-bc3a-459a-b542-7434c7cc75ce)

