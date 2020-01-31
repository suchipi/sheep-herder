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
} from "@hex-engine/2d";
import ScaresSheep from "./ScaresSheep";
import BarkButton from "./BarkButton";

export default function Dog(position: Point) {
  useType(Dog);

  const radius = 10;

  const geometry = useNewComponent(() =>
    Geometry({
      shape: new Circle(radius),
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

  const halfSize = new Point(radius, radius);
  const zeroPoint = new Point(0, 0);
  const speed = 5;

  const gamepad = useNewComponent(() => Gamepad({}));

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
    } else {
      physics.setVelocity(zeroPoint);
    }

    // Never rotate the physics body, cause that messes up our setVelocity stuff.
    physics.setAngle(0);
    physics.setAngularVelocity(0);
  });

  useDraw((context) => {
    context.fillStyle = "red";
    geometry.shape.draw(context, "fill");

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
  });

  const scaresSheep = useChild(() => ScaresSheep(new Point(0, 0)))
    .rootComponent;

  function bark() {
    const originalShape = scaresSheep.geometry.shape;
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
