import {
  PointerSensor,
  KeyboardSensor,
  PointerActivationConstraints,
} from "@dnd-kit/dom";

/**
 * Pointer sensor tuned to a 5 px movement threshold.
 *
 * Anything below 5 px is treated as a click/tap (e.g. opening a task modal).
 * At 5 px or more the gesture is promoted to a drag and the click is suppressed.
 */
export const pointerSensor = PointerSensor.configure({
  activationConstraints: [
    new PointerActivationConstraints.Distance({ value: 5 }),
  ],
});

export { KeyboardSensor as keyboardSensor };
