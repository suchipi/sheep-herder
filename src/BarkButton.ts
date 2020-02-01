import {
  useType,
  useNewComponent,
  Geometry,
  Circle,
  Mouse,
} from "@hex-engine/2d";

export default function BarkButton(onClick: () => void) {
  useType(BarkButton);

  useNewComponent(() =>
    Geometry({
      shape: new Circle(45),
    })
  );

  const mouse = useNewComponent(Mouse);
  mouse.onClick(onClick);
}
