import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const DualModelViewer = ({
  roomModelPath, // Path to LivingRoom.ply
  chairModelPath, // Path to PatchWork chair.ply
  roomOrientation = "z", // Orientation for the room
  chairOrientation = "z", // Orientation for the chair
  roomScale = 1, // Scale factor for the room (can be number or {x, y, z} object)
  chairScale = 1, // Scale factor for the chair (can be number or {x, y, z} object)
  chairPosition = { x: 0, y: 0, z: 0 }, // Initial position for the chair
  backgroundColor = 0xf0f0f0, // Background color (default light gray)
  width = window.innerWidth,
  height = window.innerHeight,
}) => {
  const containerRef = useRef(null);
  const chairGroupRef = useRef(null); // Reference to chair group for orbital control

  // Function to apply scale to mesh
  const applyScale = (mesh, scale) => {
    if (typeof scale === "number") {
      // Uniform scaling
      mesh.scale.set(scale, scale, scale);
      console.log(`Applied uniform scale: ${scale}`);
    } else if (typeof scale === "object" && scale !== null) {
      // Non-uniform scaling with x, y, z properties
      const scaleX = scale.x || 1;
      const scaleY = scale.y || 1;
      const scaleZ = scale.z || 1;
      mesh.scale.set(scaleX, scaleY, scaleZ);
      console.log(
        `Applied non-uniform scale: x=${scaleX}, y=${scaleY}, z=${scaleZ}`
      );
    } else {
      console.warn("Invalid scale value, using default scale of 1");
      mesh.scale.set(1, 1, 1);
    }
  };

  // Function to apply multiple rotations based on orientation string
  const applyOrientation = (mesh, orientation) => {
    // Reset any existing rotations
    mesh.rotation.set(0, 0, 0);

    // Split the orientation string by commas and trim whitespace
    const rotations = orientation.split(",").map((rot) => rot.trim());

    console.log("Applying rotations:", rotations);

    // Apply each rotation in sequence
    rotations.forEach((rot) => {
      switch (rot.toLowerCase()) {
        case "x":
          mesh.rotateZ(-Math.PI / 2);
          break;
        case "-x":
          mesh.rotateZ(Math.PI / 2);
          break;
        case "y":
          mesh.rotateX(-Math.PI / 2);
          break;
        case "-y":
          mesh.rotateX(Math.PI / 2);
          break;
        case "z":
          mesh.rotateY(-Math.PI / 2);
          break;
        case "-z":
          mesh.rotateY(Math.PI / 2);
          break;
        default:
          console.warn(`Unknown rotation: ${rot}. Skipping.`);
          break;
      }
    });
  };

  // Function to create material based on geometry properties
  const createMaterial = (geometry, modelPath, isRoom = false) => {
    const hasColor = geometry.hasAttribute("color");
    const hasIndex = geometry.index !== null && geometry.index.count > 0;
    const hasNormals = geometry.hasAttribute("normal");
    const vertexCount = geometry.attributes.position
      ? geometry.attributes.position.count
      : 0;
    const hasTriangles = !hasIndex && vertexCount % 3 === 0 && vertexCount > 0;
    const canRenderAsMesh = hasIndex || hasTriangles;

    console.log(`Material creation for ${modelPath}:`, {
      hasIndex: hasIndex,
      indexCount: geometry.index ? geometry.index.count : 0,
      hasNormals: hasNormals,
      hasColor: hasColor,
      vertexCount: vertexCount,
      hasTriangles: hasTriangles,
      canRenderAsMesh: canRenderAsMesh,
    });

    // Handle color normalization
    if (hasColor) {
      const colorAttribute = geometry.getAttribute("color");
      if (colorAttribute && !colorAttribute.normalized) {
        const colorArray = colorAttribute.array;
        let maxValue = 0;
        for (let i = 0; i < colorArray.length; i++) {
          maxValue = Math.max(maxValue, colorArray[i]);
        }

        if (maxValue > 1) {
          console.log("Normalizing color values from 0-255 to 0-1 range");
          for (let i = 0; i < colorArray.length; i++) {
            colorArray[i] /= 255;
          }
          colorAttribute.needsUpdate = true;
        }
      }
    }

    if (canRenderAsMesh) {
      // Mesh material
      if (hasColor) {
        return new THREE.MeshStandardMaterial({
          vertexColors: true,
          metalness: isRoom ? 0.2 : 0.0,
          roughness: isRoom ? 0.8 : 1.0,
          color: 0xffffff,
          side: THREE.DoubleSide, // Important for non-indexed geometries
        });
      } else {
        // Try to load texture
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(
          modelPath.replace(".ply", ".jpg"),
          (tex) => {
            console.log("Texture loaded successfully");
            tex.flipY = false;
          },
          undefined,
          (error) => {
            console.warn("Could not load texture:", error);
          }
        );

        return new THREE.MeshStandardMaterial({
          map: texture,
          metalness: 0.1,
          roughness: 0.8,
          side: THREE.DoubleSide, // Important for non-indexed geometries
        });
      }
    } else {
      // Point cloud material
      return new THREE.PointsMaterial({
        size: 2,
        vertexColors: hasColor,
        color: hasColor ? 0xffffff : 0x808080,
      });
    }
  };

  // Function to create mesh from geometry
  const createMesh = (geometry, material, forceMesh = true) => {
    // Force mesh rendering unless explicitly creating point cloud
    const hasFaces = geometry.index !== null && geometry.index.count > 0;

    if (forceMesh || hasFaces) {
      // Compute normals for proper lighting if they don't exist
      if (!geometry.hasAttribute("normal")) {
        console.log("Computing vertex normals...");
        geometry.computeVertexNormals();
      }
      return new THREE.Mesh(geometry, material);
    } else {
      return new THREE.Points(geometry, material);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    scene.add(new THREE.AxesHelper(30));

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 2000);
    // Updated camera position to (800, 800, 800)
    camera.position.set(1000, 1000, 1000);
    // Make camera look at the center (0, 0, 0)
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    THREE.ColorManagement.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // DISABLE OrbitControls - camera will be fixed
    // const controls = new OrbitControls(camera, renderer.domElement);

    // Custom mouse controls for chair rotation only
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    let chairRotationX = 0;
    let chairRotationY = 0;

    const handleMouseDown = (event) => {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const handleMouseMove = (event) => {
      if (!isMouseDown || !chairGroupRef.current) return;

      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;

      // Update chair rotation based on mouse movement
      chairRotationY += deltaX * 0.01; // Horizontal mouse = Y rotation
      chairRotationX += deltaY * 0.01; // Vertical mouse = X rotation

      // Apply rotation to chair group
      chairGroupRef.current.rotation.y = chairRotationY;
      chairGroupRef.current.rotation.x = chairRotationX;

      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    // Add event listeners
    renderer.domElement.addEventListener("mousedown", handleMouseDown);
    renderer.domElement.addEventListener("mouseup", handleMouseUp);
    renderer.domElement.addEventListener("mousemove", handleMouseMove);
    renderer.domElement.addEventListener("mouseleave", handleMouseUp); // Stop rotation when mouse leaves

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Create a group for the chair that can be controlled independently
    const chairGroup = new THREE.Group();
    // Set initial position from props
    chairGroup.position.set(
      chairPosition.x || 0,
      chairPosition.y || 0,
      chairPosition.z || 0
    );
    scene.add(chairGroup);
    chairGroupRef.current = chairGroup;

    const plyLoader = new PLYLoader();
    let roomGeometry = null;
    let chairGeometry = null;

    // Load the room model (fixed)
    plyLoader.load(
      roomModelPath,
      (geometry) => {
        roomGeometry = geometry;
        console.log("Room model loaded");

        const material = createMaterial(geometry, roomModelPath, true);
        const mesh = createMesh(geometry, material, false); // Force mesh rendering

        // Apply orientation to room
        applyOrientation(mesh, roomOrientation);

        // Apply scale to room
        applyScale(mesh, roomScale);

        // Add frustum culling and LOD to handle large geometry
        mesh.frustumCulled = true;

        // For very large models, reduce opacity slightly when far away
        const originalMaterial = mesh.material;
        const checkDistance = () => {
          const distance = camera.position.distanceTo(mesh.position);
          if (distance > 800) {
            // When zoomed out, make room slightly transparent
            originalMaterial.transparent = true;
            originalMaterial.opacity = 0.8;
          } else {
            originalMaterial.transparent = false;
            originalMaterial.opacity = 1.0;
          }
        };

        // Store the distance check function for animation loop
        mesh.userData.checkDistance = checkDistance;

        scene.add(mesh);
      },
      (xhr) => {
        // console.log("Room: " + (xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.error("Error loading room model:", error);
      }
    );

    // Load the chair model (controllable)
    plyLoader.load(
      chairModelPath,
      (geometry) => {
        chairGeometry = geometry;
        console.log("Chair model loaded");

        const material = createMaterial(geometry, chairModelPath, false);
        const mesh = createMesh(geometry, material, false); // Force mesh rendering

        // Apply orientation to chair
        applyOrientation(mesh, chairOrientation);

        // Apply scale to chair
        applyScale(mesh, chairScale);

        // Add chair to the controllable group (position is set on the group above)
        chairGroup.add(mesh);
      },
      (xhr) => {
        // console.log("Chair: " + (xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.error("Error loading chair model:", error);
      }
    );

    // Animation loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // No need to update controls since camera is fixed
      // controls.update();

      // Check visibility optimization for massive room geometry
      scene.traverse((object) => {
        if (object.userData.checkVisibility) {
          object.userData.checkVisibility();
        }
      });

      //   Optional: Add automatic rotation to the chair only
      //   if (chairGroupRef.current) {
      //     chairGroupRef.current.rotation.y += 0.005;
      //   }

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);

      // Remove event listeners
      if (renderer.domElement) {
        renderer.domElement.removeEventListener("mousedown", handleMouseDown);
        renderer.domElement.removeEventListener("mouseup", handleMouseUp);
        renderer.domElement.removeEventListener("mousemove", handleMouseMove);
        renderer.domElement.removeEventListener("mouseleave", handleMouseUp);
      }

      if (containerRef.current && renderer.domElement.parentNode) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      roomGeometry?.dispose();
      chairGeometry?.dispose();
    };
  }, [
    roomModelPath,
    chairModelPath,
    roomOrientation,
    chairOrientation,
    roomScale,
    chairScale,
    chairPosition, // Add chairPosition to dependencies
    backgroundColor,
    width,
    height,
  ]);

  return (
    <div ref={containerRef} style={{ width, height }}>
      {/* Optional: Add controls UI */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          background: "rgba(0,0,0,0.7)",
          color: "white",
          padding: "10px",
          borderRadius: "5px",
          fontSize: "12px",
        }}
      >
        <div>Camera: Fixed at position (800, 800, 800) looking at center</div>
        <div>Mouse: Click and drag to rotate chair only</div>
        <div>Room: Fixed background environment</div>
        <div>
          Chair Position: ({chairPosition.x}, {chairPosition.y},{" "}
          {chairPosition.z})
        </div>
      </div>
    </div>
  );
};

export default DualModelViewer;
