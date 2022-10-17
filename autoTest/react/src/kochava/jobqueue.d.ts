import { IdentityLink, Json } from "./interfaces";
import { KochavaInstance } from "./kochava";
import { PostStartBody, PreStartBody } from "./payloads/payload";
export interface Job {
    id: string;
    queuedBeforeStart: boolean;
    preStartBody: PreStartBody;
    postStartBody: PostStartBody;
    retries: number;
}
export interface EventJob extends Job {
    eventName: string;
}
export interface IdLinkJob extends Job {
    idLink: IdentityLink;
}
export default class JobQueue {
    private eventQueue;
    idLinkQueue: IdLinkJob[];
    private processing;
    private stopped;
    private paused;
    private timeOut;
    constructor();
    start(instance: KochavaInstance): Promise<void>;
    stop(): void;
    pause(): void;
    enqueueEvent(instance: KochavaInstance, args: [string, Json | string]): Promise<void>;
    enqueueIdLink(instance: KochavaInstance, idLink: IdentityLink): Promise<void>;
    dequeueJob(instance: KochavaInstance): Promise<boolean>;
    processJob(instance: KochavaInstance, job: EventJob | IdLinkJob): Promise<boolean>;
    attemptJob(instance: KochavaInstance, job: Job): Promise<boolean>;
    updateEventJobs(instance: KochavaInstance): void;
    updateIdLinkJobs(instance: KochavaInstance): void;
}
