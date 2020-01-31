import {
  useType,
  useNewComponent,
  Geometry,
  Circle,
  Point,
  Physics,
  useDraw,
  Mouse,
  LowLevelMouse,
  useUpdate,
  Vector,
  useChild,
  Gamepad,
  Aseprite,
  Angle,
} from "@hex-engine/2d";
import ScaresSheep from "./ScaresSheep";
import BarkButton from "./BarkButton";
import borderCollie from "./border-collie.aseprite";

export default function Dog(position: Point) {
  useType(Dog);

  const aseprite = useNewComponent(() => Aseprite(borderCollie));

  const geometry = useNewComponent(() =>
    Geometry({
      shape: new Circle(10),
      position,
    })
  );

  const physics = useNewComponent(() =>
    Physics.Body(geometry, { frictionAir: 0.1 })
  );

  // We use LowLevelMouse to get whether the user is pressing,
  // because Mouse's isPressingLeft property only gets set to
  // true if the left press started within the Entity's bounds.
  const lowLevelMouse = useNewComponent(LowLevelMouse);

  // But we're using Mouse to get the mouse position, because
  // it factors in the geometry position updating in-between
  // mousemove events (and LowLevelMouse doesn't).
  const mouse = useNewComponent(Mouse);

  let isPressing = false;
  lowLevelMouse.onMouseDown(() => (isPressing = true));
  lowLevelMouse.onMouseUp(() => (isPressing = false));

  const size = new Point(geometry.shape.width, geometry.shape.height);
  const halfSize = size.divide(2);
  const zeroPoint = new Point(0, 0);
  const speed = 5;

  const gamepad = useNewComponent(() => Gamepad({}));
  const facing = new Angle(Math.PI / 4);

  useUpdate((delta) => {
    let movement: Vector | null = null;
    if (isPressing) {
      const potentialMovement = Vector.fromPoints(zeroPoint, mouse.position);
      if (potentialMovement.magnitude > speed) {
        potentialMovement.magnitude = 0.1 * speed * delta;
        movement = potentialMovement;
      }
    }

    if (gamepad.leftStick.magnitude > 0) {
      movement = gamepad.leftStick.clone();
      movement.magnitude = 0.1 * speed * delta;
    }

    if (movement) {
      physics.setVelocity(movement.toPoint());

      const movementWithXInverted = Vector.fromPoints(
        zeroPoint,
        movement.angle.toPoint().multiplyXMutate(-1)
      );
      facing.radians = movementWithXInverted.angle.radians;
    } else {
      physics.setVelocity(zeroPoint);
    }

    // Never rotate the physics body, cause that messes up our setVelocity stuff.
    physics.setAngle(0);
    physics.setAngularVelocity(0);
  });

  useDraw((context) => {
    if (isPressing) {
      const lineStart = halfSize;
      const lineEnd = mouse.position.add(halfSize);

      context.beginPath();
      context.lineWidth = 5;
      context.strokeStyle = "white";
      context.moveTo(lineStart.x, lineStart.y);
      context.lineTo(lineEnd.x, lineEnd.y);
      context.stroke();
    }

    const frameCount = aseprite.currentAnim.frames.length;
    let frameForRotation = Math.floor(
      (facing.radians / (Math.PI * 2)) * frameCount
    );
    frameForRotation -= frameCount / 4;
    frameForRotation = frameForRotation % frameCount;
    if (frameForRotation < 0) {
      frameForRotation = frameCount + frameForRotation;
    }

    aseprite.currentAnim.goToFrame(frameForRotation);

    const offset = aseprite.size
      .subtract(size)
      .divide(2)
      .oppositeMutate();
    context.translate(offset.x, offset.y);
    aseprite.draw(context);
  });

  const scaresSheep = useChild(() => ScaresSheep(new Point(0, 0)))
    .rootComponent;

  const originalShape = scaresSheep.geometry.shape;
  function bark() {
    scaresSheep.geometry.shape = new Circle(originalShape.radius * 2);
    setTimeout(() => {
      scaresSheep.geometry.shape = originalShape;
    }, 100);
  }

  useChild(() => BarkButton(bark));

  let barkButtonPressed = false;
  useUpdate(() => {
    const lastBarkButtonPressed = barkButtonPressed;
    barkButtonPressed = gamepad.pressed.has("cross");

    if (barkButtonPressed && !lastBarkButtonPressed) {
      bark();
    }
  });
}
