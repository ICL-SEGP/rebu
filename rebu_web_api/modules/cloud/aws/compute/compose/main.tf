terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "4.0.6"
    }
    local = {
      source  = "hashicorp/local"
      version = "2.5.2"
    }
  }
}

data "aws_vpc" "main" {
  filter {
    name   = "isDefault"
    values = ["true"]
  }
}

data "aws_subnets" "main_subnets" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.main.id]
  }
}

data "aws_ami" "amazon_linux_docker" {
  most_recent = true

  filter {
    name   = "name"
    values = ["amazon-linux-docker*"]
  }

  owners = ["280759493520"]
}

resource "tls_private_key" "key" {
  algorithm = "RSA"
  rsa_bits  = "4096"
}

resource "local_sensitive_file" "private_key" {
  filename        = var.private_key_path
  content         = tls_private_key.key.private_key_pem
  file_permission = "0400"
}

resource "aws_key_pair" "service_key" {
  key_name   = "new-key"
  public_key = tls_private_key.key.public_key_openssh
}

resource "aws_instance" "web_server_segp" {
  ami               = data.aws_ami.amazon_linux_docker.id
  availability_zone = "eu-west-1c"
  instance_type     = "t2.micro"
  key_name          = aws_key_pair.service_key.key_name
  subnet_id         = data.aws_subnets.main_subnets.ids[0]
  tags = {
    "Name" = "web-server-segp"
  }
  vpc_security_group_ids = [
    aws_security_group.compose_sg.id
  ]
}

resource "aws_security_group" "compose_sg" {
  description = "launch-wizard-2 created 2025-01-23T16:47:40.863Z"
  egress = [
    {
      cidr_blocks = [
        "0.0.0.0/0",
      ]
      description      = null
      from_port        = 0
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      protocol         = "-1"
      security_groups  = []
      self             = false
      to_port          = 0
    },
  ]
  ingress = [
    {
      cidr_blocks = [
        "0.0.0.0/0",
      ]
      description      = null
      from_port        = 22
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      protocol         = "tcp"
      security_groups  = []
      self             = false
      to_port          = 22
    },
    {
      cidr_blocks = [
        "0.0.0.0/0",
      ]
      description      = null
      from_port        = 443
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      protocol         = "tcp"
      security_groups  = []
      self             = false
      to_port          = 443
    },
    {
      cidr_blocks = [
        "0.0.0.0/0",
      ]
      description      = null
      from_port        = 4000
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      protocol         = "tcp"
      security_groups  = []
      self             = false
      to_port          = 4000
    },
  ]
  name        = "launch-wizard-2"
  name_prefix = null
  tags        = {}
  tags_all    = {}
  vpc_id      = data.aws_vpc.main.id
}
