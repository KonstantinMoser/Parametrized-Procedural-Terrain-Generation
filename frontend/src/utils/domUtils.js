// Helper function to reset the DOM elements related to terrain rendering
export const resetTerrainDOM = () => {
  const textureToggle = document.getElementById("texture-toggle");
  textureToggle.checked = false;
  const rotationToggle = document.getElementById("rotation-toggle");
  rotationToggle.checked = false;
  const heightMultiplier = document.getElementById("heightMultiplierSlider");
  heightMultiplier.value = 20;
};










