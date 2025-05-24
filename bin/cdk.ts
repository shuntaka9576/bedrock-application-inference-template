#!/usr/bin/env node
import "source-map-support/register.js";
import * as cdk from "aws-cdk-lib";
import { kebabCase } from "change-case";
import { MainStack } from "../lib/main-stack.js";
const app = new cdk.App();

new MainStack(app, kebabCase(MainStack.name));
