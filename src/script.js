import * as cv from "@techstark/opencv-js";

// Draw keypoints on the canvas
function drawKeypoints(canvas, keypoints) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red'; // Set color for keypoints

    for (let i = 0; i < keypoints.size(); i++) {
        const keypoint = keypoints.get(i);
        const { pt, size } = keypoint;
        const { x, y } = pt;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fill();
    }
}

// Draw matches between keypoints on the canvas
function drawMatches(canvas, matches, keypoints1, keypoints2) {
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'blue'; // Set color for matches

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const idx1 = match.queryIdx;
        const idx2 = match.trainIdx;
        const keypoint1 = keypoints1.get(idx1);
        const keypoint2 = keypoints2.get(idx2);
        const pt1 = keypoint1.pt;
        const pt2 = keypoint2.pt;

        ctx.beginPath();
        ctx.moveTo(pt1.x, pt1.y);
        ctx.lineTo(pt2.x, pt2.y);
        ctx.stroke();
    }
}

async function compareImages(canvas, referenceImage, setResult) {
    const canvasCtx = canvas.getContext('2d');
    const canvasImageData = canvasCtx.getImageData(0, 0, canvas.width, canvas.height);

    const canvasMat = cv.matFromImageData(canvasImageData);
    const canvasGrayMat = new cv.Mat();
    cv.cvtColor(canvasMat, canvasGrayMat, cv.COLOR_RGBA2GRAY);

    const referenceMat = cv.imread(referenceImage, cv.IMREAD_GRAYSCALE);

    // Create ORB detector
    const orb = new cv.ORB();

    // Detect keypoints and compute descriptors for both images
    const keypoints1 = new cv.KeyPointVector();
    const descriptors1 = new cv.Mat();
    orb.detectAndCompute(canvasGrayMat, new cv.Mat(), keypoints1, descriptors1);

    const keypoints2 = new cv.KeyPointVector();
    const descriptors2 = new cv.Mat();
    orb.detectAndCompute(referenceMat, new cv.Mat(), keypoints2, descriptors2);

    // Create a Brute-Force Matcher
    const bfMatcher = new cv.BFMatcher(cv.NORM_HAMMING, true);

    // Match descriptors using K-nearest neighbor (KNN) algorithm
    const matches = new cv.DMatchVectorVector();
    bfMatcher.knnMatch(descriptors1, descriptors2, matches, 2);

    // Filter good matches based on Lowe's ratio test
    const goodMatches = [];
    for (let i = 0; i < matches.size(); i++) {
        const match = matches.get(i);
        if (match.size() === 2 && match.get(0).distance < 0.75 * match.get(1).distance) {
            goodMatches.push(match.get(0));
        }
    }

    // Visualize keypoints and matches
    drawKeypoints(canvas, keypoints1);
    drawKeypoints(canvas, keypoints2);
    drawMatches(canvas, goodMatches, keypoints1, keypoints2);

    const similarityScore = goodMatches.length;

    if (similarityScore >= 10) {
        setResult('Images match.');
        alert('Images match.');
    } else {
        setResult('Images do not match.');
        alert('Images do not match.');
    }

    // Clean up
    canvasMat.delete();
    canvasGrayMat.delete();
    referenceMat.delete();
    descriptors1.delete();
    descriptors2.delete();
    orb.delete();
    bfMatcher.delete();
}

export { compareImages };

