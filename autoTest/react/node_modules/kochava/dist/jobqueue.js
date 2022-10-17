/*
  Authored by Brett Barinaga on 11/17/21.
  Copyright (c) Kochava, Inc. All rights reserved.
*/
import * as Event from "./payloads/event";
import * as IdLink from "./payloads/identityLink";
import { Log } from "./utils/log";
import { uuidv4 } from "./utils/utils";
import { addToPersistedEventQueue, PersistKey, removeFromEventPersistedQueue, removeFromIdLinkPersistedQueue, updateOrAddPersistedIdLinkQueue, updatePersistedValue } from "./browser/persist";
function jobIsEventJob(obj) {
    return 'eventName' in obj;
}
function jobIsIdLinkJob(obj) {
    return 'idLink' in obj;
}
export default class JobQueue {
    constructor() {
        this.eventQueue = [];
        this.idLinkQueue = [];
        this.processing = false;
        this.stopped = false;
        this.paused = false;
    }
    async start(instance) {
        this.eventQueue = JSON.parse(localStorage.getItem(PersistKey.EventQueue)) || [];
        this.idLinkQueue = JSON.parse(localStorage.getItem(PersistKey.IdLinkQueue)) || [];
        this.updateEventJobs(instance);
        this.updateIdLinkJobs(instance);
        Log.trace("Starting Event Queue", JSON.parse(JSON.stringify(this.eventQueue)));
        Log.trace("Starting IdLink Queue", JSON.parse(JSON.stringify(this.idLinkQueue)));
        this.stopped = false;
        this.paused = false;
        await this.dequeueJob(instance);
    }
    stop() {
        this.stopped = true;
        if (this.timeOut)
            clearTimeout(this.timeOut);
        this.processing = false;
    }
    pause() {
        this.paused = true;
    }
    async enqueueEvent(instance, args) {
        const eventName = args[0];
        const eventData = args[1];
        const eventPreStartBody = Event.constructPreStart(instance, eventName, eventData);
        if (instance.installDone && instance.kvinitDone) {
            const postStartBody = Event.constructPostStart(instance, eventPreStartBody);
            const newJob = {
                id: uuidv4(),
                queuedBeforeStart: false,
                preStartBody: eventPreStartBody,
                postStartBody,
                retries: 0,
                eventName,
            };
            this.eventQueue.push(newJob);
            addToPersistedEventQueue(newJob);
            await this.dequeueJob(instance);
            return;
        }
        const newEventJob = {
            id: uuidv4(),
            queuedBeforeStart: true,
            preStartBody: eventPreStartBody,
            postStartBody: undefined,
            retries: 0,
            eventName,
        };
        this.eventQueue.push(newEventJob);
        addToPersistedEventQueue(newEventJob);
    }
    async enqueueIdLink(instance, idLink) {
        const idLinkPreStartBody = IdLink.constructPreStart(instance, idLink);
        if (instance.installDone && instance.kvinitDone) {
            const postStartBody = IdLink.constructPostStart(instance, idLinkPreStartBody);
            const newJob = {
                id: uuidv4(),
                queuedBeforeStart: false,
                preStartBody: idLinkPreStartBody,
                postStartBody,
                retries: 0,
                idLink,
            };
            updateOrAddPersistedIdLinkQueue(newJob);
            this.idLinkQueue.push(newJob);
            await this.dequeueJob(instance);
            return;
        }
        const newJob = {
            id: uuidv4(),
            queuedBeforeStart: true,
            preStartBody: idLinkPreStartBody,
            postStartBody: undefined,
            retries: 0,
            idLink,
        };
        updateOrAddPersistedIdLinkQueue(newJob);
        this.idLinkQueue.push(newJob);
    }
    async dequeueJob(instance) {
        // If queue is busy, prev job not finished
        if (this.processing)
            return false;
        // If the queue is paused, do not dequeue a new job
        if (this.paused)
            return false;
        // If the queue is stopped do not dequeue a new job
        if (this.stopped) {
            return false;
        }
        // Prioritize sending identityLinks first
        // Remove first job from queue
        const idLinkJob = this.idLinkQueue.shift();
        if (idLinkJob) {
            // handle idlinkjob
            Log.trace("Dequeued Job: ", idLinkJob);
            this.processing = true;
            const result = await this.processJob(instance, idLinkJob);
            if (this.stopped) {
                return true;
            }
            this.processing = false;
            // If the job succeeded, dequeue the next job
            if (result) {
                removeFromIdLinkPersistedQueue(idLinkJob);
                return await this.dequeueJob(instance);
            }
        }
        const eventJob = this.eventQueue.shift();
        if (eventJob) {
            //handle eventJob
            Log.trace("Dequeued Job: ", eventJob);
            // Process the job
            this.processing = true;
            const result = await this.processJob(instance, eventJob);
            if (this.stopped) {
                return true;
            }
            this.processing = false;
            // If the job succeeded, dequeue the next job
            if (result) {
                removeFromEventPersistedQueue(eventJob);
                return await this.dequeueJob(instance);
            }
        }
        // If neither queue had a job, break out of recursion
        if (!idLinkJob && !eventJob)
            return false;
        return true;
    }
    async processJob(instance, job) {
        if (jobIsEventJob(job)) {
            for (const denyName of instance.kochavaConfig.privacy.deny_event_names) {
                if (denyName === job.eventName) {
                    Log.debug(`Denied event_name ${denyName}, dropping request.`);
                    return true;
                }
            }
        }
        else if (jobIsIdLinkJob(job)) {
            for (const denyIdLinkKey of instance.kochavaConfig.privacy.deny_identity_links) {
                if (denyIdLinkKey === Object.keys(job.idLink)[0]) {
                    Log.debug(`Denied identity_link ${denyIdLinkKey}, dropping request.`);
                    return true;
                }
            }
        }
        let success = false;
        do {
            success = await this.attemptJob(instance, job);
            // If our job succeeded
            if (success) {
                // Job Done
                Log.trace("Job processed successfully:", job);
                return true;
            }
            // If it didnt succeed, but we our queue isnt stopped
            if (!this.stopped) {
                //retry the job
                const retryWaterfall = instance.kochavaConfig.networking.retry_waterfall;
                const retryIndex = (job.retries > retryWaterfall.length - 1) ?
                    retryWaterfall.length - 1 : job.retries;
                const retrySec = retryWaterfall[retryIndex];
                Log.error(`Job failed, attempting again in ${retrySec} seconds`);
                await new Promise(resolve => this.timeOut = setTimeout(resolve, retrySec * 1000));
                job.retries++;
            }
        } while (!success && !this.stopped);
        // Job Canceled
        return true;
    }
    async attemptJob(instance, job) {
        if (job.preStartBody.action === "event")
            return await Event.send(instance, job.preStartBody, job.postStartBody);
        else if (job.preStartBody.action === "identityLink")
            return await IdLink.send(instance, job);
        else {
            Log.warn("Invalid action in job from jobqueue, cancelling.");
            return true;
        }
    }
    updateEventJobs(instance) {
        for (const job of this.eventQueue) {
            if (job.queuedBeforeStart) {
                job.postStartBody = Event.constructPostStart(instance, job.preStartBody);
            }
        }
        updatePersistedValue(PersistKey.EventQueue, JSON.stringify(this.eventQueue), false);
    }
    updateIdLinkJobs(instance) {
        for (const job of this.idLinkQueue) {
            if (job.queuedBeforeStart) {
                job.postStartBody = IdLink.constructPostStart(instance, job.preStartBody);
            }
        }
        updatePersistedValue(PersistKey.IdLinkQueue, JSON.stringify(this.idLinkQueue), false);
    }
}
