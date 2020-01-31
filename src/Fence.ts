import {
  useType,
  useNewComponent,
  Geometry,
  Polygon,
  Point,
  Physics,
  useDraw,
} from "@hex-engine/2d";

export default function Fence(width: number, height: number, position: Point) {
  useType(Fence);

  const geometry = useNewComponent(() =>
    Geometry({
      shape: Polygon.rectangle(width, height),
      position,
    })
  );

  useNewComponent(() => Physics.Body(geometry, { isStatic: true }));

  useDraw((context) => {
    context.fillStyle = "brown";
    geometry.shape.draw(context, "fill");
  });
}
