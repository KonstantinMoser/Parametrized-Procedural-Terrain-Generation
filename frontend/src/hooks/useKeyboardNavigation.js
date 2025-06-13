import { useHotkeys } from "react-hotkeys-hook";

const useKeyboardNavigation = (
  currentIndex,
  history,
  handleSelectTerrainFromHistory,
  setCurrentIndex
) => {
  useHotkeys("up", () => {
    const newIndex = Math.max(currentIndex - 1, 0);
    setCurrentIndex(newIndex);
    const newSelectedItem = history[newIndex];
    if (newSelectedItem) {
      handleSelectTerrainFromHistory(newSelectedItem.hashedParams, newIndex);
    }
  });

  useHotkeys("down", () => {
    const newIndex = Math.min(currentIndex + 1, history.length - 1);
    setCurrentIndex(newIndex);
    const newSelectedItem = history[newIndex];
    if (newSelectedItem) {
      handleSelectTerrainFromHistory(newSelectedItem.hashedParams, newIndex);
    }
  });
};

export default useKeyboardNavigation;
