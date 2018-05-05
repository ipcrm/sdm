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

import { PushImpactListenerInvocation } from "../../listener/PushImpactListener";
import { PushTest } from "../../listener/PushTest";

/**
 * A code action response that affects delivery:
 * failing the current flow or requiring approval.
 */
export enum PushReactionResponse {
    failGoals = "fail",
    requireApprovalToProceed = "requireApproval",
}

/**
 * Optional PushReactionResponse included in a return value.
 */
export interface HasCodeActionResponse {
    response?: PushReactionResponse;
}

/**
 * Reaction on a push, with the code available.
 * Can optionally return a response that
 * determines whether to ask for approval or terminate current delivery flow.
 */
export type PushReaction<R> = (i: PushImpactListenerInvocation) => Promise<R & HasCodeActionResponse>;

/**
 * Used to register actions on a push that can return any type.
 * Use ReviewerRegistration if you want to return a structured type.
 */
export interface PushReactionRegistration<R = any> {

    name: string;

    pushTest?: PushTest;

    action: PushReaction<R>;
}

/**
 * Base options object for registrations that process selective files
 */
export interface SelectiveCodeActionOptions {

    /**
     * Run only on affected files?
     */
    considerOnlyChangedFiles: boolean;
}

/**
 * Compute the relevant actions for this push
 */
export function relevantCodeActions<R>(registrations: Array<PushReactionRegistration<R>>,
                                       cri: PushImpactListenerInvocation): Promise<Array<PushReactionRegistration<R>>> {
    return Promise.all(
        registrations.map(async t => (!t.pushTest || await t.pushTest.valueForPush(cri)) ? t : undefined))
        .then(elts => elts.filter(x => !!x));
}