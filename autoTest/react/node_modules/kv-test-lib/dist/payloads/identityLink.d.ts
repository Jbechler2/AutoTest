import { IdentityLink } from "../interfaces";
import { KochavaInstance } from "../kochava";
import { PostStartBody, PreStartBody } from "./payload";
import { IdLinkJob } from "../jobqueue";
export declare const constructPreStart: (instance: KochavaInstance, idLink: IdentityLink) => PreStartBody;
export declare const constructPostStart: (instance: KochavaInstance, preStartBody: PreStartBody) => PostStartBody;
export declare const send: (instance: KochavaInstance, job: IdLinkJob) => Promise<boolean>;
