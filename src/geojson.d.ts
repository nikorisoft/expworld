declare module "*.geojson" {
    import { FeatureCollection } from "geojson";

    const collection: FeatureCollection;

    export default collection;
}
