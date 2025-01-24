module "compose" {
  source = "../../modules/cloud/aws/compute/compose"
  private_key_path = "${path.module}/private_key_pem"
}

output "instance_ssh_command" {
  value = module.compose.ssh_command
}
