import { toast } from 'react-toastify';

const EMPTY_SPACE_WIDTH = 20;

export function isWithinShelfWidth(shelfLines, shelfIdx, subShelfIdx, position, itemWidth, source) {
  const shelfRow = shelfLines[shelfIdx][subShelfIdx];
  let availableWidth = 0;
  let currentIndex = position;

  while (currentIndex < shelfRow.length && availableWidth < itemWidth) {
    const slot = shelfRow[currentIndex];
    const isSameItemBeingMoved =
      source.droppableId === `shelf-line-${shelfIdx}-${subShelfIdx}` &&
      currentIndex === source.index;
    if (isSameItemBeingMoved) {
      availableWidth += itemWidth;
    } else if (slot?.isEmpty) {
      availableWidth += slot.width;
    } else {
      break;
    }
    currentIndex++;
  }
  return availableWidth >= itemWidth;
}

export function onDragEnd({
  result,
  shelfLines,
  setShelfLines,
  unplacedItems,
  setUnplacedItems,
  EMPTY_SPACE_WIDTH = 20,
  isWithinShelfWidthFn = isWithinShelfWidth,
}) {
  const { source, destination } = result;
  if (!destination) return;

  let item = null;
  if (source.droppableId === 'items') {
    item = unplacedItems[source.index];
  } else if (source.droppableId.startsWith('shelf-line-')) {
    const [shelfIdx, subShelfIdx] = source.droppableId.replace('shelf-line-', '').split('-').map(Number);
    item = shelfLines[shelfIdx][subShelfIdx][source.index];
  }

  const newShelfLines = shelfLines.map(shelf => shelf.map(subShelf => [...subShelf]));
  const newUnplacedItems = [...unplacedItems];

  // Handle drag from inventory to shelf
  if (source.droppableId === 'items' && destination.droppableId.startsWith('shelf-line-')) {
    const [shelfIdx, subShelfIdx] = destination.droppableId.replace('shelf-line-', '').split('-').map(Number);
    const destShelf = newShelfLines[shelfIdx][subShelfIdx];
    if (!isWithinShelfWidthFn(shelfLines, shelfIdx, subShelfIdx, destination.index, item.width, source)) {
      toast.error(`Cannot place '${item.name}' here - would exceed shelf width.`);
      return;
    }
    let totalWidth = 0;
    let endIndex = destination.index;
    while (endIndex < destShelf.length && totalWidth < item.width) {
      const slot = destShelf[endIndex];
      if (!slot?.isEmpty) break;
      totalWidth += slot.width;
      endIndex++;
    }
    if (totalWidth < item.width) {
      toast.error(`Not enough consecutive empty space for '${item.name}'`);
      return;
    }
    destShelf.splice(destination.index, endIndex - destination.index, item);
    const leftover = totalWidth - item.width;
    if (leftover > 0) {
      destShelf.splice(destination.index + 1, 0, {
        id: `empty-${shelfIdx}-${subShelfIdx}-${Date.now()}`,
        width: leftover,
        height: 0,
        bgColor: '#f0f0f0',
        isEmpty: true,
      });
    }
    newUnplacedItems.splice(source.index, 1);
  }
  // Handle drag from shelf to inventory
  else if (source.droppableId.startsWith('shelf-line-') && destination.droppableId === 'items') {
    const [shelfIdx, subShelfIdx] = source.droppableId.replace('shelf-line-', '').split('-').map(Number);
    const sourceShelf = newShelfLines[shelfIdx][subShelfIdx];
    const removedItem = sourceShelf.splice(source.index, 1)[0];
    const emptySpaces = [];
    let remainingWidth = removedItem.width;
    const defaultHeight = 0;
    while (remainingWidth > 0) {
      const thisWidth = Math.min(remainingWidth, EMPTY_SPACE_WIDTH);
      emptySpaces.push({
        id: `empty-${shelfIdx}-${subShelfIdx}-${Date.now()}-${Math.random()}`,
        width: thisWidth,
        height: defaultHeight,
        bgColor: '#f0f0f0',
        isEmpty: true,
      });
      remainingWidth -= thisWidth;
    }
    sourceShelf.splice(source.index, 0, ...emptySpaces);
    newUnplacedItems.splice(destination.index, 0, removedItem);
  }
  // Handle moving within inventory
  else if (source.droppableId === 'items' && destination.droppableId === 'items') {
    const [moved] = newUnplacedItems.splice(source.index, 1);
    newUnplacedItems.splice(destination.index, 0, moved);
  }
  // Handle moving within or between shelves
  else if (
    source.droppableId.startsWith('shelf-line-') &&
    destination.droppableId.startsWith('shelf-line-')
  ) {
    const [srcShelfIdx, srcSubShelfIdx] = source.droppableId.replace('shelf-line-', '').split('-').map(Number);
    const [destShelfIdx, destSubShelfIdx] = destination.droppableId.replace('shelf-line-', '').split('-').map(Number);
    const sourceShelf = newShelfLines[srcShelfIdx][srcSubShelfIdx];
    const destShelf = newShelfLines[destShelfIdx][destSubShelfIdx];
    const isSamePosition =
      source.index === destination.index &&
      srcShelfIdx === destShelfIdx &&
      srcSubShelfIdx === destSubShelfIdx;
    if (isSamePosition) return;
    const [removedItem] = sourceShelf.splice(source.index, 1);
    let remainingWidth = removedItem.width;
    const emptySpaces = [];
    while (remainingWidth > 0) {
      const thisWidth = Math.min(remainingWidth, EMPTY_SPACE_WIDTH);
      emptySpaces.push({
        id: `empty-${srcShelfIdx}-${srcSubShelfIdx}-${Date.now()}-${Math.random()}`,
        width: thisWidth,
        height: 0,
        bgColor: '#f0f0f0',
        isEmpty: true,
      });
      remainingWidth -= thisWidth;
    }
    sourceShelf.splice(source.index, 0, ...emptySpaces);
    let totalWidth = 0;
    let endIndex = destination.index;
    while (endIndex < destShelf.length && totalWidth < removedItem.width) {
      const cell = destShelf[endIndex];
      if (!cell?.isEmpty) break;
      totalWidth += cell.width;
      endIndex++;
    }
    if (totalWidth < removedItem.width) {
      toast.error(`Not enough space to place '${removedItem.name}'.`);
      return;
    }
    destShelf.splice(destination.index, endIndex - destination.index, removedItem);
    const leftover = totalWidth - removedItem.width;
    if (leftover > 0) {
      destShelf.splice(destination.index + 1, 0, {
        id: `empty-${destShelfIdx}-${destSubShelfIdx}-${Date.now()}-${Math.random()}`,
        width: leftover,
        height: 0,
        bgColor: '#f0f0f0',
        isEmpty: true,
      });
    }
  }
  setShelfLines(newShelfLines);
  setUnplacedItems(newUnplacedItems);
}

