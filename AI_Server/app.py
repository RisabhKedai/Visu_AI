from flask import Flask, request, jsonify
import os
import uuid
import base64
from flask_cors import CORS
from detect import detect_and_crop_highest_confidence
from depth import generate_depth_map
from merge_ply import merge_ply_files
from mesh import generate_mesh

app = Flask(__name__)
CORS(app)

INPUT_FOLDER = "extension_data"
PLY_FOLDER = 'output_ply'
REACT_FOLDER = '../threed-render/public/models'
os.makedirs(INPUT_FOLDER, exist_ok=True)

def save_base64_image(base64_str, output_path):
    try:
        with open(output_path, "wb") as f:
            f.write(base64.b64decode(base64_str.split(',')[-1]))  # handles data:image/...;base64,
        return True
    except Exception as e:
        print(f"Failed to decode base64 image: {e}")
        return False

# @app.route("/detect", methods=["POST"])
# def detect():
#     data = request.get_json()
#     keyword = data.get("Keyword")
#     base64_images = data.get("Images")

#     if not keyword or not base64_images:
#         return jsonify({"status": "error", "message": "Missing 'keyword' or 'images'"}), 400

#     all_crops = []
#     for base64_img in base64_images:
#         unique_name = f"{uuid.uuid4()}.jpg"
#         image_path = os.path.join(INPUT_FOLDER, unique_name)

#         if not save_base64_image(base64_img, image_path):
#             continue  # skip failures

#         crops = detect_and_crop_by_keyword(image_path, keyword)
#         all_crops.extend(crops)
#         # TODO : Check the best image out of all

#     return jsonify({"status": "success", "matched_crops": all_crops})


############################# Used before Shuvam's logic

# @app.route("/detect", methods=["POST"])
# def detect():
#     keyword = request.form.get("Keyword")
#     uploaded_files = request.files.getlist("Images")
    
#     if not keyword or not uploaded_files:
#         print(keyword, uploaded_files)
#         return jsonify({"status": "error", "message": "Missing 'keyword' or 'images'"}), 400

#     highest_confidence_crop = {}
#     for uploaded_file in uploaded_files:
#         unique_name = f"{uuid.uuid4()}.jpg"
#         image_path = os.path.join(INPUT_FOLDER, unique_name)
        
#         uploaded_file.save(image_path)  # Direct save
        
#         confidence_crop = detect_and_crop_highest_confidence(image_path, keyword)
#         if(len(highest_confidence_crop.keys()) == 0 ) :
#             highest_confidence_crop = confidence_crop
#         else :
#             if(confidence_crop['confidence'] > highest_confidence_crop['confidence']):
#                 highest_confidence_crop = confidence_crop
    
#     os.rename(highest_confidence_crop["crop_path"], os.path.join(INPUT_FOLDER, 'Object.jpg'))

#     return jsonify({"status": "success", "matched_crops": all_crops})


################################################################



@app.route("/detect", methods=["POST"])
def detect():
    data = request.get_json()
    keyword = data.get("keyword")
    image_blobs = data.get("imageBlobs")
    
    print(data)
    print(keyword)
    
    if not keyword or not image_blobs:
        return jsonify({"status": "error", "message": "Missing 'keyword' or 'images'"}), 400

    all_crops = []
    highest_confidence_crop = {}
    
    for blob_data in image_blobs:
        print("Processing blob image...")
        unique_name = f"{uuid.uuid4()}.jpg"
        image_path = os.path.join(INPUT_FOLDER, unique_name)

        try:
            # Convert blob data (buffer object) to bytes
            if isinstance(blob_data, dict) and 'data' in blob_data:
                # Buffer object format: {"type": "Buffer", "data": [255, 216, 255, ...]}
                image_bytes = bytes(blob_data['data'])
            elif isinstance(blob_data, list):
                # Direct array format: [255, 216, 255, ...]
                image_bytes = bytes(blob_data)
            else:
                print(f"Unexpected blob data format: {type(blob_data)}")
                continue  # Skip this image
            
            # Save the image
            with open(image_path, "wb") as f:
                f.write(image_bytes)

            print("Devug 3")


            confidence_crop = detect_and_crop_highest_confidence(image_path, keyword)

            if confidence_crop:  # Ensure confidence_crop isn't None
                if not highest_confidence_crop:  # Check if highest_confidence_crop is None or empty
                    highest_confidence_crop = confidence_crop
                else:
                    if confidence_crop['confidence'] > highest_confidence_crop['confidence']:
                        highest_confidence_crop = confidence_crop
            else:
                print("⚠️ No valid object detected for cropping!")
            
            # Process the image
            # crops = detect_and_crop_by_keyword(image_path, keyword)
            # all_crops.extend(crops)
            
        except Exception as e:
            print(f"Failed to process blob image: {e}")
            continue  # Skip this image and continue with others

    
    print("Devug 1", highest_confidence_crop)
    object_path = os.path.join(INPUT_FOLDER, 'Object.jpg')
    if os.path.exists(object_path):
        os.remove(object_path)
    os.rename(highest_confidence_crop["crop_path"], object_path)
    return jsonify({"status": "success", "matched_crops": all_crops})


