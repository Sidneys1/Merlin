export const BUILD_TYPE = ('BUILDMODE' === ('BUILD'+'MODE')) ? 'debug' : 'production';

export const DEBUG_FONT = "12pt monospace";
export const BUTTON_FONT = '12pt sans-serif';
export const MAIN_MENU_FONT = '50px sans-serif';

export const RAIN_HEIGHT = 250;

export enum AssetType {
    Image,
    Sound,
}

export const REQUIRED_ASSETS: [AssetType, string][] = [
    // [AssetType.Image, 'image.svg'],
];

export const ASSETS: [AssetType, string][] = [
    // [AssetType.Image, 'image.svg'],
];
