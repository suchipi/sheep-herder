import {
  useType,
  useNewComponent,
  Geometry,
  Circle,
  Vector,
  Physics,
  useDraw,
  useUpdate,
  Timer,
} from "@hex-engine/2d";

export default function Sheep(position: Vector) {
  useType(Sheep);

  const radius = 15;
  const geometry = useNewComponent(() =>
    Geometry({
      shape: new Circle(radius),
      position,
    })
  );

  const physics = useNewComponent(() =>
    Physics.Body(geometry, { frictionAir: 0.1 })
  );

  const wanderSpeed = 1;
  const runSpeed = 4;
  const zeroPoint = new Vector(0, 0);

  const scareWearOffTimer = useNewComponent(Timer);

  const wanderTimer = useNewComponent(Timer);
  const wanderTarget = new Vector(0, 0);

  useUpdate((delta) => {
    const isScared = !scareWearOffTimer.hasReachedSetTime();

    if (!isScared && wanderTimer.hasReachedSetTime()) {
      wanderTimer.setToTimeFromNow(Math.random() * 500 + 1000);

      const wanderDistance = wanderSpeed + 2;
      const x = Math.random() * wanderDistance * 2 - wanderDistance;
      const y = Math.random() * wanderDistance * 2 - wanderDistance;
      wanderTarget.mutateInto({ x, y });
    }

    if (!isScared) {
      // Wander around
      const force = wanderTarget.clone();
      if (force.magnitude > wanderSpeed) {
        force.magnitude = 0.1 * wanderSpeed * delta;
        physics.setVelocity(force);
      } else {
        physics.setVelocity(zeroPoint);
      }
    }

    // Never rotate the physics body, cause that messes up our setVelocity stuff.
    physics.setAngle(0);
    physics.setAngularVelocity(0);
  });

  useDraw((context) => {
    // const isScared = !scareWearOffTimer.hasReachedSetTime();

    // if (isScared) {
    //   context.fillStyle = "magenta";
    // } else {
    context.fillStyle = "#eee";
    // }
    geometry.shape.draw(context, "fill");
  });

  return {
    worldPosition: geometry.worldPosition,
    runFrom(worldPoint: Vector, delta: number) {
      scareWearOffTimer.setToTimeFromNow(Math.random() * 2000 + 1000);

      const ownWorldPos = geometry.worldPosition();
      const localPointToRunFrom = worldPoint.subtract(ownWorldPos);

      const force = localPointToRunFrom.clone();

      // Rotate the angle PI radians so they run *away* from the thing instead of towards it
      force.rotateMutate(Math.PI);

      if (force.magnitude > runSpeed) {
        force.magnitude = 0.1 * runSpeed * delta;
        physics.setVelocity(force);
      } else {
        physics.setVelocity(zeroPoint);
      }
    },
  };
}
