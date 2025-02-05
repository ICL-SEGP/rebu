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

  owners = ["699475929998"]
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

  vpc_id = data.aws_vpc.main.id

  # Allow all outbound traffic
  egress = [
    {
      cidr_blocks = ["0.0.0.0/0"]
      description = null
      from_port   = 0
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      protocol   = "-1"
      security_groups  = []
      self       = false
      to_port    = 0
    },
  ]

  # Allow SSH (port 22)
  ingress = [
    {
      cidr_blocks = ["0.0.0.0/0"]
      description = "Allow SSH"
      from_port   = 22
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      protocol   = "tcp"
      security_groups  = []
      self       = false
      to_port    = 22
    },
    # Allow HTTPS (port 443)
    {
      cidr_blocks = ["0.0.0.0/0"]
      description = "Allow HTTPS"
      from_port   = 443
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      protocol   = "tcp"
      security_groups  = []
      self       = false
      to_port    = 443
    },
    # Allow web service (port 4000)
    {
      cidr_blocks = ["0.0.0.0/0"]
      description = "Allow Web Service"
      from_port   = 4000
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      protocol   = "tcp"
      security_groups  = []
      self       = false
      to_port    = 4000
    },
    # Allow PostgreSQL standard port (5432)
    {
      cidr_blocks = ["0.0.0.0/0"]
      description = "Allow PostgreSQL"
      from_port   = 5432
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      protocol   = "tcp"
      security_groups  = []
      self       = false
      to_port    = 5432
    },
    # Allow PostgreSQL high port (32768)
    {
      cidr_blocks = ["0.0.0.0/0"]
      description = "Allow PostgreSQL high port"
      from_port   = 32768
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      protocol   = "tcp"
      security_groups  = []
      self       = false
      to_port    = 32768
    }
  ]

  name        = "launch-wizard-2"
  name_prefix = null
  tags        = {}
  tags_all    = {}
}