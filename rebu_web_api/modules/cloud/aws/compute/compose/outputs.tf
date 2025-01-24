output "ssh_command" {
  value = format(
    "ssh -i %s ec2-user@%s",
    var.private_key_path,
    aws_instance.web_server_segp.public_ip
  )
  description = "The SSH command to connect to the instance."
}
