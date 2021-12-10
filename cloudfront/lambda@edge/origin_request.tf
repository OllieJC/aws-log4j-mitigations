provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

data "archive_file" "lambda_zip_origin_request" {
  type        = "zip"
  output_path = "lambda_zip_file_int_1.zip"
  source {
    content  = file("../../faas_code/index.js")
    filename = "index.js"
  }
}

resource "aws_lambda_function" "origin_request" {
  filename         = data.archive_file.lambda_zip_origin_request.output_path
  source_code_hash = data.archive_file.lambda_zip_origin_request.output_base64sha256
  handler          = "index.handler"

  function_name = "lambda-at-edge-origin_request"

  runtime = "nodejs12.x"

  role = aws_iam_role.lambda_edge_exec.arn

  # us-east-1 is important, this is where Lambda@Edge are deployed from:
  provider = aws.us_east_1

  # versions are required, so publish needs to be true:
  publish = true

  # Lambda@Edge doesn't support environment variables.
}

resource "aws_iam_role" "lambda_edge_exec" {
  name = "lambda_edge_exec"

  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Action" : "sts:AssumeRole",
        "Principal" : {
          "Service" : [
            "edgelambda.amazonaws.com",
            "lambda.amazonaws.com"
          ]
        },
        "Effect" : "Allow"
      }
    ]
  })

  inline_policy {
    name = "inline_policy"

    policy = jsonencode({
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Action" : [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents"
          ],
          "Resource" : "arn:aws:logs:*:*:*",
          "Effect" : "Allow"
        }
      ]
    })
  }
}
