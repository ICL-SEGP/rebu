module "compose" {
  source           = "../../modules/cloud/aws/compute/compose"
  private_key_path = "${path.module}/private_key.pem"
}

module "github_secrets" {
  source = "../../modules/integrations/github/secrets"
  secrets = {
    "PRIVATE_KEY"           = module.compose.private_key,
    "AWS_ACCESS_KEY_ID"     = var.aws_access_key_id,
    "AWS_SECRET_ACCESS_KEY" = var.aws_secret_access_key,
    "GH_PAT"                = var.gh_pat,
    "AGE_KEY"               = var.age_key
  }

  repo = "rebu"
  github_owner = "ICL-SEGP"
}

output "instance_ssh_command" {
  value = module.compose.ssh_command
}
