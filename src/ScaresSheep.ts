import {
  useType,
  useRootEntity,
  useNewComponent,
  Geometry,
  Circle,
  Point,
  Component,
  useUpdate,
  useDraw,
} from "@hex-engine/2d";
import Sheep from "./Sheep";

export default function ScaresSheep(position: Point) {
  useType(ScaresSheep);

  const radius = 100;

  const geometry = useNewComponent(() =>
    Geometry({
      shape: new Circle(radius),
      position,
    })
  );

  useUpdate((delta) => {
    // @ts-ignore
    const sheep: Array<ReturnType<typeof Sheep> & Component> = useRootEntity()
      .descendants()
      .map((entity) => entity.getComponent(Sheep))
      .filter((comp) => comp != null);

    const scareWorldPos = geometry.worldPosition();

    for (const lamb of sheep) {
      const sheepWorldPos = lamb.worldPosition();

      const sheepPosLocalToScare = sheepWorldPos.subtract(scareWorldPos);

      const sheepIsWithinRange = geometry.shape.containsPoint(
        sheepPosLocalToScare
      );

      if (sheepIsWithinRange) {
        lamb.runFrom(scareWorldPos, delta);
      }
    }
  });

  // useDraw((context) => {
  //   // TODO: looks like this is inheriting the top-left draw from its parent, which doesn't make sense.
  //   // We need to change 2d to the top-left adjustment is *only* made on the last child; not for every ancestor.
  //   context.translate(2.5, 2.5);

  //   context.lineWidth = 1;
  //   context.strokeStyle = "blue";
  //   context.setLineDash([5, 5]);
  //   geometry.shape.draw(context, "stroke");
  // });

  return {
    geometry,
  };
}
