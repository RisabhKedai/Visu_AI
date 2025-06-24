import React from "react";
import ThreeDModelViewer from "./3DModelViewer";
// import DualModelViewer from "./DoubleModelViewer";
// import DualModelViewerV2 from "./DualModelViewer";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// function App() {
//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>3D Model Viewer</h2>
//       <ThreeDModelViewer
//         // modelPath="/models/Patchwork%20Chair.ply"
//         // orientation="x,y,-z"
//         // modelPath="./models/RisabhKedia.ply"
//         modelPath="./models/merged_scene.ply"
//         orientation=""
//         // scenePath="/models/Scene.ply"
//         width={800}
//         height={600}
//         scale={100000}
//       />

//       {/* <DualModelViewer
//         // roomModelPath="./models/Final2Background.ply"
//         chairModelPath="./models/Final1Risabh.ply"
//         roomOrientation="x,y,z" // Orientation for the room
//         // chairOrientation="x,y,-z" // Only affects the chair
//         width={800}
//         height={600}
//         // roomScale={10000} // Scale down the room to 80%
//         chairScale={100000} // Scale up the chair to 120%
//         backgroundColor={0x000000} // Black background
//         chairPosition={{ x: 10, y: 50, z: 20 }}
//       /> */}

//       {/* <DualModelViewerV2
//         roomModelPath="./models/Final2Background.ply"
//         chairModelPath="./models/Final1Risabh.ply"
//         // roomOrientation="x,y,z" // Orientation for the room
//         chairOrientation="" // Only affects the chair
//         width={800}
//         height={600}
//         roomScale={450000} // Scale down the room to 80%
//         chairScale={90000} // Scale up the chair to 120%
//         backgroundColor={0x000000} // Black background
//         chairPosition={{ x: 0, y: 0, z: 80 }}
//       /> */}
//     </div>
//   );
// }

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Root route - shows nothing/minimal content */}
          <Route path="/" element={<h1>HELLO WORLD</h1>} />

          {/* Output route */}
          <Route
            path="/output"
            element={
              <ThreeDModelViewer
                // modelPath="/models/Patchwork%20Chair.ply"
                // orientation="x,y,-z"
                // modelPath="./models/RisabhKedia.ply"
                modelPath="/models/merge_scene.ply"
                orientation=""
                // scenePath="/models/Scene.ply"
                width={800}
                height={600}
                scale={100000}
              />
            }
          />

          {/* Backup route */}
          <Route
            path="/backup"
            element={
              <ThreeDModelViewer
                // modelPath="/models/Patchwork%20Chair.ply"
                // orientation="x,y,-z"
                // modelPath="./models/RisabhKedia.ply"
                modelPath="./models/Backup.ply"
                orientation=""
                // scenePath="/models/Scene.ply"
                width={800}
                height={600}
                scale={100000}
              />
            }
          />

          {/* Redirect any unknown routes to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
