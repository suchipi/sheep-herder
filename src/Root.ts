import {
  useType,
  useNewComponent,
  useChild,
  Canvas,
  Physics,
  Point,
  useWindowSize,
} from "@hex-engine/2d";
import Dog from "./Dog";
import Sheep from "./Sheep";
import Fence from "./Fence";

export default function Root() {
  useType(Root);

  const canvas = useNewComponent(() =>
    Canvas({ backgroundColor: "limegreen" })
  );

  const { windowSize, onWindowResize } = useWindowSize();

  function resize() {
    let realWidth = 10;
    let realHeight = 10;
    if (windowSize.x >= windowSize.y) {
      realWidth = windowSize.y;
      realHeight = windowSize.y;
    } else {
      realWidth = windowSize.x;
      realHeight = windowSize.x;
    }

    canvas.resize({
      realWidth,
      realHeight,
      pixelWidth: 640,
      pixelHeight: 640,
    });
  }

  onWindowResize(resize);
  resize();

  useNewComponent(() =>
    Physics.Engine({
      gravity: new Point(0, 0),
    })
  );

  const canvasCenter = new Point(
    canvas.element.width / 2,
    canvas.element.height / 2
  );

  useChild(() => Dog(canvasCenter.clone()));

  // Vertical fences
  useChild(() => Fence(25, 640, new Point(12.5, 320)));
  useChild(() => Fence(25, 640, new Point(640 - 12.5, 320)));

  // Horizontal fences
  useChild(() => Fence(640, 25, new Point(320, 12.5)));
  useChild(() => Fence(640, 25, new Point(320, 640 - 12.5)));

  const sheepRow0 = canvasCenter.subtractY(200);

  useChild(() => Sheep(sheepRow0.subtractX(25)));
  useChild(() => Sheep(sheepRow0));
  useChild(() => Sheep(sheepRow0.addX(25)));

  const sheepRow1 = sheepRow0.addY(25);

  useChild(() => Sheep(sheepRow1.subtractX(25)));
  useChild(() => Sheep(sheepRow1));
  useChild(() => Sheep(sheepRow1.addX(25)));

  const sheepRow2 = sheepRow1.addY(25);

  useChild(() => Sheep(sheepRow2.subtractX(25)));
  useChild(() => Sheep(sheepRow2));
  useChild(() => Sheep(sheepRow2.addX(25)));
}
