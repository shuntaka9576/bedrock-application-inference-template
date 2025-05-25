import bedrock from "@cdklabs/generative-ai-cdk-constructs/lib/cdk-lib/bedrock/index.js";
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { pascalCase } from "change-case";
import type { Construct } from "constructs";
import { config } from "./config.js";

export class MainStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const sonnet4ModelId = "anthropic.claude-sonnet-4-20250514-v1:0";
		// const sonnet3ModelId = "anthropic.claude-3-7-sonnet-20250219-v1:0";
		const modelId = sonnet4ModelId;

		const model = new bedrock.BedrockFoundationModel(modelId, {
			supportsAgents: true,
			supportsCrossRegion: true,
			optimizedForAgents: false,
		});

		const cris = bedrock.CrossRegionInferenceProfile.fromConfig({
			geoRegion: bedrock.CrossRegionInferenceProfileRegion.US,
			model,
		});

		for (const team of config.teams) {
			for (const member of team.members) {
				const prefix = `${team.name}-${member.name}`;
				const idPrefix = pascalCase(prefix);

				// ─── AIP ───────────────────────────────────────────────
				const aip = new bedrock.ApplicationInferenceProfile(
					this,
					`${idPrefix}Aip`,
					{
						inferenceProfileName: `sonnet4-${team.name}-${member.name}`,
						modelSource: cris,
						tags: [
							{ key: "team", value: team.name },
							{ key: "name", value: member.name },
							{ key: "email", value: member.email },
						],
					},
				);

				// ─── 共通ポリシー定義 ────────────────────────────────
				const bedrockPolicy = new iam.PolicyDocument({
					statements: [
						new iam.PolicyStatement({
							effect: iam.Effect.ALLOW,
							actions: [
								"bedrock:InvokeModel",
								"bedrock:InvokeModelWithResponseStream",
							],
							resources: [aip.inferenceProfileArn],
						}),
						new iam.PolicyStatement({
							effect: iam.Effect.ALLOW,
							actions: [
								"bedrock:InvokeModel",
								"bedrock:InvokeModelWithResponseStream",
							],
							resources: [
								`arn:aws:bedrock:us-east-1::foundation-model/${modelId}`,
								`arn:aws:bedrock:us-east-2::foundation-model/${modelId}`,
								`arn:aws:bedrock:us-west-2::foundation-model/${modelId}`,
							],
							conditions: {
								StringLike: {
									"bedrock:InferenceProfileArn": aip.inferenceProfileArn,
								},
							},
						}),
					],
				});

				// ─── IAM User（プログラムアクセスのみ） ─────────────
				const user = new iam.User(this, `${idPrefix}User`, {
					userName: `${prefix}-bedrock`,
				});
				user.attachInlinePolicy(
					new iam.Policy(this, `${idPrefix}Policy`, {
						document: bedrockPolicy,
					}),
				);

				// ─── アクセスキー生成 & Secret 化 ───────────────────
				const accessKey = new iam.AccessKey(this, `${idPrefix}Key`, { user });

				new secretsmanager.Secret(this, `${idPrefix}Creds`, {
					description: `Bedrock API creds for ${team.name}/${member.name}`,
					secretObjectValue: {
						AccessKeyId: cdk.SecretValue.unsafePlainText(accessKey.accessKeyId),
						SecretAccessKey: accessKey.secretAccessKey,
					},
				});
			}
		}
	}
}
