variable "secrets" {
  description = "A maps of secrets to be create for a repo"
  type = map(string)
}

variable "github_owner" {
  description = "owner of github org"
  type = string
}

variable "repo" {
  description = "The name of the github repo"
  type = string
}