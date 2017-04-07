export const foregroundColorFromBackground = (color: string) =>
  parseInt(color[1], 16) + parseInt(color[3], 16) + parseInt(color[5], 16) > 23
    ? 'black'
    : 'white';
