import { AssetType } from "../Constants.js";

import {Howl, HowlOptions} from "howler";

type ResolveFn<T> = (value:T) => void;
type RejectFn = (reason?: any) => void;

type _AssetBase = {
    source: string;
    fallback: string[];
    reject: RejectFn;
};

type ImageAsset = _AssetBase&{
    type: AssetType.Image;
    resolve: ResolveFn<HTMLImageElement>;
};

type SoundAsset = _AssetBase&{
    type: AssetType.Sound;
    resolve: ResolveFn<Howl>;
};

type AssetEntry = ImageAsset | SoundAsset;

export class AssetManager {
    private constructor(){}
    
    private static assetsLoaded = 0;
    private static imageAssets = new Map<string, HTMLImageElement>();
    private static soundAssets = new Map<string, Howl>();
    private static assetList: AssetEntry[] = [];
    private static requiredAssetList: AssetEntry[] = [];

    // public static RequestImage(source: string, ...fallback: string[], required=false): Promise<HTMLImageElement> {
    //     return new Promise<HTMLImageElement>((resolve, reject) => {
    //         (required ? this.requiredAssetList : this.assetList).push({
    //             type: AssetType.Image,
    //             source,
    //             resolve,
    //             reject
    //         });
    //     });
    // }

    public static RequestAsset(type: AssetType.Image, source: string, required?: boolean, ...fallback: string[]): Promise<HTMLImageElement>;
    public static RequestAsset(type: AssetType.Sound, source: string, required?: boolean, ...fallback: string[]): Promise<Howl>;
    public static RequestAsset(type: AssetType, source: string, required=false, ...fallback: string[]): Promise<HTMLImageElement|Howl> {
        return new Promise<HTMLImageElement|Howl>((resolve, reject) => {
            (required ? this.requiredAssetList : this.assetList).push({
                type,
                source,
                resolve,
                reject,
                fallback
            });
        });
    }

    public static RequestAssets(type: AssetType.Image, ...sources: string[]): Promise<HTMLImageElement>[];
    public static RequestAssets(type: AssetType.Sound, ...sources: string[]): Promise<Howl>[];
    public static RequestAssets(type: AssetType, ...sources: string[]): Promise<HTMLImageElement|Howl>[] {
        //@ts-ignore
        return sources.map(s => this.RequestAsset(type, s));
    }

    public static GetImage(id: string): HTMLImageElement {
        const ret = this.imageAssets.get(id);
        if (ret === undefined)
            throw `Missing asset "${id}".`;
        return ret;
    }

    public static GetSound(id: string): Howl {
        const ret = this.soundAssets.get(id);
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

    // private static _attemptLoadImage(accept, reject, source: string, ...fallback: string[]): Promise<boolean> {
    //     const p = new Promise((a, r) => {

    //     }).catch(e => {
    //         e => 
    //     });
    // }

    private static _loadImage(source: string, accept: (image: HTMLImageElement) => void, reject: RejectFn, ...fallback: string[]): void {
        const img = new Image();
        const sources = [...fallback];
        img.addEventListener('load', e => {
            console.info(`Loaded image "${source}".`)
            accept(img);
            return;
        });
        img.addEventListener('error', e => {
            const next_source = sources.shift();
            if (next_source === undefined) {
                reject(`Failed to load image "${source}".`);
                return;
            }
            console.debug(`Attempting to load image "${next_source}" as "${source}"...`)
            img.src = next_source;
        });
        console.debug(`Attempting to load image "${source}"...`)
        img.src = source;
    }

    private static _loadSound(source: string, accept: (sound: Howl) => void, reject: RejectFn, ...fallback: string[]): void {
        console.debug(`Attempting to load sound "${source}"...`);
        const sources = [...fallback];
        const opts: HowlOptions = {
            src: source,
            html5: true,
            preload: true,
            onload: () => accept(sound),
        };
        function onloaderror(id: number, e: unknown) {
            console.error(`Failed loading sound "${source}" (${id}): ${e}...`)
            const next_source = sources.shift();
            if (next_source === undefined) {
                reject(e);
                return;
            }
            opts.src = next_source;
            sound = new Howl(opts)
        }
        opts.onloaderror = onloaderror;
        let sound = new Howl(opts);
    }

    private static LoadAsset(asset: AssetEntry, increment = true): Promise<void> {
        return new Promise((resolve, reject) => {
            switch (asset.type) {
                case AssetType.Image:
                    this._loadImage(asset.source, (image: HTMLImageElement) => {
                        if (increment) this.assetsLoaded++;
                        this.imageAssets.set(asset.source, image);
                        asset.resolve?.(image)
                        resolve();
                    }, reject, ...asset.fallback);
                    break;

                case AssetType.Sound:
                    this._loadSound(asset.source, (sound: Howl) => {
                        if (increment) this.assetsLoaded++;
                        this.soundAssets.set(asset.source, sound);
                        asset.resolve?.(sound);
                        resolve();
                    }, reject, ...asset.fallback);
                    break;
            
                default:
                    break;
            }
        });
    }
}