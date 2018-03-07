import { Goals } from "../../goals/Goal";
import { GoalSetter, GoalSetterInvocation, PushTest } from "../GoalSetter";
import { allSatisfied } from "./pushTestUtils";

/**
 * GoalSetter wholly driven by one or more PushTest instances.
 * Always returns the same phases
 */
export class GuardedPhaseCreator implements GoalSetter {

    public guard: PushTest;

    /**
     * Create a GoalSetter that will always return the same phases if the guards
     * match
     * @param {Goals} phases phases to return if the guards return OK
     * @param {PushTest} guard1
     * @param {PushTest} guards
     */
    constructor(private phases: Goals, guard1: PushTest, ...guards: PushTest[]) {
        this.guard = allSatisfied(guard1, ...guards);
    }

    public async createPhases(pi: GoalSetterInvocation): Promise<Goals | undefined> {
        return this.phases;
    }
}

/**
 * Simple GoalSetter DSL
 * @param {PushTest} guard1
 * @param {PushTest} guards
 */
export function whenPushSatisfies(guard1: PushTest, ...guards: PushTest[]): { setGoals(phases: Goals): GoalSetter } {
    return {
        setGoals(phases) {
            return new GuardedPhaseCreator(phases, guard1, ...guards);
        },
    };
}