# @app.route("/object", methods=["POST"])
# def background():
#     data = request.get_json()
#     backGroundImage = data.get("Image")

#     if not backGroundImage:
#         return jsonify({"status": "error", "message": "Missing 'Image'"}), 400

#     unique_name = "Object.jpg"
#     image_path = os.path.join(INPUT_FOLDER, unique_name)
    
#     try:
#         with open(image_path, "wb") as f:
#             f.write(image_data) 
#         return jsonify({"status": "success", "message": "Image saved successfully"})
#     except Exception as e:
#         print(f"Failed to save image: {e}")
#         return jsonify({"status": "error", "message": f"Failed to save image: {str(e)}"}), 500



@app.route("/background", methods=["POST"])
def background():
    data = request.get_json()
    image_buffer_data = data.get("imageUrl")

    if not image_buffer_data:
        return jsonify({"status": "error", "message": "Missing 'Image'"}), 400

    unique_name = "Background.jpg"
    image_path = os.path.join(INPUT_FOLDER, unique_name)
    
    try:
        if isinstance(image_buffer_data, dict) and 'data' in image_buffer_data:
            # Buffer object format: {"type": "Buffer", "data": [255, 216, 255, ...]}
            image_bytes = bytes(image_buffer_data['data'])
        elif isinstance(image_buffer_data, list):
            # Direct array format: [255, 216, 255, ...]
            image_bytes = bytes(image_buffer_data)
        else:
            raise ValueError("Unexpected image data format")

        with open(image_path, "wb") as f:
            f.write(image_bytes) 
        return jsonify({"status": "success", "message": "Image saved successfully"})
    except Exception as e:
        print(f"Failed to save image: {e}")
        return jsonify({"status": "error", "message": f"Failed to save image: {str(e)}"}), 500
    

# @app.route("/background", methods=["POST"])
# def background():
#     data = request.get_json()
#     backGroundImage = data.get("Image")

#     if not backGroundImage:
#         return jsonify({"status": "error", "message": "Missing 'Image'"}), 400

#     unique_name = "Background.jpg"
#     image_path = os.path.join(INPUT_FOLDER, unique_name)
    
#     try:
#         with open(image_path, "wb") as f:
#             f.write(image_data) 
#         return jsonify({"status": "success", "message": "Image saved successfully"})
#     except Exception as e:
#         print(f"Failed to save image: {e}")
#         return jsonify({"status": "error", "message": f"Failed to save image: {str(e)}"}), 500
    

@app.route("/get3d", methods=["GET"])
def depthMap():
    print("inside depthMap")
    backGroundImage = os.path.join(INPUT_FOLDER, 'Background.jpg')
    objectImage = os.path.join(INPUT_FOLDER, 'Object.jpg')
    DEPTHMAP_FOLDER = "./depth_maps"
    os.makedirs(DEPTHMAP_FOLDER, exist_ok = True)
    generate_depth_map(backGroundImage, DEPTHMAP_FOLDER, 'Background.jpg')
    generate_depth_map(objectImage, DEPTHMAP_FOLDER, 'Object.jpg')
    generate_mesh(backGroundImage, os.path.join(DEPTHMAP_FOLDER, 'Background.jpg'), os.path.join(PLY_FOLDER))
    generate_mesh(objectImage, os.path.join(DEPTHMAP_FOLDER, 'Object.jpg'), os.path.join(PLY_FOLDER))
    merge_ply_files(os.path.join(PLY_FOLDER, 'Background.ply'), os.path.join(PLY_FOLDER, 'Object.ply'), os.path.join(REACT_FOLDER, 'merge_scene.ply'))
    return jsonify({"status": "success"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6000, debug=True)
