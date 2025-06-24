import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const ThreeDModelViewer = ({
  modelPath,
  orientation = "z", // Default orientation - accepts single or comma-separated rotations
  scale = 1.0, // Uniform scale factor (default: 1.0 = original size)
  width = window.innerWidth,
  height = window.innerHeight,
}) => {
  const containerRef = useRef(null);

  // Function to apply multiple rotations based on orientation string
  const applyOrientation = (mesh, orientation) => {
    console.log("🔄 Starting orientation application...");

    // Reset any existing rotations
    mesh.rotation.set(0, 0, 0);
    console.log("✅ Reset mesh rotations to (0, 0, 0)");

    // Split the orientation string by commas and trim whitespace
    const rotations = orientation.split(",").map((rot) => rot.trim());

    console.log("🎯 Applying rotations:", rotations);

    // Apply each rotation in sequence
    rotations.forEach((rot, index) => {
      console.log(
        `🔄 Processing rotation ${index + 1}/${rotations.length}: "${rot}"`
      );

      switch (rot.toLowerCase()) {
        case "x":
          // Rotate 90 degrees around Z axis (positive X becomes up)
          mesh.rotateZ(-Math.PI / 2);
          console.log("✅ Applied X rotation: rotateZ(-π/2)");
          break;
        case "-x":
          // Rotate -90 degrees around Z axis (negative X becomes up)
          mesh.rotateZ(Math.PI / 2);
          console.log("✅ Applied -X rotation: rotateZ(π/2)");
          break;
        case "y":
          // Y axis rotation - rotate around X axis
          mesh.rotateX(-Math.PI / 2);
          console.log("✅ Applied Y rotation: rotateX(-π/2)");
          break;
        case "-y":
          // Negative Y axis rotation
          mesh.rotateX(Math.PI / 2);
          console.log("✅ Applied -Y rotation: rotateX(π/2)");
          break;
        case "z":
          // Z axis rotation - rotate around Y axis
          mesh.rotateY(-Math.PI / 2);
          console.log("✅ Applied Z rotation: rotateY(-π/2)");
          break;
        case "-z":
          // Negative Z axis rotation
          mesh.rotateY(Math.PI / 2);
          console.log("✅ Applied -Z rotation: rotateY(π/2)");
          break;
        default:
          console.warn(`⚠️ Unknown rotation: "${rot}". Skipping.`);
          break;
      }
    });

    console.log("🏁 Final mesh rotation:", {
      x: mesh.rotation.x,
      y: mesh.rotation.y,
      z: mesh.rotation.z,
    });
  };

  // Function to apply uniform scaling
  const applyScale = (mesh, scaleFactor) => {
    console.log("📏 Applying uniform scale...");
    console.log("📊 Scale factor:", scaleFactor);

    // Apply uniform scaling to all axes
    mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);

    console.log("✅ Scale applied - final mesh scale:", {
      x: mesh.scale.x,
      y: mesh.scale.y,
      z: mesh.scale.z,
    });
  };

  useEffect(() => {
    console.log("🚀 Starting ThreeDModelViewer initialization...");
    console.log("📁 Model path:", modelPath);
    console.log("🎯 Orientation:", orientation);
    console.log("📏 Scale factor:", scale);
    console.log("📐 Dimensions:", { width, height });

    if (!containerRef.current) {
      console.error("❌ Container ref is null - cannot initialize viewer");
      return;
    }
    console.log("✅ Container ref is available");

    // Initialize scene
    console.log("🌍 Creating THREE.js scene...");
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x00000); // Light gray background
    console.log("✅ Scene created with light gray background");

    // Add axes helper for debugging
    const axesHelper = new THREE.AxesHelper(30);
    scene.add(axesHelper);
    console.log("✅ Added axes helper (size: 30)");

    // Initialize camera
    console.log("📷 Creating camera...");
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 2000);
    camera.position.set(0, 9, 1500);
    console.log("✅ Camera created and positioned at (0, 9, 1500)");
    console.log("📷 Camera settings:", {
      fov: 75,
      aspect: width / height,
      near: 0.01,
      far: 2000,
    });

    // Initialize renderer
    console.log("🎨 Creating renderer...");
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    THREE.ColorManagement.enabled = true;
    console.log("✅ Renderer created with settings:", {
      antialias: true,
      pixelRatio: window.devicePixelRatio,
      size: { width, height },
      colorManagement: true,
    });

    // Append renderer to container
    containerRef.current.appendChild(renderer.domElement);
    console.log("✅ Renderer DOM element appended to container");

    // Initialize controls
    console.log("🎮 Creating orbit controls...");
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();
    console.log("✅ Orbit controls created and updated");

    // Add lighting
    console.log("💡 Setting up lighting...");
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    console.log("✅ Added ambient light (color: 0x404040, intensity: 0.6)");

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    console.log(
      "✅ Added directional light (color: 0xffffff, intensity: 0.8, position: (1,1,1))"
    );

    // Initialize loader and geometry storage
    let loadedGeometry = null;
    const plyLoader = new PLYLoader();
    console.log("📦 PLY loader initialized");

    // Function to create mesh from geometry
    const createMeshFromGeometry = (geometry) => {
      console.log("🔧 Processing loaded geometry...");
      loadedGeometry = geometry;

      // Analyze geometry
      const vertexCount = geometry.attributes.position
        ? geometry.attributes.position.count
        : 0;
      const hasFaces = false;
      // geometry.index !== null && geometry.index.count > 0;
      const hasColor = geometry.hasAttribute("color");
      const hasNormals = geometry.hasAttribute("normal");
      const hasUV = geometry.hasAttribute("uv");

      console.log("📊 Geometry analysis:", {
        vertexCount,
        hasFaces,
        hasColor,
        hasNormals,
        hasUV,
        indexCount: geometry.index ? geometry.index.count : 0,
        attributes: Object.keys(geometry.attributes),
      });

      // Debug color attribute in detail
      if (geometry.hasAttribute("color")) {
        const colorAttr = geometry.getAttribute("color");
        console.log("🎨 Color attribute details:", {
          itemSize: colorAttr.itemSize,
          count: colorAttr.count,
          normalized: colorAttr.normalized,
          arrayLength: colorAttr.array.length,
          firstFewValues: Array.from(colorAttr.array.slice(0, 12)), // First 4 vertices RGB values
        });
      }

      // Compute bounding box for debugging
      geometry.computeBoundingBox();
      const boundingBox = geometry.boundingBox;
      console.log("📦 Geometry bounding box:", {
        min: {
          x: boundingBox.min.x,
          y: boundingBox.min.y,
          z: boundingBox.min.z,
        },
        max: {
          x: boundingBox.max.x,
          y: boundingBox.max.y,
          z: boundingBox.max.z,
        },
        size: {
          x: boundingBox.max.x - boundingBox.min.x,
          y: boundingBox.max.y - boundingBox.min.y,
          z: boundingBox.max.z - boundingBox.min.z,
        },
      });

      let material;
      let mesh;

      if (hasFaces) {
        // This is a mesh model - render as solid surface
        console.log("🏗️ Rendering as MESH (solid surface)");

        // Compute normals for proper lighting if they don't exist
        if (!geometry.hasAttribute("normal")) {
          console.log("🔧 Computing vertex normals...");
          geometry.computeVertexNormals();
          console.log("✅ Vertex normals computed");
        } else {
          console.log("✅ Geometry already has normals");
        }

        if (hasColor) {
          console.log("🎨 Processing vertex colors...");

          // Normalize color values if they're in 0-255 range
          const colorAttribute = geometry.getAttribute("color");
          if (colorAttribute && !colorAttribute.normalized) {
            // Check if colors are in 0-255 range (typical for PLY files)
            const colorArray = colorAttribute.array;
            let maxValue = 0;
            for (let i = 0; i < colorArray.length; i++) {
              maxValue = Math.max(maxValue, colorArray[i]);
            }

            console.log("🔍 Color value analysis - max value:", maxValue);

            // If max value is > 1, assume it's in 0-255 range and normalize
            if (maxValue > 1) {
              console.log(
                "🔄 Normalizing color values from 0-255 to 0-1 range..."
              );
              for (let i = 0; i < colorArray.length; i++) {
                colorArray[i] /= 255;
              }
              colorAttribute.needsUpdate = true;
              console.log("✅ Color values normalized");
            } else {
              console.log("✅ Color values already in 0-1 range");
            }
          }

          material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            metalness: 0.0, // Reduce metalness to show colors better
            roughness: 1.0, // Increase roughness to show colors better
            color: 0xffffff, // Base color
          });
          console.log("✅ Created MeshStandardMaterial with vertex colors");
        } else {
          console.log("🖼️ Attempting to load texture...");

          // Try to load texture
          const textureLoader = new THREE.TextureLoader();
          const texturePath = modelPath.replace(".ply", ".jpg");
          console.log("🔍 Looking for texture at:", texturePath);

          const texture = textureLoader.load(
            texturePath,
            (tex) => {
              console.log("✅ Texture loaded successfully");
              tex.flipY = false;
            },
            (progress) => {
              console.log("📥 Texture loading progress:", progress);
            },
            (error) => {
              console.warn("⚠️ Could not load texture:", error);
            }
          );

          material = new THREE.MeshStandardMaterial({
            map: texture,
            metalness: 0.1,
            roughness: 0.8,
            color: 0xcccccc, // Default gray color
          });
          console.log("✅ Created MeshStandardMaterial with texture");
        }

        mesh = new THREE.Mesh(geometry, material);
        console.log("✅ Created THREE.Mesh");
      } else {
        // This is a point cloud - render as points
        console.log("☁️ Rendering as POINT CLOUD");

        // Handle color normalization for point clouds too
        if (hasColor) {
          console.log("🎨 Processing point cloud colors...");
          const colorAttribute = geometry.getAttribute("color");
          if (colorAttribute && !colorAttribute.normalized) {
            const colorArray = colorAttribute.array;
            let maxValue = 0;
            for (let i = 0; i < colorArray.length; i++) {
              maxValue = Math.max(maxValue, colorArray[i]);
            }

            console.log("🔍 Point cloud color analysis - max value:", maxValue);

            if (maxValue > 1) {
              console.log(
                "🔄 Normalizing point cloud color values from 0-255 to 0-1 range..."
              );
              for (let i = 0; i < colorArray.length; i++) {
                colorArray[i] /= 255;
              }
              colorAttribute.needsUpdate = true;
              console.log("✅ Point cloud colors normalized");
            }
          }
        }

        material = new THREE.PointsMaterial({
          size: 2, // Slightly larger points for better visibility
          vertexColors: hasColor,
          color: hasColor ? 0xffffff : 0x808080, // White base color when using vertex colors, gray otherwise
        });
        console.log("✅ Created PointsMaterial for point cloud");

        mesh = new THREE.Points(geometry, material);
        console.log("✅ Created THREE.Points");
      }

      // Apply the specified orientation
      console.log("🎯 Applying orientation transformations...");
      applyOrientation(mesh, orientation);

      // Apply the uniform scale
      console.log("📏 Applying scale transformations...");
      applyScale(mesh, scale);

      // Add mesh to scene
      console.log("🌍 Adding mesh to scene...");
      scene.add(mesh);
      console.log("✅ Mesh added to scene");

      // Log final mesh properties
      console.log("📊 Final mesh properties:", {
        position: {
          x: mesh.position.x,
          y: mesh.position.y,
          z: mesh.position.z,
        },
        rotation: {
          x: mesh.rotation.x,
          y: mesh.rotation.y,
          z: mesh.rotation.z,
        },
        scale: { x: mesh.scale.x, y: mesh.scale.y, z: mesh.scale.z },
        visible: mesh.visible,
        type: mesh.type,
      });
    };

    // Load the model
    console.log("📦 Starting model loading...");
    plyLoader.load(
      modelPath,
      (geometry) => {
        console.log("✅ Model loaded successfully!");
        createMeshFromGeometry(geometry);
      },
      (xhr) => {
        const progress = xhr.total ? (xhr.loaded / xhr.total) * 100 : 0;
        console.log(
          `📥 Loading progress: ${progress.toFixed(1)}% (${xhr.loaded}/${
            xhr.total || "unknown"
          } bytes)`
        );
      },
      (error) => {
        console.error("❌ Error loading model:", error);
        console.error("🔍 Error details:", {
          message: error.message,
          stack: error.stack,
          modelPath: modelPath,
        });
      }
    );

    // Animation loop
    let animationFrameId;
    let frameCount = 0;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Log first few frames for debugging
      if (frameCount < 5) {
        console.log(`🎬 Animation frame ${frameCount + 1}`);
      } else if (frameCount === 5) {
        console.log(
          "🎬 Animation loop running smoothly (suppressing further frame logs)"
        );
      }

      controls.update();
      renderer.render(scene, camera);
      frameCount++;
    };

    console.log("🎬 Starting animation loop...");
    animate();

    // Cleanup function
    return () => {
      console.log("🧹 Cleaning up ThreeDModelViewer...");

      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        console.log("✅ Animation frame cancelled");
      }

      if (
        containerRef.current &&
        renderer.domElement.parentNode === containerRef.current
      ) {
        containerRef.current.removeChild(renderer.domElement);
        console.log("✅ Renderer DOM element removed from container");
      }

      renderer.dispose();
      console.log("✅ Renderer disposed");

      if (loadedGeometry) {
        loadedGeometry.dispose();
        console.log("✅ Geometry disposed");
      }

      console.log("🏁 Cleanup completed");
    };
  }, [modelPath, orientation, scale, width, height]);

  return <div ref={containerRef} style={{ width, height }} />;
};

export default ThreeDModelViewer;
