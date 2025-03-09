/* tslint:disable */
/* eslint-disable */
import "sst"
declare module "sst" {
  export interface Resource {
    "Events": {
      "name": string
      "type": "sst.aws.Dynamo"
    }
    "MyWeb": {
      "type": "sst.aws.Remix"
      "url": string
    }
  }
}
export {}