// Main: generatePayload
export function generatePayload({ shelfLines, SHELVES, zoomState }) {
  const zoomFactor = zoomState.newValue;
  const payload = {
    shelves: shelfLines.map((shelfLine, shelfIdx) => ({
      shelfId: `shelf-${shelfIdx + 1}`,
      name: SHELVES[shelfIdx].name || `Shelf ${shelfIdx + 1}`,
      subShelves: shelfLine.map((subShelf, subShelfIdx) => {
        const items = subShelf.reduce((acc, item, index) => {
          if (!item.isEmpty) {
            let xPosition = 0;
            for (let i = 0; i < index; i++) {
              xPosition += subShelf[i].width;
            }
            const originalX = (xPosition / zoomFactor) / 2;
            const subShelfOffset = (subShelfIdx * (SHELVES[shelfIdx].subShelves[subShelfIdx].width / 2)) / zoomFactor;
            acc.push({
              id: item.id.split('_')[0],
              name: item.name,
              position: {
                x: originalX + subShelfOffset,
                y: 0,
                width: (item.width / zoomFactor) * 5,
                height: (item.height / zoomFactor) * 5,
              },
              metadata: {
                brand: item.brand,
                price: item.price,
                description: item.description,
              },
            });
          }
          return acc;
        }, []);
        return {
          subShelfId: `subshelf-${shelfIdx + 1}-${subShelfIdx + 1}`,
          width: (SHELVES[shelfIdx].subShelves[subShelfIdx].width / 2) / zoomFactor,
          height: (SHELVES[shelfIdx].subShelves[subShelfIdx].height / 2) / zoomFactor,
          items,
        };
      }),
    })),
  };
  console.log('Planogram Payload:', JSON.stringify(payload, null, 2));
  return payload;
} 