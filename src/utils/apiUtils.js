import axios from "axios";

// Helper function to group products by shelf and bay
const groupProductsByShelfAndBay = (products) => {
  const shelfMap = {};
  const shelfHeights = {};
  const shelfWidths = {};
  const allShelves = new Set();
  let globalMaxBay = 0;

  products.forEach((product) => {
    const { shelf, bay, trayheight, shelfwidth } = product;

    allShelves.add(shelf);

    globalMaxBay = Math.max(globalMaxBay, bay);

    if (!shelfHeights[shelf] || trayheight > shelfHeights[shelf]) {
      shelfHeights[shelf] = trayheight;
    }

    if (!shelfWidths[shelf] && shelfwidth) {
      shelfWidths[shelf] = shelfwidth;
    }
  });

  allShelves.forEach((shelf) => {
    shelfMap[shelf] = {};

    const height = shelfHeights[shelf] ?? 60;
    const width = shelfWidths[shelf] ?? 133;

    for (let bay = 1; bay <= globalMaxBay; bay++) {
      shelfMap[shelf][bay] = {
        width: width * 2,
        height: height * 2,
      };
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