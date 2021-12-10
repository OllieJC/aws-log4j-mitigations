resource "aws_cloudfront_function" "filter" {
  name    = "filter"
  runtime = "cloudfront-js-1.0"
  comment = "filter"
  publish = true
  code    = file("../../faas_code/index.js")
}
