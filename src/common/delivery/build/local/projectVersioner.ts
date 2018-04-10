/*
 * Copyright © 2018 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { GitProject } from "@atomist/automation-client/project/git/GitProject";
import { ProgressLog } from "../../../../spi/log/ProgressLog";
import { ProjectLoader } from "../../../repo/ProjectLoader";
import { ExecuteGoalResult } from "../../goals/goalExecution";
import {
    ExecuteGoalWithLog,
    RunWithLogContext,
} from "../../goals/support/reportGoalError";

export type ProjectVersioner = (p: GitProject, log: ProgressLog) => Promise<any>;

/**
 * Version the project with a build specific version number
 * @param projectLoader used to load projects
 */
export function executeVersioner(projectLoader: ProjectLoader,
                                 projectVersioner: ProjectVersioner): ExecuteGoalWithLog {
    return async (rwlc: RunWithLogContext): Promise<ExecuteGoalResult> => {
        const { credentials, id, context, progressLog } = rwlc;

        return projectLoader.doWithProject({ credentials, id, context, readOnly: true }, async p => {
            return projectVersioner(p, progressLog);
        });
    };
}