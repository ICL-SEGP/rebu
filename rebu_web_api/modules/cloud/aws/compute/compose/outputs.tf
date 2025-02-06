output "ssh_command" {
  value = format(
    "ssh -i %s ec2-user@%s",
    var.private_key_path,
    aws_instance.web_server_segp.public_ip
  )
  description = "The SSH command to connect to the instance."
}

output "private_key" {
  value = local_sensitive_file.private_key.content
  sensitive = true
  description = "SSH private key to connect to instance"
}