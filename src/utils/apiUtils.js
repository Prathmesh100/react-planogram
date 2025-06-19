import axios from "axios";

// Helper function to group products by shelf and bay
const groupProductsByShelfAndBay = (products) => {
  const shelfMap = {};
  const shelfHeights = {};
  const shelfProductCounts = {};
  const shelfMaxBay = {};

  products.forEach((product) => {
    const { shelf, bay, trayheight, shelfwidth } = product;
    const shelfKey = `${shelf}`;
    const shelfBayKey = `${shelf}-${bay}`;

    // Initialize shelf
    if (!shelfMap[shelf]) {
      shelfMap[shelf] = {};
    }

    // Track max bay per shelf
    if (!shelfMaxBay[shelf]) {
      shelfMaxBay[shelf] = bay;
    } else {
      shelfMaxBay[shelf] = Math.max(shelfMaxBay[shelf], bay);
    }

    // Track max height per shelf
    const heightInCm = trayheight;
    if (!shelfHeights[shelf]) {
      shelfHeights[shelf] = heightInCm;
    } else {
      shelfHeights[shelf] = Math.max(shelfHeights[shelf], heightInCm);
    }

    // Track number of products per shelf+bay
    if (!shelfProductCounts[shelfBayKey]) {
      shelfProductCounts[shelfBayKey] = 0;
    }
    shelfProductCounts[shelfBayKey]++;
  });

  // Build shelf map with all bays up to max
  Object.keys(shelfMaxBay).forEach((shelf) => {
    const maxBay = shelfMaxBay[shelf];
    const height = shelfHeights[shelf];

    for (let bay = 1; bay <= maxBay; bay++) {
      const key = `${shelf}-${bay}`;
      const productCount = shelfProductCounts[key] || 0;
      const totalPadding = productCount * 2;

      const shelfwidth = products.find(
        (p) => p.shelf === parseInt(shelf) && p.bay === bay
      )?.shelfwidth ?? 133; // fallback shelfwidth

      if (!shelfMap[shelf][bay]) {
        shelfMap[shelf][bay] = {};
      }

      shelfMap[shelf][bay].width = shelfwidth * 2;
      shelfMap[shelf][bay].height = height * 2;
    }
  });

  return shelfMap;
};

// Helper function to build shelves from map
const buildShelvesFromMap = (shelfMap) => {
  const shelves = [];

  const shelfNumbers = Object.keys(shelfMap).map(Number).sort((a, b) => a - b);

  shelfNumbers.forEach((shelfNo) => {
    const bays = shelfMap[shelfNo];
    const bayNumbers = Object.keys(bays).map(Number).sort((a, b) => a - b);

    const subShelves = bayNumbers.map((bayNo) => ({
      height: bays[bayNo].height,
      width: bays[bayNo].width,
    }));

    const totalWidth = subShelves.reduce((sum, bay) => sum + bay.width, 0);
    const maxHeight = Math.max(...subShelves.map((b) => b.height));

    shelves.push({
      height: maxHeight,
      width: totalWidth,
      subShelves,
    });
  });

  return shelves;
};

// Main function to fetch and build shelves from API
export const buildShelvesFromApi = async () => {
  try {
    const response = await axios.get("http://localhost:5000/planogramData/scenario%20N3ADAA");
    const products = response.data;
    const shelfMap = groupProductsByShelfAndBay(products);
    const dynamicShelves = buildShelvesFromMap(shelfMap);
    console.log("Dynamic Shelves:", dynamicShelves,shelfMap);
    return { dynamicShelves, products };
  } catch (error) {
    console.error("Failed to fetch and build shelves:", error);
    return { dynamicShelves: [], products: [] };
  }
}; 