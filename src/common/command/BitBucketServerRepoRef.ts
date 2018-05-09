import { ProviderType } from "@atomist/automation-client/operations/common/RepoId";
import { ProjectOperationCredentials } from "@atomist/automation-client/operations/common/ProjectOperationCredentials";
import { logger } from "@atomist/automation-client";
import { ActionResult, successOn } from "@atomist/automation-client/action/ActionResult";

import axios from "axios";
import { Configurable } from "@atomist/automation-client/project/git/Configurable";
import { isBasicAuthCredentials } from "@atomist/automation-client/operations/common/BasicAuthCredentials";
import { encode } from "../../util/misc/base64";
import { AbstractRemoteRepoRef } from "./AbstractRemoteRepoRef";

export class BitBucketServerRepoRef extends AbstractRemoteRepoRef {

    private readonly ownerType: string;

    /**
     * Construct a new BitBucketServerRepoRef
     * @param {string} remoteBase remote base, including scheme
     * @param {string} owner
     * @param {string} repo
     * @param {boolean} isProject
     * @param {string} sha
     * @param {string} path
     */
    constructor(remoteBase: string,
                owner: string,
                repo: string,
                private isProject: boolean = true,
                sha: string = "master",
                path?: string) {
        super(ProviderType.bitbucket, remoteBase, owner, repo, sha, path);
        this.ownerType = isProject ? "projects" : "users";
        logger.info("Constructed BitBucketServerRepoRef: %j", this);
    }

    public createRemote(creds: ProjectOperationCredentials, description: string, visibility): Promise<ActionResult<this>> {
        const url = `${this.scheme}${this.apiBase}/${this.apiBasePathComponent}`;
        const data = {
            name: this.repo,
            scmId: "git",
            forkable: "true",
        };
        const hdrs = headers(creds);
        logger.info("Making request to BitBucket '%s' to create repo, data=%j, headers=%j", url, data, hdrs);
        return axios.post(url, data, hdrs)
            .then(axiosResponse => {
                return {
                    target: this,
                    success: true,
                    axiosResponse,
                };
            })
            .catch(error => {
                logger.error("Error attempting to create repository %j: %s", this, error);
                return Promise.reject(error);
            });
    }

    public deleteRemote(creds: ProjectOperationCredentials): Promise<ActionResult<this>> {
        const url = `${this.scheme}${this.apiBase}/${this.apiPathComponent}`;
        logger.debug(`Making request to '${url}' to delete repo`);
        return axios.delete(url, headers(creds))
            .then(axiosResponse => {
                return {
                    target: this,
                    success: true,
                    axiosResponse,
                };
            })
            .catch(err => {
                logger.error(`Error attempting to delete repository: ${err}`);
                return Promise.reject(err);
            });
    }

    public setUserConfig(credentials: ProjectOperationCredentials, project: Configurable): Promise<ActionResult<any>> {
        return Promise.resolve(successOn(this));
    }

    public raisePullRequest(credentials: ProjectOperationCredentials,
                            title: string, body: string, head: string, base: string): Promise<ActionResult<this>> {
        const url = `${this.apiBase}${this.apiPathComponent}/pull-requests`;
        logger.debug(`Making request to '${url}' to raise PR`);
        return axios.post(url, {
            title,
            description: body,
            fromRef: {
                id: head,
            },
            toRef: {
                id: base,
            },
        }, headers(credentials))
            .then(axiosResponse => {
                return {
                    target: this,
                    success: true,
                    axiosResponse,
                };
            })
            .catch(err => {
                logger.error(`Error attempting to raise PR: ${err}`);
                return Promise.reject(err);
            });
    }

    get url() {
        let url: string = `projects/${this.owner}/repos/`;
        if (!this.isProject) {
            url = `users/${this.owner}/repos/`;
        }
        return `${this.scheme}${this.remoteBase}/${url}/${this.repo}`;
    }

    get pathComponent(): string {
        let owernUrlComponent = this.owner;
        if (!this.isProject) {
            owernUrlComponent = `~${this.owner}`;
        }
        return `scm/${owernUrlComponent}/${this.repo}`;
    }

    private get apiBasePathComponent(): string {
        let apiPath: string = `projects/${this.owner}/repos/`;
        if (!this.isProject) {
            apiPath = `projects/~${this.owner}/repos/`;
        }
        return apiPath;
    }

    get apiPathComponent(): string {
        return this.apiBasePathComponent + this.repo;
    }

}

function headers(creds: ProjectOperationCredentials) {
    if (!isBasicAuthCredentials(creds)) {
        throw new Error("Only Basic auth supported: Had " + JSON.stringify(creds));
    }
    const upwd = `${creds.username}:${creds.password}`;
    const encoded = encode(upwd);
    return {
        headers: {
            Authorization: `Basic ${encoded}`,
        },
    };
}
