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

import { logger } from "@atomist/automation-client";
import { SoftwareDeliveryMachine } from "../../../blueprint/SoftwareDeliveryMachine";
import { MavenFingerprinter } from "../../../common/delivery/code/fingerprint/maven/MavenFingerprinter";
import { CheckstyleReviewerRegistration } from "../../../common/delivery/code/review/checkstyle/checkstyleReviewer";
import { AddAtomistJavaHeader } from "../../blueprint/code/autofix/addAtomistHeader";

export interface JavaSupportOptions {
   useCheckstyle: boolean;
}

/**
 * Configuration common to Java SDMs, wherever they deploy
 * @param {SoftwareDeliveryMachine} softwareDeliveryMachine
 * @param {{useCheckstyle: boolean}} opts
 */
export function addJavaSupport(softwareDeliveryMachine: SoftwareDeliveryMachine, opts: JavaSupportOptions) {
    if (opts.useCheckstyle) {
        const checkStylePath = process.env.CHECKSTYLE_PATH;
        if (!!checkStylePath) {
            softwareDeliveryMachine.addReviewerRegistrations(CheckstyleReviewerRegistration);
        } else {
            logger.warn("Skipping Checkstyle; to enable it, set CHECKSTYLE_PATH env variable to the location of a downloaded checkstyle jar");
        }
    }

    softwareDeliveryMachine
        .addFingerprinters(new MavenFingerprinter())
        .addAutofixes(AddAtomistJavaHeader);
}
