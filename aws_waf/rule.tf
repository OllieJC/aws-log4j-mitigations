resource "aws_wafv2_web_acl" "waf_acl" {
  name        = "waf_acl"
  description = "Example of a deploying just Log4JRCE in a WAF"
  scope       = "REGIONAL"
  # scope       = "CLOUDFRONT"

  default_action {
    allow {}
  }

  rule {
    name     = "first_waf_rule"
    priority = 1

    override_action {
      count {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWS-AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"

        # Excluding all these leaves only Log4JRCE

        excluded_rule {
          name = "Host_localhost_HEADER"
        }

        excluded_rule {
          name = "PROPFIND_METHOD"
        }

        excluded_rule {
          name = "ExploitablePaths_URIPATH"
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = false
      metric_name                = "Log4JRCE-blocks"
      sampled_requests_enabled   = false
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = false
    metric_name                = "Log4JRCE-blocks"
    sampled_requests_enabled   = false
  }
}
