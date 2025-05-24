# bedrock-application-inference-sample

```bash
pnpm install
```

us-west-2で初めてCDKを利用する場合、CDKの初回手順が必要
```bash
export AWS_REGION="us-west-2"
# please assume a role in your AWS account
npx cdk bootstrap
```

AWSリソースのデプロイ
```bash
npx cdk deploy
```

アプリケーション推論プロファイルの作成
```bash
aws bedrock list-inference-profiles \
  --region 'us-west-2' \
  --type-equals 'APPLICATION' \
  --no-cli-pager
```


```bash
export AWS_REGION="us-west-2"
export AWS_PROFILE="cline"
export CLAUDE_CODE_USE_BEDROCK=1
export ANTHROPIC_MODEL="arn:aws:bedrock:us-west-2:111111111111:application-inference-profile/q6njv38y5u8s" && claude --verbose --debug -p hello
```


