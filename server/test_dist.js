const calculateEuclideanDistance = (desc1, desc2) => {
  if (!desc1 || !desc2 || desc1.length !== desc2.length) return 1.0;
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    const diff = desc1[i] - desc2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
};

const extractCanvasFaceDescriptor = () => {
  const descriptor = new Array(128).fill(0).map(() => Math.random()); // Simulating positive luminance
  let sumSq = 0;
  for (let i = 0; i < 128; i++) {
    sumSq += descriptor[i] * descriptor[i];
  }
  const norm = Math.sqrt(sumSq) || 1;
  return descriptor.map((val) => Number((val / norm).toFixed(6)));
};

const desc1 = extractCanvasFaceDescriptor();
const desc2 = extractCanvasFaceDescriptor();
console.log('Distance:', calculateEuclideanDistance(desc1, desc2));
