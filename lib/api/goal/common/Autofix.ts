/*
 * Copyright © 2018 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    AutofixProgressReporter,
    executeAutofixes,
} from "../../../api-helper/listener/executeAutofixes";
import { LogSuppressor } from "../../../api-helper/log/logInterpreters";
import { AutofixGoal } from "../../machine/wellKnownGoals";
import { AutofixRegistration } from "../../registration/AutofixRegistration";
import { CodeTransform } from "../../registration/CodeTransform";
import { Goal } from "../Goal";
import { DefaultGoalNameGenerator } from "../GoalNameGenerator";
import {
    FulfillableGoalDetails,
    FulfillableGoalWithRegistrations,
    getGoalDefinitionFrom,
} from "../GoalWithFulfillment";

/**
 * Goal that performs autofixes: For example, linting and adding license headers.
 */
export class Autofix extends FulfillableGoalWithRegistrations<AutofixRegistration> {

    constructor(private readonly goalDetailsOrUniqueName: FulfillableGoalDetails | string = DefaultGoalNameGenerator.generateName("autofix"),
                ...dependsOn: Goal[]) {

        super({
            ...AutofixGoal.definition,
            ...getGoalDefinitionFrom(goalDetailsOrUniqueName, DefaultGoalNameGenerator.generateName("autofix")),
            displayName: "autofix",
        }, ...dependsOn);

        this.addFulfillment({
            name: `autofix-${this.definition.uniqueName}`,
            logInterpreter: LogSuppressor,
            goalExecutor: executeAutofixes(this.registrations),
            progressReporter: AutofixProgressReporter,
        });
    }

    public withTransform(transform: CodeTransform<any>) {
        this.with({
            name: DefaultGoalNameGenerator.generateName("autofix-transform"),
            transform,
        });
    }
}
