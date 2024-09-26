import { AssetType } from "../Constants.js";

export class AssetManager {
    private constructor(){}
    
    private static assetsLoaded = 0;
    private static imageAssets = new Map<string, HTMLImageElement>();
    private static assetList: [AssetType, string][] = [];
    private static requiredAssetList: [AssetType, string][] = [];

    public static RequestAsset(type: AssetType, source: string, required=false): void {
        (required ? this.requiredAssetList : this.assetList).push([type, source]);
    }

    public static GetImage(id: string) {
        const ret = this.imageAssets.get(id);
        if (ret === undefined)
            throw `Missing asset "${id}".`;
        return ret;
    }

    public static Progress(): number {
        if (this.assetList.length === 0) return 1;
        return this.assetsLoaded / this.assetList.length;
    }

    public static async LoadRequiredAssets() {
        const start = Date.now();
        await Promise.all(this.requiredAssetList.map(asset => this.LoadAsset(asset, false)));
        const diff = Date.now() - start;
        console.debug(`Loaded required assets in ${diff}ms`);
    }

    public static async LoadAllAssets() {
        const start = Date.now();
        await Promise.all(this.assetList.map(asset => this.LoadAsset(asset)));
        const diff = Date.now() - start;
        console.debug(`Loaded all other assets in ${diff}ms`);
    }

    private static LoadAsset(asset: [AssetType, string], increment = true): Promise<void> {
        const assetPath = asset[1];
        return new Promise((resolve, reject) => {
            switch (asset[0]) {
                case AssetType.Image:
                    const img = new Image();
                    img.addEventListener('load', e => {
                        if (increment) this.assetsLoaded++;
                        this.imageAssets.set(asset[1], img);
                        console.debug(`Loaded asset "${asset[1]}".`);
                        resolve();
                    });
                    img.addEventListener('error', e => reject(e));
                    console.debug(`Requesting asset "${asset[1]}"...`);
                    img.src = assetPath;
                    break;
            
                default:
                    break;
            }
        });
    }
}