declare module "*.geojson" {
    import type { FeatureCollection } from "geojson";

    const collection: FeatureCollection;

    export default collection;
}
