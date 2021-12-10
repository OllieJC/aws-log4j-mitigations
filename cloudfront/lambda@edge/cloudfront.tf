resource "aws_cloudfront_distribution" "distribution" {

  # ...

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD"]
    compress         = true
    target_origin_id = local.origin_id

    viewer_protocol_policy = "redirect-to-https"

    origin_request_policy_id = aws_cloudfront_origin_request_policy.cf_dynamic_rp.id
    cache_policy_id          = aws_cloudfront_cache_policy.cf_dynamic_cp.id

    lambda_function_association {
      event_type = "origin-request"
      lambda_arn = aws_lambda_function.origin_request.qualified_arn
      include_body = true
    }
  }
}
