/* This file is auto-generated by SST. Do not edit. */
/* tslint:disable */
/* eslint-disable */
/* deno-fmt-ignore-file */

declare module "sst" {
  export interface Resource {
    "GTAG_ID": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "Kiddobash": {
      "name": string
      "type": "sst.aws.Dynamo"
    }
    "KiddobashEmail": {
      "configSet": string
      "sender": string
      "type": "sst.aws.Email"
    }
    "KiddobashEmailReceiver": {
      "name": string
      "type": "sst.aws.Bucket"
    }
    "KiddobashWeb": {
      "type": "sst.aws.React"
      "url": string
    }
  }
}
/// <reference path="sst-env.d.ts" />

import "sst"
export {}